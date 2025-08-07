export type EndorserCategory = 'politician' | 'union' | 'celebrity' | 'media' | 'business' | 'nonprofit' | 'academic' | 'religious';
export type VerifiedStatus = 'unverified' | 'verified' | 'flagged';
export type SourceType = 'twitter' | 'instagram' | 'press_release' | 'interview' | 'event' | 'website';
export type EndorsementType = 'endorsement' | 'un_endorsement' | 'conditional' | 'rumored';
export type SentimentScore = 'positive' | 'neutral' | 'negative';
export type ConfidenceLevel = 'rumored' | 'reported' | 'confirmed';
export type EndorsementStrength = 'weak' | 'standard' | 'strong' | 'enthusiastic';
export type UserRole = 'viewer' | 'editor' | 'admin' | 'super_admin';

export interface Candidate {
  id: string;
  name: string;
  party: string | null;
  photo_url: string | null;
  website: string | null;
  bio: string | null;
  campaign_color: string | null;
  position_summary: Record<string, string> | null;
  created_at: Date;
}

export interface Endorser {
  id: string;
  name: string;
  display_name: string | null;
  title: string | null;
  organization: string | null;
  category: EndorserCategory;
  subcategory: string | null;
  borough: string | null;
  district: string | null;
  demographic_tags: string[] | null;
  influence_score: number | null;
  follower_count: number | null;
  media_mentions_30d: number | null;
  twitter_handle: string | null;
  instagram_handle: string | null;
  linkedin_url: string | null;
  personal_website: string | null;
  is_organization: boolean;
  verification_status: VerifiedStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Endorsement {
  id: string;
  endorser_id: string;
  candidate_id: string;
  source_url: string;
  source_type: SourceType;
  source_title: string | null;
  quote: string | null;
  endorsement_type: EndorsementType;
  sentiment: SentimentScore;
  confidence: ConfidenceLevel;
  strength: EndorsementStrength;
  endorsed_at: Date | null;
  discovered_at: Date;
  verified_by: string | null;
  verified_at: Date | null;
  verification_notes: string | null;
  is_retracted: boolean;
  retraction_reason: string | null;
  retracted_at: Date | null;
  context_tags: string[] | null;
  related_endorsement_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  permissions: Record<string, any> | null;
  last_login: Date | null;
  login_count: number;
  created_at: Date;
}

export interface DataSource {
  id: string;
  endorser_id: string;
  source_type: 'twitter' | 'rss' | 'instagram' | 'website' | 'google_alerts';
  source_url: string;
  last_checked: Date | null;
  last_success: Date | null;
  check_frequency_minutes: number;
  is_active: boolean;
  success_rate: number | null;
  avg_response_time_ms: number | null;
  error_count: number;
  last_error: string | null;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: 'create' | 'update' | 'delete' | 'verify' | 'retract';
  table_name: string;
  record_id: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: Date;
}

// API Response types
export interface EndorsementSummary {
  totalCount: number;
  confidenceBreakdown: {
    confirmed: number;
    reported: number;
    rumored: number;
  };
  categoryBreakdown: Array<{
    category: EndorserCategory;
    count: number;
    influenceScore: number;
  }>;
  influenceScore: number;
  momentum: {
    recentEndorsements: number;
    trendDirection: 'up' | 'down' | 'stable';
  };
}

export interface CoalitionAnalysis {
  totalEndorsements: number;
  uniqueEndorsers: number;
  topCategories: Array<{
    category: EndorserCategory;
    count: number;
    percentage: number;
  }>;
  influenceDistribution: {
    high: number; // 80-100
    medium: number; // 60-79
    low: number; // 1-59
  };
} 