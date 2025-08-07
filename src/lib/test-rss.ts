import { rssFeedParser } from './rss-parser';
import { endorsementClassifier } from './data-collection';

async function testRSSParser() {
  console.log('🧪 Testing RSS Parser...\n');

  // Test 1: Check feed statistics
  console.log('📊 Feed Statistics:');
  const stats = rssFeedParser.getStats();
  console.log(`- Total feeds: ${stats.totalFeeds}`);
  console.log(`- Active feeds: ${stats.activeFeeds}`);
  console.log(`- Last check: ${stats.lastCheck || 'Never'}\n`);

  // Test 2: Check all feeds
  console.log('🔍 Checking all RSS feeds...');
  const items = await rssFeedParser.checkAllFeeds();
  console.log(`- Found ${items.length} items across all feeds\n`);

  // Test 3: Show sample items
  if (items.length > 0) {
    console.log('📰 Sample RSS Items:');
    items.slice(0, 3).forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`);
      console.log(`   Source: ${item.source}`);
      console.log(`   Author: ${item.author || 'Unknown'}`);
      console.log(`   Date: ${new Date(item.pubDate).toLocaleString()}`);
      console.log(`   URL: ${item.link}`);
    });
  }

  // Test 4: AI Classification
  if (items.length > 0) {
    console.log('\n🤖 Testing AI Classification on RSS items...');
    
    for (const item of items.slice(0, 2)) {
      const text = `${item.title} ${item.description}`;
      console.log(`\nAnalyzing: "${text.substring(0, 100)}..."`);
      
      const classification = await endorsementClassifier.classifyEndorsement({
        text,
        sourceUrl: item.link,
        sourceType: 'website',
        author: item.author,
        organization: item.source
      });
      
      console.log(`- Confidence: ${Math.round(classification.confidence * 100)}%`);
      console.log(`- Candidate mentions: ${classification.candidateMentions.join(', ') || 'None'}`);
      console.log(`- Sentiment: ${classification.sentiment}`);
      console.log(`- Requires review: ${classification.requiresHumanReview ? 'Yes' : 'No'}`);
      console.log(`- AI Reasoning: ${classification.aiReasoning}`);
    }
  }

  // Test 5: Test individual feed
  console.log('\n🔬 Testing individual feed...');
  const activeFeeds = rssFeedParser.getActiveFeeds();
  if (activeFeeds.length > 0) {
    const testFeed = activeFeeds[0];
    console.log(`Testing feed: ${testFeed.name}`);
    
    const feedItems = await rssFeedParser.checkFeed(testFeed.id);
    console.log(`- Found ${feedItems.length} items in ${testFeed.name}`);
    
    if (feedItems.length > 0) {
      console.log(`- Sample item: "${feedItems[0].title}"`);
    }
  }

  console.log('\n✅ RSS Parser test completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRSSParser().catch(console.error);
}

export { testRSSParser }; 