import { NextRequest, NextResponse } from 'next/server';
import { rssFeedParser } from '../../../lib/rss-parser';
import { endorserRSSGenerator } from '../../../lib/endorser-rss-generator';
import { DatabaseService } from '../../../lib/database-service';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    // Initialize feeds from database only if not already done
    const stats = rssFeedParser.getStats();
    if (stats.totalFeeds === 0) {
      console.log('Initializing RSS feeds from database...');
      
      // Load feeds from database
      await DatabaseService.initializeDatabase();
      const feeds = await DatabaseService.getRSSFeeds();
      
      // Add general RSS feeds only (endorser-specific feeds are handled by background system)
      feeds.forEach(feed => {
        const config = DatabaseService.convertDatabaseFeedToRSSConfig(feed);
        rssFeedParser.addFeed(config);
      });
      
      console.log(`Added ${feeds.length} general RSS feeds`);
    } else {
      console.log(`RSS feeds already initialized (${stats.totalFeeds} feeds active)`);
    }
    
    if (action === 'checkAllFeeds') {
      const results = await rssFeedParser.checkAllFeeds();
      return NextResponse.json({
        success: true,
        results,
        stats: rssFeedParser.getStats()
      });
    }
    
    if (action === 'getStats') {
      return NextResponse.json({
        success: true,
        stats: rssFeedParser.getStats()
      });
    }
    
    if (action === 'clear') {
      rssFeedParser.clearAllFeeds();
      return NextResponse.json({
        success: true,
        message: 'All RSS feeds cleared'
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in RSS API:', error);
    return NextResponse.json(
      { error: 'Failed to process RSS feeds' },
      { status: 500 }
    );
  }
} 