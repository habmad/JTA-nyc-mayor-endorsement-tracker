import { RSSFeedConfig } from './rss-parser';

// Endorser data structure based on the database
export interface Endorser {
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
  personal_website?: string;
}

// RSS feed templates for different endorser types
const RSS_FEED_TEMPLATES = {
  // News sources that cover specific politicians
  politician: {
    keywords: ['endorsement', 'endorse', 'support', 'mayor', 'nyc', 'new york', 'candidate'],
    excludeKeywords: ['obituary', 'death', 'funeral', 'arrest', 'scandal'],
    checkFrequencyMinutes: 15 // High priority for politicians
  },
  
  // Union news and press releases
  union: {
    keywords: ['endorsement', 'endorse', 'support', 'labor', 'union', 'workers', 'mayor'],
    excludeKeywords: ['obituary', 'death', 'funeral'],
    checkFrequencyMinutes: 30
  },
  
  // Business news and press releases
  business: {
    keywords: ['endorsement', 'endorse', 'support', 'mayor', 'nyc', 'business'],
    excludeKeywords: ['obituary', 'death', 'funeral'],
    checkFrequencyMinutes: 30
  },
  
  // Media coverage and entertainment news
  media: {
    keywords: ['endorsement', 'endorse', 'support', 'mayor', 'nyc'],
    excludeKeywords: ['obituary', 'death', 'funeral'],
    checkFrequencyMinutes: 30
  },
  
  // Celebrity news and social media
  celebrity: {
    keywords: ['endorsement', 'endorse', 'support', 'mayor', 'nyc'],
    excludeKeywords: ['obituary', 'death', 'funeral'],
    checkFrequencyMinutes: 30
  },
  
  // Religious community news
  religious: {
    keywords: ['endorsement', 'endorse', 'support', 'mayor', 'nyc', 'community'],
    excludeKeywords: ['obituary', 'death', 'funeral'],
    checkFrequencyMinutes: 30
  },
  
  // Nonprofit and advocacy news
  nonprofit: {
    keywords: ['endorsement', 'endorse', 'support', 'mayor', 'nyc', 'advocacy'],
    excludeKeywords: ['obituary', 'death', 'funeral'],
    checkFrequencyMinutes: 30
  },
  
  // Academic news and press releases
  academic: {
    keywords: ['endorsement', 'endorse', 'support', 'mayor', 'nyc', 'academic'],
    excludeKeywords: ['obituary', 'death', 'funeral'],
    checkFrequencyMinutes: 30
  }
};

// News sources that cover NYC politics (for endorser monitoring)
const NYC_POLITICAL_NEWS_SOURCES = [
  {
    name: 'NYT Politics',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'AMNY Politics',
    url: 'https://www.amny.com/politics/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'NY1 Politics',
    url: 'https://www.ny1.com/feed/politics',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'Gothamist Politics',
    url: 'https://gothamist.com/feed/politics',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'Brooklyn Eagle Politics',
    url: 'https://brooklyneagle.com/category/politics/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'Queens Eagle Politics',
    url: 'https://queenseagle.com/category/politics/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'Bronx Times Politics',
    url: 'https://www.bxtimes.com/category/politics/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'Staten Island Advance Politics',
    url: 'https://www.silive.com/politics/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'City & State NY',
    url: 'https://www.cityandstateny.com/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'Politico NY',
    url: 'https://www.politico.com/rss/state_news_ny.xml',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'Crain\'s New York Politics',
    url: 'https://www.crainsnewyork.com/politics',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'New York Observer',
    url: 'https://observer.com/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'Capital New York',
    url: 'https://www.capitalnewyork.com/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'The City',
    url: 'https://www.thecity.nyc/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  },
  {
    name: 'Streetsblog NYC',
    url: 'https://nyc.streetsblog.org/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york']
  }
];

// Union-specific news sources
const UNION_NEWS_SOURCES = [
  {
    name: 'Labor Press',
    url: 'https://laborpress.org/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor']
  },
  {
    name: 'Workers World',
    url: 'https://www.workers.org/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor']
  },
  {
    name: 'AFL-CIO News',
    url: 'https://aflcio.org/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor']
  },
  {
    name: 'SEIU News',
    url: 'https://www.seiu.org/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor']
  },
  {
    name: 'Teamsters News',
    url: 'https://teamster.org/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor']
  },
  {
    name: 'UFT News',
    url: 'https://www.uft.org/news',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor', 'teachers']
  },
  {
    name: 'DC37 News',
    url: 'https://www.dc37.net/news',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor', 'public_employees']
  }
];

// Business news sources
const BUSINESS_NEWS_SOURCES = [
  {
    name: 'Crain\'s New York Business',
    url: 'https://www.crainsnewyork.com/rss.xml',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business']
  },
  {
    name: 'New York Business Journal',
    url: 'https://www.bizjournals.com/newyork/news/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business']
  },
  {
    name: 'Wall Street Journal',
    url: 'https://feeds.wsj.com/wsj/us',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business']
  },
  {
    name: 'Bloomberg',
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business']
  },
  {
    name: 'Fortune',
    url: 'https://fortune.com/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business']
  },
  {
    name: 'Forbes',
    url: 'https://www.forbes.com/business/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business']
  },
  {
    name: 'Real Estate Weekly',
    url: 'https://rew-online.com/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business', 'real_estate']
  },
  {
    name: 'Commercial Observer',
    url: 'https://commercialobserver.com/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business', 'real_estate']
  }
];

// Religious and community news sources
const RELIGIOUS_NEWS_SOURCES = [
  {
    name: 'Catholic New York',
    url: 'https://cny.org/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'catholic']
  },
  {
    name: 'Jewish Week',
    url: 'https://jewishweek.timesofisrael.com/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'jewish']
  },
  {
    name: 'Amsterdam News',
    url: 'https://amsterdamnews.com/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'community']
  },
  {
    name: 'El Diario',
    url: 'https://eldiariony.com/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'latino']
  }
];

// Entertainment and celebrity news sources
const ENTERTAINMENT_NEWS_SOURCES = [
  {
    name: 'Variety',
    url: 'https://variety.com/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'entertainment']
  },
  {
    name: 'Hollywood Reporter',
    url: 'https://www.hollywoodreporter.com/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'entertainment']
  },
  {
    name: 'Page Six',
    url: 'https://pagesix.com/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'celebrity']
  },
  {
    name: 'TMZ',
    url: 'https://www.tmz.com/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'celebrity']
  }
];

// Nonprofit and advocacy news sources
const NONPROFIT_NEWS_SOURCES = [
  {
    name: 'Nonprofit Quarterly',
    url: 'https://nonprofitquarterly.org/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'nonprofit']
  },
  {
    name: 'Chronicle of Philanthropy',
    url: 'https://www.philanthropy.com/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'nonprofit']
  },
  {
    name: 'Inside Philanthropy',
    url: 'https://www.insidephilanthropy.com/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'nonprofit']
  }
];

// Academic and think tank news sources
const ACADEMIC_NEWS_SOURCES = [
  {
    name: 'Brookings Institution',
    url: 'https://www.brookings.edu/feed/',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'policy']
  },
  {
    name: 'Urban Institute',
    url: 'https://www.urban.org/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'policy']
  },
  {
    name: 'Manhattan Institute',
    url: 'https://manhattan.institute/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'policy']
  },
  {
    name: 'Center for an Urban Future',
    url: 'https://nycfuture.org/feed',
    keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'policy']
  }
];

export class EndorserRSSGenerator {
  private endorsers: Map<string, Endorser>;
  private generatedFeeds: Map<string, RSSFeedConfig>;

  constructor() {
    this.endorsers = new Map();
    this.generatedFeeds = new Map();
  }

  // Add endorsers from the database
  addEndorsers(endorsers: Endorser[]): void {
    endorsers.forEach(endorser => {
      this.endorsers.set(endorser.id, endorser);
    });
    console.log(`Added ${endorsers.length} endorsers to RSS generator`);
  }

  // Generate RSS feeds for all endorsers
  generateAllFeeds(): RSSFeedConfig[] {
    const feeds: RSSFeedConfig[] = [];
    
    // Add general NYC political news feeds
    NYC_POLITICAL_NEWS_SOURCES.forEach((source, index) => {
      feeds.push({
        id: `nyc-political-${index}`,
        name: source.name,
        url: source.url,
        checkFrequencyMinutes: 30,
        isActive: true,
        keywords: source.keywords,
        excludeKeywords: ['obituary', 'death', 'funeral']
      });
    });

    // Add union-specific feeds
    UNION_NEWS_SOURCES.forEach((source, index) => {
      feeds.push({
        id: `union-news-${index}`,
        name: source.name,
        url: source.url,
        checkFrequencyMinutes: 30,
        isActive: true,
        keywords: source.keywords,
        excludeKeywords: ['obituary', 'death', 'funeral']
      });
    });

    // Add business news feeds
    BUSINESS_NEWS_SOURCES.forEach((source, index) => {
      feeds.push({
        id: `business-news-${index}`,
        name: source.name,
        url: source.url,
        checkFrequencyMinutes: 30,
        isActive: true,
        keywords: source.keywords,
        excludeKeywords: ['obituary', 'death', 'funeral']
      });
    });

    // Add religious and community news feeds
    RELIGIOUS_NEWS_SOURCES.forEach((source, index) => {
      feeds.push({
        id: `religious-news-${index}`,
        name: source.name,
        url: source.url,
        checkFrequencyMinutes: 30,
        isActive: true,
        keywords: source.keywords,
        excludeKeywords: ['obituary', 'death', 'funeral']
      });
    });

    // Add entertainment and celebrity news feeds
    ENTERTAINMENT_NEWS_SOURCES.forEach((source, index) => {
      feeds.push({
        id: `entertainment-news-${index}`,
        name: source.name,
        url: source.url,
        checkFrequencyMinutes: 30,
        isActive: true,
        keywords: source.keywords,
        excludeKeywords: ['obituary', 'death', 'funeral']
      });
    });

    // Add nonprofit and advocacy news feeds
    NONPROFIT_NEWS_SOURCES.forEach((source, index) => {
      feeds.push({
        id: `nonprofit-news-${index}`,
        name: source.name,
        url: source.url,
        checkFrequencyMinutes: 30,
        isActive: true,
        keywords: source.keywords,
        excludeKeywords: ['obituary', 'death', 'funeral']
      });
    });

    // Add academic and think tank news feeds
    ACADEMIC_NEWS_SOURCES.forEach((source, index) => {
      feeds.push({
        id: `academic-news-${index}`,
        name: source.name,
        url: source.url,
        checkFrequencyMinutes: 30,
        isActive: true,
        keywords: source.keywords,
        excludeKeywords: ['obituary', 'death', 'funeral']
      });
    });

    // Generate feeds for high-influence endorsers
    for (const [id, endorser] of this.endorsers) {
      if (endorser.influence_score >= 70) { // Only track high-influence endorsers
        const endorserFeeds = this.generateEndorserFeeds(endorser);
        feeds.push(...endorserFeeds);
      }
    }

    return feeds;
  }

  // Generate RSS feeds for a specific endorser
  private generateEndorserFeeds(endorser: Endorser): RSSFeedConfig[] {
    const feeds: RSSFeedConfig[] = [];
    const template = RSS_FEED_TEMPLATES[endorser.category];
    
    if (!template) {
      return feeds;
    }

    // Create search-based feeds for the endorser
    const searchTerms = this.generateSearchTerms(endorser);
    
    searchTerms.forEach((searchTerm, index) => {
      feeds.push({
        id: `endorser-${endorser.id}-${index}`,
        name: `${endorser.name} Mentions`,
        url: this.createSearchFeedURL(searchTerm),
        checkFrequencyMinutes: template.checkFrequencyMinutes,
        isActive: true,
        keywords: template.keywords,
        excludeKeywords: template.excludeKeywords
      });
    });

    return feeds;
  }

  // Generate search terms for an endorser
  private generateSearchTerms(endorser: Endorser): string[] {
    const terms: string[] = [];
    
    // Add name variations
    terms.push(endorser.name);
    if (endorser.display_name) {
      terms.push(endorser.display_name);
    }
    
    // Add organization if different from name
    if (endorser.organization && endorser.organization !== endorser.name) {
      terms.push(endorser.organization);
    }
    
    // Add social media handles
    if (endorser.twitter_handle) {
      terms.push(endorser.twitter_handle.replace('@', ''));
    }
    
    // Add title/role
    if (endorser.title) {
      terms.push(endorser.title);
    }
    
    return terms;
  }

  // Create a search feed URL (this would integrate with news APIs)
  private createSearchFeedURL(searchTerm: string): string {
    // This is a placeholder - in production, you'd integrate with:
    // - Google News RSS
    // - NewsAPI
    // - Custom news aggregation service
    
    // For now, return a general NYC politics feed
    return 'https://www.amny.com/politics/feed/';
  }

  // Get feeds by influence level
  getFeedsByInfluenceLevel(minInfluence: number): RSSFeedConfig[] {
    const feeds: RSSFeedConfig[] = [];
    
    for (const [id, endorser] of this.endorsers) {
      if (endorser.influence_score >= minInfluence) {
        const endorserFeeds = this.generateEndorserFeeds(endorser);
        feeds.push(...endorserFeeds);
      }
    }
    
    return feeds;
  }

  // Get feeds by category
  getFeedsByCategory(category: string): RSSFeedConfig[] {
    const feeds: RSSFeedConfig[] = [];
    
    for (const [id, endorser] of this.endorsers) {
      if (endorser.category === category) {
        const endorserFeeds = this.generateEndorserFeeds(endorser);
        feeds.push(...endorserFeeds);
      }
    }
    
    return feeds;
  }

  // Get statistics about generated feeds
  getStats(): {
    totalEndorsers: number;
    highInfluenceEndorsers: number;
    totalFeeds: number;
    feedsByCategory: Record<string, number>;
  } {
    const highInfluenceCount = Array.from(this.endorsers.values())
      .filter(e => e.influence_score >= 70).length;
    
    const feedsByCategory: Record<string, number> = {};
    for (const endorser of this.endorsers.values()) {
      feedsByCategory[endorser.category] = (feedsByCategory[endorser.category] || 0) + 1;
    }
    
    return {
      totalEndorsers: this.endorsers.size,
      highInfluenceEndorsers: highInfluenceCount,
      totalFeeds: this.generatedFeeds.size,
      feedsByCategory
    };
  }
}

// Export singleton instance
export const endorserRSSGenerator = new EndorserRSSGenerator(); 