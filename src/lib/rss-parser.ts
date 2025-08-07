import Parser from 'rss-parser';
import { SourceType } from '../types/database';

export interface RSSFeedItem {
  title: string;
  description: string;
  content?: string;
  link: string;
  pubDate: string;
  author?: string;
  categories?: string[];
  source: string;
}

export interface RSSFeedConfig {
  id: string;
  name: string;
  url: string;
  checkFrequencyMinutes: number;
  isActive: boolean;
  // Optional filters to reduce noise
  keywords?: string[];
  excludeKeywords?: string[];
  // Optional content extraction rules
  contentSelector?: string;
  authorSelector?: string;
}

export class RSSFeedParser {
  private parser: Parser;
  private feeds: Map<string, RSSFeedConfig>;
  private lastChecked: Map<string, Date>;

  constructor() {
    this.parser = new Parser({
      headers: {
        'User-Agent': 'EndorseNYC/1.0 (NYC Endorsement Tracker)'
      },
      timeout: 10000, // 10 second timeout
      customFields: {
        item: [
          ['media:content', 'media'],
          ['dc:creator', 'author'],
          ['author', 'author']
        ]
      }
    });
    
    this.feeds = new Map();
    this.lastChecked = new Map();
  }

  // Add a new RSS feed to monitor
  addFeed(config: RSSFeedConfig): void {
    // Check if feed already exists (by ID or URL)
    const existingFeed = this.feeds.get(config.id);
    if (existingFeed) {
      console.log(`RSS feed already exists: ${config.name} (${config.url})`);
      return;
    }
    
    // Also check by URL to prevent duplicates with different IDs
    for (const feed of this.feeds.values()) {
      if (feed.url === config.url) {
        console.log(`RSS feed with same URL already exists: ${feed.name} (${feed.url})`);
        return;
      }
    }
    
    this.feeds.set(config.id, config);
    console.log(`Added RSS feed: ${config.name} (${config.url})`);
  }

  // Remove a feed from monitoring
  removeFeed(feedId: string): void {
    this.feeds.delete(feedId);
    this.lastChecked.delete(feedId);
    console.log(`Removed RSS feed: ${feedId}`);
  }

  // Clear all feeds (useful for debugging)
  clearAllFeeds(): void {
    const count = this.feeds.size;
    this.feeds.clear();
    this.lastChecked.clear();
    console.log(`Cleared all ${count} RSS feeds`);
  }

  // Get all active feeds
  getActiveFeeds(): RSSFeedConfig[] {
    return Array.from(this.feeds.values()).filter(feed => feed.isActive);
  }

  // Check a single RSS feed for new items
  async checkFeed(feedId: string): Promise<RSSFeedItem[]> {
    const feed = this.feeds.get(feedId);
    if (!feed || !feed.isActive) {
      return [];
    }

    try {
      console.log(`Checking RSS feed: ${feed.name} (${feed.url})`);
      
      const parsed = await this.parser.parseURL(feed.url);
      const items: RSSFeedItem[] = [];

      for (const item of parsed.items) {
        // Skip items older than 24 hours to avoid processing old content
        const pubDate = new Date(item.pubDate || item.isoDate || Date.now());
        const hoursSincePublished = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSincePublished > 24) {
          continue;
        }

        // Apply keyword filters if configured
        if (feed.keywords && feed.keywords.length > 0) {
          const content = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
          const hasKeyword = feed.keywords.some(keyword => 
            content.includes(keyword.toLowerCase())
          );
          if (!hasKeyword) continue;
        }

        if (feed.excludeKeywords && feed.excludeKeywords.length > 0) {
          const content = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
          const hasExcludedKeyword = feed.excludeKeywords.some(keyword => 
            content.includes(keyword.toLowerCase())
          );
          if (hasExcludedKeyword) continue;
        }

        const rssItem: RSSFeedItem = {
          title: item.title || '',
          description: item.contentSnippet || '',
          content: item.content || item.contentSnippet || '',
          link: item.link || '',
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          author: item.creator || item.author || '',
          categories: item.categories || [],
          source: feed.name
        };

        items.push(rssItem);
      }

      this.lastChecked.set(feedId, new Date());
      console.log(`Found ${items.length} new items in ${feed.name}`);
      
      return items;

    } catch (error) {
      console.error(`Error checking RSS feed ${feed.name}:`, error);
      return [];
    }
  }

  // Check all active feeds
  async checkAllFeeds(): Promise<RSSFeedItem[]> {
    const allItems: RSSFeedItem[] = [];
    
    for (const feed of this.getActiveFeeds()) {
      try {
        const items = await this.checkFeed(feed.id);
        allItems.push(...items);
      } catch (error) {
        console.error(`Error checking feed ${feed.id}:`, error);
      }
    }

    return allItems;
  }

  // Get feed statistics
  getStats(): {
    totalFeeds: number;
    activeFeeds: number;
    lastCheck: Date | null;
    feedDetails: Array<{ id: string; name: string; url: string; isActive: boolean }>;
  } {
    const activeFeeds = this.getActiveFeeds().length;
    const lastCheck = Array.from(this.lastChecked.values())
      .sort((a, b) => b.getTime() - a.getTime())[0] || null;

    const feedDetails = Array.from(this.feeds.values()).map(feed => ({
      id: feed.id,
      name: feed.name,
      url: feed.url,
      isActive: feed.isActive
    }));

    return {
      totalFeeds: this.feeds.size,
      activeFeeds,
      lastCheck,
      feedDetails
    };
  }

  // Test a feed URL to see if it's valid
  async testFeed(url: string): Promise<{ valid: boolean; title?: string; error?: string }> {
    try {
      const parsed = await this.parser.parseURL(url);
      return {
        valid: true,
        title: parsed.title || 'Untitled Feed'
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const rssFeedParser = new RSSFeedParser();

// Initialize feeds from database (will be loaded when needed)
export async function initializeFeedsFromDatabase() {
  try {
    const response = await fetch('/api/rss/feeds');
    if (response.ok) {
      const data = await response.json();
      data.feeds.forEach((feed: RSSFeedConfig) => {
        rssFeedParser.addFeed(feed);
      });
    }
  } catch (error) {
    console.error('Error loading feeds from database:', error);
  }
} 