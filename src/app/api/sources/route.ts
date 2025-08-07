import { NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database-service';

export async function GET() {
  try {
    // Initialize database if needed
    await DatabaseService.initializeDatabase();
    
    // Get data from database
    const [rssFeeds, rssCategories, endorsers] = await Promise.all([
      DatabaseService.getRSSFeeds(),
      DatabaseService.getRSSFeedCategories(),
      DatabaseService.getEndorsers()
    ]);
    
    // Get statistics
    const stats = await DatabaseService.getRSSFeedStats();
    const endorserStats = await DatabaseService.getEndorserStats();
    
    // Group feeds by category
    const feedsByCategory = rssCategories.map(category => {
      const categoryFeeds = rssFeeds.filter(feed => feed.category_id === category.id);
      return {
        name: category.name,
        description: category.description || '',
        count: categoryFeeds.length,
        lastUpdated: stats.lastCheck,
        examples: categoryFeeds.slice(0, 3).map(feed => feed.name),
        allSources: categoryFeeds.map(feed => feed.name),
        color: category.color || 'gray'
      };
    });
    
    // Add endorser-specific category (realistic: 1-2 feeds per endorser)
    const highInfluenceEndorsers = endorsers.filter(endorser => endorser.influence_score >= 70);
    const endorserSpecificFeeds = highInfluenceEndorsers.map(endorser => {
      const feeds = [endorser.name];
      if (endorser.display_name && endorser.display_name !== endorser.name) {
        feeds.push(endorser.display_name);
      }
      return feeds.map(feed => `${feed} Mentions`);
    }).flat();
    
    feedsByCategory.push({
      name: 'Endorser-Specific',
      description: 'Individual endorser monitoring feeds (1-2 per endorser)',
      count: endorserSpecificFeeds.length,
      lastUpdated: stats.lastCheck,
      examples: endorserSpecificFeeds.slice(0, 3),
      allSources: endorserSpecificFeeds,
      color: 'yellow'
    });
    
    return NextResponse.json({
      totalFeeds: stats.totalFeeds + endorserSpecificFeeds.length,
      categories: feedsByCategory,
      stats: {
        totalFeeds: stats.totalFeeds,
        activeFeeds: stats.activeFeeds,
        lastCheck: stats.lastCheck,
        totalEndorsers: endorserStats.totalEndorsers,
        highInfluenceEndorsers: endorserStats.highInfluenceEndorsers
      }
    });
  } catch (error) {
    console.error('Error in sources API:', error);
    return NextResponse.json(
      { error: 'Failed to load sources data' },
      { status: 500 }
    );
  }
} 