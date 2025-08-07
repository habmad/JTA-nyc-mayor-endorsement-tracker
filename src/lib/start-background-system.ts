import { scheduleRecurringJobs, getQueueStats } from './background-jobs';
import { endorserRSSGenerator } from './endorser-rss-generator';
import { rssFeedParser } from './rss-parser';
import { DatabaseService } from './database-service';

export async function startBackgroundSystem() {
  console.log('🚀 Starting EndorseNYC Background System...\n');

  try {
    // 1. Initialize database and load endorsers
    console.log('📊 Loading endorsers from database...');
    await DatabaseService.initializeDatabase();
    const endorsers = await DatabaseService.getEndorsers();
    
    // Add endorsers to RSS generator
    endorserRSSGenerator.addEndorsers(endorsers);
    
    const endorserStats = endorserRSSGenerator.getStats();
    console.log(`✅ Loaded ${endorserStats.totalEndorsers} endorsers`);
    console.log(`   - High influence (70+): ${endorserStats.highInfluenceEndorsers}`);
    console.log(`   - By category:`, endorserStats.feedsByCategory);

    // 2. Generate RSS feeds for endorsers
    console.log('\n📰 Generating RSS feeds for endorsers...');
    const generatedFeeds = endorserRSSGenerator.generateAllFeeds();
    
    // Add generated feeds to RSS parser
    generatedFeeds.forEach(feed => {
      rssFeedParser.addFeed(feed);
    });
    
    console.log(`✅ Generated ${generatedFeeds.length} RSS feeds`);

    // 3. Schedule background jobs
    console.log('\n⏰ Scheduling background jobs...');
    await scheduleRecurringJobs();
    console.log('✅ Background jobs scheduled');

    // 4. Show initial queue statistics
    console.log('\n📈 Initial Queue Statistics:');
    const queueStats = await getQueueStats();
    console.log('   RSS Queue:', queueStats.rss);
    console.log('   Classification Queue:', queueStats.classification);
    console.log('   Notification Queue:', queueStats.notifications);

    console.log('\n🎉 Background system started successfully!');
    console.log('\n📋 System Status:');
    console.log('   - RSS feeds: Active');
    console.log('   - Background jobs: Scheduled');
    console.log('   - AI classification: Ready');
    console.log('   - Notifications: Enabled');
    
    console.log('\n⏱️  Monitoring Schedule:');
    console.log('   - High-priority feeds: Every 15 minutes');
    console.log('   - All feeds: Every 30 minutes');
    console.log('   - AI classification: Real-time');
    console.log('   - Notifications: Immediate for high-confidence');

  } catch (error) {
    console.error('❌ Error starting background system:', error);
    throw error;
  }
}

// Function to get current system status
export async function getSystemStatus() {
  const queueStats = await getQueueStats();
  const endorserStats = endorserRSSGenerator.getStats();
  const rssStats = rssFeedParser.getStats();
  
  return {
    queues: queueStats,
    endorsers: endorserStats,
    rss: rssStats,
    timestamp: new Date()
  };
}

// Function to manually trigger RSS check
export async function triggerRSSCheck() {
  console.log('🔍 Manually triggering RSS check...');
  const items = await rssFeedParser.checkAllFeeds();
  console.log(`Found ${items.length} new items`);
  return items;
}

// Run if this file is executed directly
if (require.main === module) {
  startBackgroundSystem().catch(console.error);
} 