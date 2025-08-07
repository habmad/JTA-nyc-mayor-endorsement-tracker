import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { rssFeedParser, RSSFeedItem } from './rss-parser';
import { endorsementClassifier } from './data-collection';
import { SourceType } from '../types/database';
import { sql } from '@vercel/postgres';

// Function to save endorsement to database
async function saveEndorsementToDatabase(item: RSSFeedItem, classification: any): Promise<void> {
  try {
    // Check if database is available
    if (!process.env.POSTGRES_URL) {
      console.log('⚠️ Database not configured, skipping endorsement save');
      return;
    }

    // Find candidate by name (simple matching for now)
    const candidateName = classification.candidateMentions[0]?.toLowerCase();
    if (!candidateName) {
      console.log('⚠️ No candidate name found in classification');
      return;
    }

    // Find candidate in database
    const candidateResult = await sql`
      SELECT id FROM candidates 
      WHERE LOWER(name) LIKE ${`%${candidateName}%`}
      LIMIT 1
    `;

    if (candidateResult.rows.length === 0) {
      console.log(`⚠️ Candidate not found: ${candidateName}`);
      return;
    }

    const candidateId = candidateResult.rows[0].id;

    // Find or create endorser
    let endorserId: string;
    const endorserName = item.author || item.source || 'Unknown';
    
    const endorserResult = await sql`
      SELECT id FROM endorsers 
      WHERE LOWER(name) LIKE ${`%${endorserName.toLowerCase()}%`}
      OR LOWER(display_name) LIKE ${`%${endorserName.toLowerCase()}%`}
      LIMIT 1
    `;

    if (endorserResult.rows.length > 0) {
      endorserId = endorserResult.rows[0].id;
    } else {
      // Create new endorser
      const newEndorserResult = await sql`
        INSERT INTO endorsers (
          name, display_name, category, influence_score, is_organization
        ) VALUES (
          ${endorserName}, ${endorserName}, 'media', 50, false
        ) RETURNING id
      `;
      endorserId = newEndorserResult.rows[0].id;
      console.log(`✅ Created new endorser: ${endorserName}`);
    }

    // Check if endorsement already exists
    const existingEndorsement = await sql`
      SELECT id FROM endorsements 
      WHERE endorser_id = ${endorserId} 
      AND candidate_id = ${candidateId}
      AND source_url = ${item.link}
    `;

    if (existingEndorsement.rows.length > 0) {
      console.log(`⏭️ Endorsement already exists: ${endorserName} → ${candidateName}`);
      return;
    }

    // Insert endorsement
    await sql`
      INSERT INTO endorsements (
        endorser_id, candidate_id, source_url, source_type, source_title,
        quote, endorsement_type, sentiment, confidence, strength, endorsed_at
      ) VALUES (
        ${endorserId}, ${candidateId}, ${item.link}, 'website', ${item.title},
        ${item.description}, ${classification.endorsementType}, ${classification.sentiment},
        ${classification.confidence.toString()}, 'standard', ${new Date().toISOString()}
      )
    `;

    console.log(`✅ Saved endorsement: ${endorserName} → ${candidateName} (confidence: ${Math.round(classification.confidence * 100)}%)`);
  } catch (error: any) {
    console.error('❌ Error saving endorsement:', error.message);
    // Don't throw - just log the error and continue
  }
}

// Redis connection with error handling
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
});

// Handle Redis connection errors
redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error.message);
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis ready for commands');
});

redis.on('close', () => {
  console.log('⚠️ Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Queue definitions
export const rssQueue = new Queue('rss-monitoring', { connection: redis });
export const classificationQueue = new Queue('endorsement-classification', { connection: redis });
export const notificationQueue = new Queue('notifications', { connection: redis });

// Job data types
interface RSSJobData {
  checkAll?: boolean;
  feedId?: string;
  timestamp: Date;
}

interface ClassificationJobData {
  rssItems: RSSFeedItem[];
  sourceType: SourceType;
  timestamp: Date;
}

interface NotificationJobData {
  endorsementId: string;
  type: 'new_endorsement' | 'high_confidence' | 'human_review_needed';
  timestamp: Date;
}

// RSS Monitoring Worker
const rssWorker = new Worker('rss-monitoring', async (job: Job<RSSJobData>) => {
  console.log(`Processing RSS job: ${job.id}`);
  
  try {
    let items: RSSFeedItem[] = [];
    
    if (job.data.checkAll) {
      // Check all feeds
      items = await rssFeedParser.checkAllFeeds();
      console.log(`Found ${items.length} items across all feeds`);
    } else if (job.data.feedId) {
      // Check specific feed
      items = await rssFeedParser.checkFeed(job.data.feedId);
      console.log(`Found ${items.length} items in feed ${job.data.feedId}`);
    }
    
    if (items.length > 0) {
      // Add classification job for each item
      try {
        await classificationQueue.add('classify-rss-items', {
          rssItems: items,
          sourceType: 'rss',
          timestamp: new Date()
        }, {
          priority: 5, // High priority for new content
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        });
      } catch (queueError: any) {
        console.error('Failed to add classification job:', queueError.message);
      }
    }
    
    return { success: true, itemsFound: items.length };
  } catch (error: any) {
    console.error('RSS worker error:', error.message);
    // Don't throw, just log the error
    return { success: false, error: error.message };
  }
}, {
  connection: redis,
  concurrency: 5 // Process 5 jobs simultaneously
});

// Handle worker errors
rssWorker.on('error', (error) => {
  console.error('RSS Worker error:', error.message);
});

rssWorker.on('failed', (job, error) => {
  console.error(`RSS Job ${job?.id} failed:`, error.message);
});

// Classification Worker
const classificationWorker = new Worker('endorsement-classification', async (job: Job<ClassificationJobData>) => {
  console.log(`Processing classification job: ${job.id}`);
  
  try {
    const results = [];
    let savedCount = 0;
    
    for (const item of job.data.rssItems) {
      try {
        const text = `${item.title} ${item.description}`;
        
        const classification = await endorsementClassifier.classifyEndorsement({
          text,
          sourceUrl: item.link,
          sourceType: job.data.sourceType,
          author: item.author,
          organization: item.source
        });
        
        // Only process if candidates are mentioned
        if (classification.candidateMentions.length > 0) {
          results.push({
            item,
            classification,
            timestamp: new Date()
          });
          
          // Try to save to database if confidence is high enough
          if (classification.confidence >= 0.6) {
            try {
              await saveEndorsementToDatabase(item, classification);
              savedCount++;
              console.log(`✅ Saved endorsement: ${classification.candidateMentions.join(', ')}`);
            } catch (dbError: any) {
              console.error('❌ Failed to save endorsement:', dbError.message);
            }
          }
          
          // If high confidence, add to notification queue
          if (classification.confidence >= 0.85) {
            try {
              await notificationQueue.add('high-confidence-endorsement', {
                endorsementId: `${item.source}-${item.title.substring(0, 50)}`, // Create a unique ID
                type: 'high_confidence',
                timestamp: new Date()
              }, {
                priority: 10, // Highest priority for high-confidence endorsements
                attempts: 3
              });
            } catch (queueError: any) {
              console.error('❌ Failed to add notification job:', queueError.message);
            }
          }
        }
      } catch (itemError: any) {
        console.error('❌ Error processing RSS item:', itemError.message);
        // Continue with next item
      }
    }
    
    console.log(`Classified ${results.length} endorsement candidates, saved ${savedCount} to database`);
    return { success: true, classifications: results.length, saved: savedCount };
  } catch (error: any) {
    console.error('Classification worker error:', error.message);
    // Don't throw, just log the error
    return { success: false, error: error.message };
  }
}, {
  connection: redis,
  concurrency: 3 // Process 3 classification jobs simultaneously
});

// Handle classification worker errors
classificationWorker.on('error', (error) => {
  console.error('Classification Worker error:', error.message);
});

classificationWorker.on('failed', (job, error) => {
  console.error(`Classification Job ${job?.id} failed:`, error.message);
});

// Notification Worker
const notificationWorker = new Worker('notifications', async (job: Job<NotificationJobData>) => {
  console.log(`Processing notification job: ${job.id}`);
  
  try {
    const { endorsementId, type, timestamp } = job.data;
    
    switch (type) {
      case 'high_confidence':
        console.log('🚨 High confidence endorsement detected:', endorsementId);
        // TODO: Send email/Slack notification
        // TODO: Auto-approve endorsement
        break;
        
      case 'new_endorsement':
        console.log('📰 New endorsement detected:', endorsementId);
        // TODO: Send notification to admin
        break;
        
      case 'human_review_needed':
        console.log('👀 Human review needed for endorsement:', endorsementId);
        // TODO: Send notification to admin
        break;
    }
    
    return { success: true, notificationSent: true };
  } catch (error) {
    console.error('Notification worker error:', error);
    throw error;
  }
}, {
  connection: redis,
  concurrency: 2
});

// Schedule recurring jobs
export async function scheduleRecurringJobs() {
  console.log('⏰ Scheduling recurring background jobs...');

  // RSS Monitoring Jobs
  await rssQueue.add('check-all-feeds', {
    checkAll: true,
    timestamp: new Date()
  }, {
    repeat: {
      pattern: '*/15 * * * *' // Every 15 minutes
    }
  });

  // High-priority feeds (politicians, major endorsers)
  await rssQueue.add('check-high-priority-feeds', {
    checkAll: false,
    timestamp: new Date()
  }, {
    repeat: {
      pattern: '*/5 * * * *' // Every 5 minutes
    }
  });

  // Daily cleanup job
  await rssQueue.add('daily-cleanup', {
    timestamp: new Date()
  }, {
    repeat: {
      pattern: '0 2 * * *' // Daily at 2 AM
    }
  });

  console.log('✅ Recurring jobs scheduled');
}

// Get queue statistics
export async function getQueueStats() {
  const [rssWaiting, rssActive, rssCompleted, rssFailed] = await Promise.all([
    rssQueue.getWaiting(),
    rssQueue.getActive(),
    rssQueue.getCompleted(),
    rssQueue.getFailed()
  ]);

  const [classificationWaiting, classificationActive, classificationCompleted, classificationFailed] = await Promise.all([
    classificationQueue.getWaiting(),
    classificationQueue.getActive(),
    classificationQueue.getCompleted(),
    classificationQueue.getFailed()
  ]);

  const [notificationWaiting, notificationActive, notificationCompleted, notificationFailed] = await Promise.all([
    notificationQueue.getWaiting(),
    notificationQueue.getActive(),
    notificationQueue.getCompleted(),
    notificationQueue.getFailed()
  ]);

  return {
    rss: {
      waiting: rssWaiting.length,
      active: rssActive.length,
      completed: rssCompleted.length,
      failed: rssFailed.length
    },
    classification: {
      waiting: classificationWaiting.length,
      active: classificationActive.length,
      completed: classificationCompleted.length,
      failed: classificationFailed.length
    },
    notifications: {
      waiting: notificationWaiting.length,
      active: notificationActive.length,
      completed: notificationCompleted.length,
      failed: notificationFailed.length
    }
  };
}

// Clean up completed jobs (keep last 1000)
export async function cleanupOldJobs() {
  await rssQueue.clean(1000 * 60 * 60 * 24, 1000, 'completed'); // 24 hours, max 1000
  await classificationQueue.clean(1000 * 60 * 60 * 24, 1000, 'completed');
  await notificationQueue.clean(1000 * 60 * 60 * 24, 1000, 'completed');
}

// Graceful shutdown
export async function shutdownWorkers() {
  await rssWorker.close();
  await classificationWorker.close();
  await notificationWorker.close();
  await redis.quit();
}

// Error handling
classificationWorker.on('error', (error) => {
  console.error('Classification worker error:', error);
});

notificationWorker.on('error', (error) => {
  console.error('Notification worker error:', error);
}); 