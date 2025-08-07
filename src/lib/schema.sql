-- Comprehensive database schema for EndorseNYC
-- This replaces the hardcoded data with a proper database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Endorsers table (replaces hardcoded endorser data)
CREATE TABLE IF NOT EXISTS endorsers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    title VARCHAR(255),
    organization VARCHAR(255),
    category VARCHAR(50) NOT NULL CHECK (category IN ('politician', 'union', 'celebrity', 'media', 'business', 'nonprofit', 'academic', 'religious')),
    subcategory VARCHAR(100),
    borough VARCHAR(100),
    district VARCHAR(50),
    demographic_tags TEXT[],
    influence_score INTEGER NOT NULL CHECK (influence_score >= 0 AND influence_score <= 100),
    follower_count INTEGER,
    media_mentions_30d INTEGER,
    twitter_handle VARCHAR(100),
    instagram_handle VARCHAR(100),
    linkedin_url VARCHAR(255),
    personal_website VARCHAR(255),
    is_organization BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSS Feed Categories table
CREATE TABLE IF NOT EXISTS rss_feed_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20),
    check_frequency_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSS Feeds table (replaces hardcoded RSS feeds)
CREATE TABLE IF NOT EXISTS rss_feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES rss_feed_categories(id),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL UNIQUE,
    description TEXT,
    keywords TEXT[],
    exclude_keywords TEXT[],
    check_frequency_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    last_check_at TIMESTAMP WITH TIME ZONE,
    last_success_at TIMESTAMP WITH TIME ZONE,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Endorser-Specific RSS Feeds table
CREATE TABLE IF NOT EXISTS endorser_rss_feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endorser_id UUID REFERENCES endorsers(id) ON DELETE CASCADE,
    feed_id UUID REFERENCES rss_feeds(id) ON DELETE CASCADE,
    search_terms TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(endorser_id, feed_id)
);

-- Candidates table (existing)
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    party VARCHAR(100),
    photo_url VARCHAR(500),
    website VARCHAR(255),
    bio TEXT,
    campaign_color VARCHAR(7),
    position_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Endorsements table (existing)
CREATE TABLE IF NOT EXISTS endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endorser_id UUID REFERENCES endorsers(id),
    candidate_id UUID REFERENCES candidates(id),
    source_url VARCHAR(500),
    source_type VARCHAR(50),
    source_title TEXT,
    quote TEXT,
    endorsement_type VARCHAR(50),
    sentiment VARCHAR(50),
    confidence VARCHAR(50),
    strength VARCHAR(50),
    endorsed_at TIMESTAMP WITH TIME ZONE,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    is_retracted BOOLEAN DEFAULT FALSE,
    retraction_reason TEXT,
    retracted_at TIMESTAMP WITH TIME ZONE,
    context_tags TEXT[],
    related_endorsement_id UUID REFERENCES endorsements(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Configuration table
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_endorsers_category ON endorsers(category);
CREATE INDEX IF NOT EXISTS idx_endorsers_influence ON endorsers(influence_score);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_category ON rss_feeds(category_id);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_active ON rss_feeds(is_active);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser ON endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_candidate ON endorsements(candidate_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_discovered ON endorsements(discovered_at);

-- Insert default RSS feed categories
INSERT INTO rss_feed_categories (name, description, color, check_frequency_minutes) VALUES
('Political News', 'Major NYC political news outlets and publications', 'blue', 30),
('Union & Labor', 'Labor unions and worker organizations', 'red', 30),
('Business & Finance', 'Business publications and financial news', 'green', 30),
('Entertainment & Celebrity', 'Entertainment news and celebrity coverage', 'purple', 30),
('Religious & Community', 'Religious organizations and community publications', 'gray', 30),
('Nonprofit & Advocacy', 'Advocacy groups and nonprofit organizations', 'pink', 30),
('Academic & Think Tanks', 'Policy research and academic institutions', 'indigo', 30),
('Endorser-Specific', 'Individual endorser monitoring feeds', 'yellow', 15)
ON CONFLICT (name) DO NOTHING;

-- Insert default RSS feeds
INSERT INTO rss_feeds (category_id, name, url, description, keywords, exclude_keywords) 
SELECT 
    c.id,
    f.name,
    f.url,
    f.description,
    f.keywords,
    f.exclude_keywords
FROM (
    VALUES 
        ('Political News', 'NYT Politics', 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', 'New York Times Politics', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'AMNY Politics', 'https://www.amny.com/politics/feed/', 'AMNY Politics', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'NY1 Politics', 'https://www.ny1.com/feed/politics', 'NY1 Politics', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'Gothamist Politics', 'https://gothamist.com/feed/politics', 'Gothamist Politics', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'Brooklyn Eagle Politics', 'https://brooklyneagle.com/category/politics/feed/', 'Brooklyn Eagle Politics', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'Queens Eagle Politics', 'https://queenseagle.com/category/politics/feed/', 'Queens Eagle Politics', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'Bronx Times Politics', 'https://www.bxtimes.com/category/politics/feed/', 'Bronx Times Politics', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'Staten Island Advance Politics', 'https://www.silive.com/politics/feed/', 'Staten Island Advance Politics', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'City & State NY', 'https://www.cityandstateny.com/feed', 'City & State NY', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'Politico NY', 'https://www.politico.com/rss/state_news_ny.xml', 'Politico NY', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'Crain\'s New York Politics', 'https://www.crainsnewyork.com/politics', 'Crain\'s New York Politics', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'New York Observer', 'https://observer.com/feed/', 'New York Observer', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'Capital New York', 'https://www.capitalnewyork.com/feed', 'Capital New York', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'The City', 'https://www.thecity.nyc/feed', 'The City', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Political News', 'Streetsblog NYC', 'https://nyc.streetsblog.org/feed/', 'Streetsblog NYC', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york'], ARRAY['obituary', 'death', 'funeral']),
        ('Union & Labor', 'Labor Press', 'https://laborpress.org/feed/', 'Labor Press', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor'], ARRAY['obituary', 'death', 'funeral']),
        ('Union & Labor', 'Workers World', 'https://www.workers.org/feed/', 'Workers World', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor'], ARRAY['obituary', 'death', 'funeral']),
        ('Union & Labor', 'AFL-CIO News', 'https://aflcio.org/feed', 'AFL-CIO News', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor'], ARRAY['obituary', 'death', 'funeral']),
        ('Union & Labor', 'SEIU News', 'https://www.seiu.org/feed', 'SEIU News', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor'], ARRAY['obituary', 'death', 'funeral']),
        ('Union & Labor', 'Teamsters News', 'https://teamster.org/feed', 'Teamsters News', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor'], ARRAY['obituary', 'death', 'funeral']),
        ('Union & Labor', 'UFT News', 'https://www.uft.org/news', 'UFT News', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor', 'teachers'], ARRAY['obituary', 'death', 'funeral']),
        ('Union & Labor', 'DC37 News', 'https://www.dc37.net/news', 'DC37 News', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor', 'public_employees'], ARRAY['obituary', 'death', 'funeral']),
        ('Business & Finance', 'Crain\'s New York Business', 'https://www.crainsnewyork.com/rss.xml', 'Crain\'s New York Business', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business'], ARRAY['obituary', 'death', 'funeral']),
        ('Business & Finance', 'New York Business Journal', 'https://www.bizjournals.com/newyork/news/feed', 'New York Business Journal', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business'], ARRAY['obituary', 'death', 'funeral']),
        ('Business & Finance', 'Wall Street Journal', 'https://feeds.wsj.com/wsj/us', 'Wall Street Journal', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business'], ARRAY['obituary', 'death', 'funeral']),
        ('Business & Finance', 'Bloomberg', 'https://feeds.bloomberg.com/markets/news.rss', 'Bloomberg', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business'], ARRAY['obituary', 'death', 'funeral']),
        ('Business & Finance', 'Fortune', 'https://fortune.com/feed/', 'Fortune', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business'], ARRAY['obituary', 'death', 'funeral']),
        ('Business & Finance', 'Forbes', 'https://www.forbes.com/business/feed/', 'Forbes', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business'], ARRAY['obituary', 'death', 'funeral']),
        ('Business & Finance', 'Real Estate Weekly', 'https://rew-online.com/feed/', 'Real Estate Weekly', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business', 'real_estate'], ARRAY['obituary', 'death', 'funeral']),
        ('Business & Finance', 'Commercial Observer', 'https://commercialobserver.com/feed/', 'Commercial Observer', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business', 'real_estate'], ARRAY['obituary', 'death', 'funeral']),
        ('Entertainment & Celebrity', 'Variety', 'https://variety.com/feed/', 'Variety', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'entertainment'], ARRAY['obituary', 'death', 'funeral']),
        ('Entertainment & Celebrity', 'Hollywood Reporter', 'https://www.hollywoodreporter.com/feed/', 'Hollywood Reporter', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'entertainment'], ARRAY['obituary', 'death', 'funeral']),
        ('Entertainment & Celebrity', 'Page Six', 'https://pagesix.com/feed/', 'Page Six', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'celebrity'], ARRAY['obituary', 'death', 'funeral']),
        ('Entertainment & Celebrity', 'TMZ', 'https://www.tmz.com/feed/', 'TMZ', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'celebrity'], ARRAY['obituary', 'death', 'funeral']),
        ('Religious & Community', 'Catholic New York', 'https://cny.org/feed/', 'Catholic New York', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'catholic'], ARRAY['obituary', 'death', 'funeral']),
        ('Religious & Community', 'Jewish Week', 'https://jewishweek.timesofisrael.com/feed/', 'Jewish Week', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'jewish'], ARRAY['obituary', 'death', 'funeral']),
        ('Religious & Community', 'Amsterdam News', 'https://amsterdamnews.com/feed/', 'Amsterdam News', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'community'], ARRAY['obituary', 'death', 'funeral']),
        ('Religious & Community', 'El Diario', 'https://eldiariony.com/feed/', 'El Diario', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'latino'], ARRAY['obituary', 'death', 'funeral']),
        ('Nonprofit & Advocacy', 'Nonprofit Quarterly', 'https://nonprofitquarterly.org/feed/', 'Nonprofit Quarterly', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'nonprofit'], ARRAY['obituary', 'death', 'funeral']),
        ('Nonprofit & Advocacy', 'Chronicle of Philanthropy', 'https://www.philanthropy.com/feed', 'Chronicle of Philanthropy', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'nonprofit'], ARRAY['obituary', 'death', 'funeral']),
        ('Nonprofit & Advocacy', 'Inside Philanthropy', 'https://www.insidephilanthropy.com/feed', 'Inside Philanthropy', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'nonprofit'], ARRAY['obituary', 'death', 'funeral']),
        ('Academic & Think Tanks', 'Brookings Institution', 'https://www.brookings.edu/feed/', 'Brookings Institution', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'policy'], ARRAY['obituary', 'death', 'funeral']),
        ('Academic & Think Tanks', 'Urban Institute', 'https://www.urban.org/feed', 'Urban Institute', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'policy'], ARRAY['obituary', 'death', 'funeral']),
        ('Academic & Think Tanks', 'Manhattan Institute', 'https://manhattan.institute/feed', 'Manhattan Institute', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'policy'], ARRAY['obituary', 'death', 'funeral']),
        ('Academic & Think Tanks', 'Center for an Urban Future', 'https://nycfuture.org/feed', 'Center for an Urban Future', ARRAY['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'policy'], ARRAY['obituary', 'death', 'funeral'])
) AS f(category_name, name, url, description, keywords, exclude_keywords)
JOIN rss_feed_categories c ON c.name = f.category_name
ON CONFLICT (url) DO NOTHING; 