import { Endorsement, Endorser, SourceType, ConfidenceLevel, EndorsementType, SentimentScore } from '../types/database';
import { rssFeedParser, RSSFeedItem } from './rss-parser';

// AI Classification Interface
export interface EndorsementCandidate {
  rawText: string;
  sourceUrl: string;
  sourceType: SourceType;
  candidateMentions: string[];
  endorserInfo?: {
    name: string;
    handle?: string;
    organization?: string;
  };
  confidence: number;
  endorsementType: EndorsementType;
  sentiment: SentimentScore;
  requiresHumanReview: boolean;
  aiReasoning: string;
}

  // Data Source Configuration
  export interface DataSource {
    id: string;
    type: 'twitter' | 'instagram' | 'rss' | 'website' | 'google_alerts';
    url: string;
    checkFrequencyMinutes: number;
    isActive: boolean;
    lastChecked?: Date;
    lastSuccess?: Date;
    successRate?: number;
  }

// AI Classification Engine
export class EndorsementClassifier {
  private readonly confidenceThreshold = 0.85;
  private readonly humanReviewThreshold = 0.70;

  // Keywords that indicate endorsement
  private endorsementKeywords = [
    ' endorse ', 'support', 'backing', 'voting for', 'campaigning for',
    'proud to support', 'standing with', 'choosing', 'electing',
    'recommend', ' favor ', ' prefer ', 'rooting for'
  ];

  // Candidate names and variations
  private candidateNames = {
    'zohran mamdani': ['zohran', 'mamdani', '@zohranmamdani'],
    'andrew cuomo': ['cuomo', 'andrew', '@andrewcuomo'],
    'eric adams': ['adams', 'eric', '@ericadams', 'mayor adams'],
    'curtis sliwa': ['sliwa', 'curtis', '@curtissliwa']
  };

  // Sentiment analysis keywords
  private positiveKeywords = [
    'proud', 'excited', 'thrilled', 'honored', 'privileged',
    'strong', 'effective', 'progressive', 'visionary', 'leader'
  ];

  private negativeKeywords = [
    'disappointed', 'concerned', 'worried', 'oppose', 'against',
    'weak', 'ineffective', 'corrupt', 'unfit'
  ];

  async classifyEndorsement(rawData: {
    text: string;
    sourceUrl: string;
    sourceType: SourceType;
    author?: string;
    organization?: string;
  }): Promise<EndorsementCandidate> {
    const text = rawData.text.toLowerCase();
    
    // Extract candidate mentions
    const candidateMentions = this.extractCandidateMentions(text);
    
    // Check for endorsement language
    const hasEndorsementLanguage = this.endorsementKeywords.some(keyword => 
      text.includes(keyword)
    );
    
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(text);
    
    // Determine endorsement type
    const endorsementType = this.determineEndorsementType(text);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence({
      hasEndorsementLanguage,
      candidateMentions: candidateMentions.length,
      sentiment,
      sourceType: rawData.sourceType,
      hasAuthor: !!rawData.author
    });
    
    // Extract endorser information
    const endorserInfo = rawData.author ? {
      name: rawData.author,
      organization: rawData.organization
    } : undefined;

    return {
      rawText: rawData.text,
      sourceUrl: rawData.sourceUrl,
      sourceType: rawData.sourceType,
      candidateMentions,
      endorserInfo,
      confidence,
      endorsementType,
      sentiment,
      requiresHumanReview: confidence < this.humanReviewThreshold,
      aiReasoning: this.generateReasoning({
        hasEndorsementLanguage,
        candidateMentions: candidateMentions.length,
        sentiment,
        confidence
      })
    };
  }

  private extractCandidateMentions(text: string): string[] {
    const mentions: string[] = [];
    
    for (const [candidateName, variations] of Object.entries(this.candidateNames)) {
      if (variations.some(variant => text.includes(variant))) {
        mentions.push(candidateName);
      }
    }
    
    return mentions;
  }

  private analyzeSentiment(text: string): SentimentScore {
    const positiveCount = this.positiveKeywords.filter(keyword => 
      text.includes(keyword)
    ).length;
    
    const negativeCount = this.negativeKeywords.filter(keyword => 
      text.includes(keyword)
    ).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private determineEndorsementType(text: string): EndorsementType {
    if (text.includes('rumor') || text.includes('hearing')) return 'rumored';
    if (text.includes('conditional') || text.includes('if')) return 'conditional';
    if (text.includes('retract') || text.includes('withdraw')) return 'un_endorsement';
    return 'endorsement';
  }

  private calculateConfidence(factors: {
    hasEndorsementLanguage: boolean;
    candidateMentions: number;
    sentiment: SentimentScore;
    sourceType: SourceType;
    hasAuthor: boolean;
  }): number {
    let confidence = 0.5; // Base confidence
    
    // Endorsement language (+0.3)
    if (factors.hasEndorsementLanguage) confidence += 0.3;
    
    // Candidate mentions (+0.2 per mention, max 0.4)
    confidence += Math.min(factors.candidateMentions * 0.2, 0.4);
    
    // Sentiment (+0.1 for positive, -0.1 for negative)
    if (factors.sentiment === 'positive') confidence += 0.1;
    if (factors.sentiment === 'negative') confidence -= 0.1;
    
    // Source type reliability
    const sourceReliability = {
      'twitter': 0.1,
      'instagram': 0.05,
      'press_release': 0.15,
      'interview': 0.1,
      'event': 0.05,
      'website': 0.1
    };
    confidence += sourceReliability[factors.sourceType] || 0;
    
    // Author information (+0.1)
    if (factors.hasAuthor) confidence += 0.1;
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  private generateReasoning(factors: {
    hasEndorsementLanguage: boolean;
    candidateMentions: number;
    sentiment: SentimentScore;
    confidence: number;
  }): string {
    const reasons: string[] = [];
    
    if (factors.hasEndorsementLanguage) {
      reasons.push('Contains explicit endorsement language');
    }
    
    if (factors.candidateMentions > 0) {
      reasons.push(`Mentions ${factors.candidateMentions} candidate(s)`);
    }
    
    if (factors.sentiment === 'positive') {
      reasons.push('Positive sentiment detected');
    } else if (factors.sentiment === 'negative') {
      reasons.push('Negative sentiment detected');
    }
    
    if (factors.confidence >= this.confidenceThreshold) {
      reasons.push('High confidence classification');
    } else if (factors.confidence >= this.humanReviewThreshold) {
      reasons.push('Medium confidence - human review recommended');
    } else {
      reasons.push('Low confidence - requires human verification');
    }
    
    return reasons.join('; ');
  }
}

// Data Collection Pipeline
export class EndorsementCollector {
  private classifier: EndorsementClassifier;
  private sources: Map<string, DataSource>;
  private isRunning: boolean = false;

  constructor() {
    this.classifier = new EndorsementClassifier();
    this.sources = new Map();
  }

  // Add a new data source to monitor
  addDataSource(source: DataSource): void {
    this.sources.set(source.id, source);
  }

  // Start the collection pipeline
  async startCollection(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting endorsement collection pipeline...');
    
    // Start monitoring each source
    for (const source of this.sources.values()) {
      if (source.isActive) {
        this.monitorSource(source);
      }
    }
  }

  // Stop the collection pipeline
  stopCollection(): void {
    this.isRunning = false;
    console.log('Stopping endorsement collection pipeline...');
  }

  // Monitor a specific data source
  private async monitorSource(source: DataSource): Promise<void> {
    while (this.isRunning) {
      try {
        await this.checkSource(source);
        await this.delay(source.checkFrequencyMinutes * 60 * 1000);
      } catch (error) {
        console.error(`Error monitoring source ${source.id}:`, error);
        await this.delay(5 * 60 * 1000); // Wait 5 minutes on error
      }
    }
  }

  // Check a single data source for new endorsements
  private async checkSource(source: DataSource): Promise<void> {
    console.log(`Checking source: ${source.url}`);
    
    let rawData: any[] = [];
    
    switch (source.type) {
      case 'twitter':
        rawData = await this.scrapeTwitter(source.url);
        break;
      case 'instagram':
        rawData = await this.scrapeInstagram(source.url);
        break;
      case 'rss':
        rawData = await this.scrapeRSS(source.url);
        break;
      case 'website':
        rawData = await this.scrapeWebsite(source.url);
        break;
      case 'google_alerts':
        rawData = await this.scrapeGoogleAlerts(source.url);
        break;
    }
    
    // Process each piece of raw data
    for (const data of rawData) {
      const candidate = await this.classifier.classifyEndorsement(data);
      
      if (candidate.candidateMentions.length > 0) {
        await this.processEndorsementCandidate(candidate);
      }
    }
    
    // Update source statistics
    this.updateSourceStats(source.id, true);
  }

  // Mock scraping methods (in real implementation, these would use actual APIs)
  private async scrapeTwitter(url: string): Promise<any[]> {
    // Mock implementation - would use Twitter API v2
    return [
      {
        text: 'I\'m proud to endorse @zohranmamdani for NYC Mayor!',
        sourceUrl: url,
        sourceType: 'twitter' as SourceType,
        author: 'AOC',
        organization: 'U.S. House of Representatives'
      }
    ];
  }

  private async scrapeInstagram(url: string): Promise<any[]> {
    // Mock implementation - would use Instagram Basic Display API
    return [];
  }

  private async scrapeRSS(url: string): Promise<any[]> {
    try {
      // Check all RSS feeds for new items
      const rssItems = await rssFeedParser.checkAllFeeds();
      
      // Convert RSS items to the format expected by the classifier
      return rssItems.map(item => ({
        text: `${item.title} ${item.description}`,
        sourceUrl: item.link,
        sourceType: 'website' as SourceType, // RSS feeds are treated as website sources
        author: item.author,
        organization: item.source,
        pubDate: item.pubDate
      }));
    } catch (error) {
      console.error('Error scraping RSS feeds:', error);
      return [];
    }
  }

  private async scrapeWebsite(url: string): Promise<any[]> {
    // Mock implementation - would use web scraping
    return [];
  }

  private async scrapeGoogleAlerts(url: string): Promise<any[]> {
    // Mock implementation - would use Google Alerts API
    return [];
  }

  // Process a classified endorsement candidate
  private async processEndorsementCandidate(candidate: EndorsementCandidate): Promise<void> {
    console.log('Processing endorsement candidate:', {
      confidence: candidate.confidence,
      requiresReview: candidate.requiresHumanReview,
      reasoning: candidate.aiReasoning
    });
    
    // Store in database for review or automatic approval
    await this.storeEndorsementCandidate(candidate);
    
    // If high confidence, auto-approve
    if (candidate.confidence >= 0.85) {
      await this.autoApproveEndorsement(candidate);
    }
  }

  // Store endorsement candidate in database
  private async storeEndorsementCandidate(candidate: EndorsementCandidate): Promise<void> {
    // TODO: Implement database storage
    console.log('Storing endorsement candidate in database');
  }

  // Auto-approve high-confidence endorsements
  private async autoApproveEndorsement(candidate: EndorsementCandidate): Promise<void> {
    // TODO: Implement auto-approval logic
    console.log('Auto-approving high-confidence endorsement');
  }

  // Update source statistics
  private updateSourceStats(sourceId: string, success: boolean): void {
    const source = this.sources.get(sourceId);
    if (source) {
      source.lastChecked = new Date();
      if (success) {
        source.lastSuccess = new Date();
      }
    }
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get collection statistics
  getStats(): {
    activeSources: number;
    totalSources: number;
    lastCheck: Date | null;
  } {
    const activeSources = Array.from(this.sources.values()).filter(s => s.isActive).length;
    const lastCheck = Array.from(this.sources.values())
      .map(s => s.lastChecked)
      .filter(Boolean)
      .sort()
      .pop() || null;

    return {
      activeSources,
      totalSources: this.sources.size,
      lastCheck
    };
  }
}

// Export singleton instance
export const endorsementCollector = new EndorsementCollector();
export const endorsementClassifier = new EndorsementClassifier(); 