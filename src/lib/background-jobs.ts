import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { rssFeedParser, RSSFeedItem } from './rss-parser';
import { endorsementClassifier } from './data-collection';
import { SourceType } from '../types/database';

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
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
    }
    
    return { success: true, itemsFound: items.length };
  } catch (error) {
    console.error('RSS worker error:', error);
    throw error;
  }
}, {
  connection: redis,
  concurrency: 5 // Process 5 jobs simultaneously
});

// Classification Worker
const classificationWorker = new Worker('endorsement-classification', async (job: Job<ClassificationJobData>) => {
  console.log(`Processing classification job: ${job.id}`);
  
  try {
    const results = [];
    
    for (const item of job.data.rssItems) {
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
        
        // If high confidence, add to notification queue
        if (classification.confidence >= 0.85) {
          await notificationQueue.add('high-confidence-endorsement', {
            endorsementId: `${item.source}-${item.title.substring(0, 50)}`, // Create a unique ID
            type: 'high_confidence',
            timestamp: new Date()
          }, {
            priority: 10, // Highest priority for high-confidence endorsements
            attempts: 3
          });
        }
      }
    }
    
    console.log(`Classified ${results.length} endorsement candidates`);
    return { success: true, classifications: results.length };
  } catch (error) {
    console.error('Classification worker error:', error);
    throw error;
  }
}, {
  connection: redis,
  concurrency: 3 // Process 3 classification jobs simultaneously
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
rssWorker.on('error', (error) => {
  console.error('RSS worker error:', error);
});

classificationWorker.on('error', (error) => {
  console.error('Classification worker error:', error);
});

notificationWorker.on('error', (error) => {
  console.error('Notification worker error:', error);
}); 