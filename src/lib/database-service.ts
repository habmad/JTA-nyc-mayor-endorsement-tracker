import { sql } from '@vercel/postgres';

export interface RSSFeedConfig {
  id: string;
  name: string;
  url: string;
  checkFrequencyMinutes: number;
  isActive: boolean;
  keywords?: string[];
  excludeKeywords?: string[];
}

export interface DatabaseEndorser {
  id: string;
  name: string;
  display_name?: string;
  title?: string;
  organization?: string;
  category: 'politician' | 'union' | 'celebrity' | 'media' | 'business' | 'nonprofit' | 'academic' | 'religious';
  subcategory?: string;
  borough?: string;
  influence_score: number;
  twitter_handle?: string;
  instagram_handle?: string;
}

export interface DatabaseRSSFeed {
  id: string;
  category_id: string;
  name: string;
  url: string;
  description?: string;
  keywords: string[];
  exclude_keywords: string[];
  check_frequency_minutes: number;
  is_active: boolean;
  last_check_at?: Date;
  last_success_at?: Date;
  error_count: number;
  last_error?: string;
}

export interface DatabaseRSSFeedCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  check_frequency_minutes: number;
  is_active: boolean;
}

export class DatabaseService {
  // Get all endorsers from database
  static async getEndorsers(): Promise<DatabaseEndorser[]> {
    try {
      const result = await sql`
        SELECT 
          id, name, display_name, title, organization, category, subcategory, 
          borough, influence_score, twitter_handle, instagram_handle
        FROM endorsers 
        ORDER BY influence_score DESC
      `;
      return result.rows as DatabaseEndorser[];
    } catch (error) {
      console.error('Error fetching endorsers:', error);
      return [];
    }
  }

  // Get all RSS feeds from database
  static async getRSSFeeds(): Promise<DatabaseRSSFeed[]> {
    try {
      const result = await sql`
        SELECT 
          id, category_id, name, url, description, keywords, exclude_keywords,
          check_frequency_minutes, is_active, last_check_at, last_success_at,
          error_count, last_error
        FROM rss_feeds 
        WHERE is_active = true 
        ORDER BY name
      `;
      return result.rows as DatabaseRSSFeed[];
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      return [];
    }
  }

  // Get RSS feed categories
  static async getRSSFeedCategories(): Promise<DatabaseRSSFeedCategory[]> {
    try {
      const result = await sql`
        SELECT 
          id, name, description, color, check_frequency_minutes, is_active
        FROM rss_feed_categories 
        WHERE is_active = true 
        ORDER BY name
      `;
      return result.rows as DatabaseRSSFeedCategory[];
    } catch (error) {
      console.error('Error fetching RSS feed categories:', error);
      return [];
    }
  }

  // Get endorser-specific RSS feeds
  static async getEndorserRSSFeeds(): Promise<Array<{
    endorser_id: string;
    feed_id: string;
    search_terms: string[];
  }>> {
    try {
      const result = await sql`
        SELECT endorser_id, feed_id, search_terms
        FROM endorser_rss_feeds 
        WHERE is_active = true
      `;
      return result.rows as Array<{
        endorser_id: string;
        feed_id: string;
        search_terms: string[];
      }>;
    } catch (error) {
      console.error('Error fetching endorser RSS feeds:', error);
      return [];
    }
  }

  // Get RSS feed statistics
  static async getRSSFeedStats(): Promise<{
    totalFeeds: number;
    activeFeeds: number;
    lastCheck: Date | null;
  }> {
    try {
      const result = await sql`
        SELECT 
          COUNT(*) as total_feeds,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_feeds,
          MAX(last_check_at) as last_check
        FROM rss_feeds
      `;
      
      const row = result.rows[0];
      return {
        totalFeeds: parseInt(row.total_feeds) || 0,
        activeFeeds: parseInt(row.active_feeds) || 0,
        lastCheck: row.last_check ? new Date(row.last_check) : null
      };
    } catch (error) {
      console.error('Error fetching RSS feed stats:', error);
      return {
        totalFeeds: 0,
        activeFeeds: 0,
        lastCheck: null
      };
    }
  }

  // Get endorser statistics
  static async getEndorserStats(): Promise<{
    totalEndorsers: number;
    highInfluenceEndorsers: number;
    feedsByCategory: Record<string, number>;
  }> {
    try {
      const result = await sql`
        SELECT 
          category,
          COUNT(*) as category_count,
          COUNT(CASE WHEN influence_score >= 70 THEN 1 END) as high_influence_count
        FROM endorsers 
        GROUP BY category
      `;
      
      const feedsByCategory: Record<string, number> = {};
      let totalEndorsers = 0;
      let highInfluenceEndorsers = 0;
      
      result.rows.forEach((row: any) => {
        feedsByCategory[row.category] = parseInt(row.category_count);
        totalEndorsers += parseInt(row.category_count);
        highInfluenceEndorsers += parseInt(row.high_influence_count);
      });
      
      return {
        totalEndorsers,
        highInfluenceEndorsers,
        feedsByCategory
      };
    } catch (error) {
      console.error('Error fetching endorser stats:', error);
      return {
        totalEndorsers: 0,
        highInfluenceEndorsers: 0,
        feedsByCategory: {}
      };
    }
  }

  // Convert database endorser to RSS feed config
  static convertEndorserToRSSFeeds(endorser: DatabaseEndorser): RSSFeedConfig[] {
    const feeds: RSSFeedConfig[] = [];
    
    // Only create feeds for the endorser's name and display name (if different)
    const searchTerms = [
      endorser.name,
      ...(endorser.display_name && endorser.display_name !== endorser.name ? [endorser.display_name] : [])
    ];
    
    // Create a feed for each search term (max 2 per endorser)
    searchTerms.forEach((term, index) => {
      feeds.push({
        id: `endorser-${endorser.id}-${index}`,
        name: `${endorser.name} Mentions`,
        url: `https://www.amny.com/politics/feed/`, // Placeholder - would be real search API
        checkFrequencyMinutes: endorser.influence_score >= 90 ? 15 : 30,
        isActive: true,
        keywords: ['endorsement', 'endorse', 'support', 'mayor', 'nyc', 'new york'],
        excludeKeywords: ['obituary', 'death', 'funeral']
      });
    });
    
    return feeds;
  }

  // Convert database RSS feed to RSS feed config
  static convertDatabaseFeedToRSSConfig(dbFeed: DatabaseRSSFeed): RSSFeedConfig {
    return {
      id: dbFeed.id,
      name: dbFeed.name,
      url: dbFeed.url,
      checkFrequencyMinutes: dbFeed.check_frequency_minutes,
      isActive: dbFeed.is_active,
      keywords: dbFeed.keywords,
      excludeKeywords: dbFeed.exclude_keywords
    };
  }

  // Initialize database with sample data if empty
  static async initializeDatabase(): Promise<void> {
    try {
      // Check if endorsers table is empty
      const endorserCount = await sql`SELECT COUNT(*) as count FROM endorsers`;
      if (parseInt(endorserCount.rows[0].count) === 0) {
        console.log('Initializing database with sample endorsers...');
        await this.insertSampleEndorsers();
      }
      
      // Check if RSS feeds table is empty
      const feedCount = await sql`SELECT COUNT(*) as count FROM rss_feeds`;
      if (parseInt(feedCount.rows[0].count) === 0) {
        console.log('Initializing database with sample RSS feeds...');
        await this.insertSampleRSSFeeds();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  // Insert sample endorsers
  private static async insertSampleEndorsers(): Promise<void> {
    const sampleEndorsers = [
      {
        name: 'Alexandria Ocasio-Cortez',
        display_name: 'AOC',
        title: 'U.S. Representative',
        organization: 'U.S. House of Representatives',
        category: 'politician' as const,
        subcategory: 'federal_representative',
        borough: 'Queens/Bronx',
        influence_score: 96,
        twitter_handle: '@AOC',
        instagram_handle: '@ocasio_cortez'
      },
      // ... more endorsers would be added here
    ];

    for (const endorser of sampleEndorsers) {
      await sql`
        INSERT INTO endorsers (
          name, display_name, title, organization, category, subcategory, 
          borough, influence_score, twitter_handle, instagram_handle
        ) VALUES (
          ${endorser.name}, ${endorser.display_name}, ${endorser.title}, 
          ${endorser.organization}, ${endorser.category}, ${endorser.subcategory},
          ${endorser.borough}, ${endorser.influence_score}, ${endorser.twitter_handle},
          ${endorser.instagram_handle}
        )
      `;
    }
  }

  // Insert sample RSS feeds
  private static async insertSampleRSSFeeds(): Promise<void> {
    // This would insert the RSS feeds from the schema.sql
    // For now, we'll rely on the schema.sql to populate the feeds
    console.log('RSS feeds should be populated by schema.sql');
  }
} 