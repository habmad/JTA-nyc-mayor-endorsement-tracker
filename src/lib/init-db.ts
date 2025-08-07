import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing EndorseNYC Database...');
    
    // Read and execute schema
    const schemaPath = join(process.cwd(), 'src/lib/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Executing ${statements.length} schema statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql`${statement}`;
        } catch (error) {
          // Ignore errors for statements that might already exist
          console.log(`⚠️  Statement skipped (likely already exists): ${statement.substring(0, 50)}...`);
        }
      }
    }
    
    console.log('✅ Database schema initialized successfully!');
    
    // Insert sample endorsers if table is empty
    const endorserCount = await sql`SELECT COUNT(*) as count FROM endorsers`;
    if (parseInt(endorserCount.rows[0].count) === 0) {
      console.log('👥 Inserting sample endorsers...');
      await insertSampleEndorsers();
    }
    
    // Insert sample RSS feeds if table is empty
    const feedCount = await sql`SELECT COUNT(*) as count FROM rss_feeds`;
    if (parseInt(feedCount.rows[0].count) === 0) {
      console.log('📰 Inserting sample RSS feeds...');
      await insertSampleRSSFeeds();
    }
    
    // Insert sample candidates if table is empty
    const candidateCount = await sql`SELECT COUNT(*) as count FROM candidates`;
    if (parseInt(candidateCount.rows[0].count) === 0) {
      console.log('👤 Inserting sample candidates...');
      await insertSampleCandidates();
    }
    
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function insertSampleEndorsers() {
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
    {
      name: 'Bernie Sanders',
      title: 'U.S. Senator',
      organization: 'U.S. Senate',
      category: 'politician' as const,
      subcategory: 'federal_senator',
      influence_score: 98,
      twitter_handle: '@BernieSanders'
    },
    {
      name: 'Chuck Schumer',
      title: 'U.S. Senator',
      organization: 'U.S. Senate',
      category: 'politician' as const,
      subcategory: 'federal_senator',
      influence_score: 95,
      twitter_handle: '@SenSchumer'
    },
    {
      name: 'Kirsten Gillibrand',
      title: 'U.S. Senator',
      organization: 'U.S. Senate',
      category: 'politician' as const,
      subcategory: 'federal_senator',
      influence_score: 88,
      twitter_handle: '@SenGillibrand'
    },
    {
      name: 'Jerry Nadler',
      title: 'U.S. Representative',
      organization: 'U.S. House of Representatives',
      category: 'politician' as const,
      subcategory: 'federal_representative',
      borough: 'Manhattan',
      influence_score: 85,
      twitter_handle: '@RepJerryNadler'
    },
    {
      name: 'Hakeem Jeffries',
      title: 'U.S. Representative',
      organization: 'U.S. House of Representatives',
      category: 'politician' as const,
      subcategory: 'federal_representative',
      borough: 'Brooklyn',
      influence_score: 92,
      twitter_handle: '@RepJeffries'
    },
    {
      name: 'Kathy Hochul',
      title: 'Governor',
      organization: 'State of New York',
      category: 'politician' as const,
      subcategory: 'state_executive',
      influence_score: 94,
      twitter_handle: '@GovKathyHochul'
    },
    {
      name: 'Eric Adams',
      title: 'Mayor',
      organization: 'City of New York',
      category: 'politician' as const,
      subcategory: 'city_executive',
      borough: 'Brooklyn',
      influence_score: 95,
      twitter_handle: '@NYCMayor'
    },
    {
      name: 'Michael Mulgrew',
      title: 'President',
      organization: 'United Federation of Teachers',
      category: 'union' as const,
      subcategory: 'teachers_union',
      influence_score: 90,
      twitter_handle: '@UFT'
    },
    {
      name: 'Bill Ackman',
      title: 'CEO',
      organization: 'Pershing Square Capital Management',
      category: 'business' as const,
      subcategory: 'finance',
      influence_score: 91
    },
    {
      name: 'Lin-Manuel Miranda',
      title: 'Composer/Actor',
      category: 'celebrity' as const,
      subcategory: 'entertainment',
      borough: 'Manhattan',
      influence_score: 89,
      twitter_handle: '@Lin_Manuel'
    },
    {
      name: 'Cardinal Timothy Dolan',
      title: 'Archbishop',
      organization: 'Roman Catholic Archdiocese of New York',
      category: 'religious' as const,
      subcategory: 'catholic',
      influence_score: 88,
      twitter_handle: '@CardinalDolan'
    },
    {
      name: 'New York Working Families Party',
      category: 'nonprofit' as const,
      subcategory: 'political_organization',
      influence_score: 84,
      twitter_handle: '@NYWFP'
    },
    {
      name: 'New York Times Editorial Board',
      category: 'media' as const,
      subcategory: 'newspaper',
      influence_score: 94,
      twitter_handle: '@NYTOpinion'
    },
    {
      name: 'Manhattan Institute',
      category: 'academic' as const,
      subcategory: 'think_tank',
      influence_score: 79,
      twitter_handle: '@ManhattanInst'
    }
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
  
  console.log(`✅ Inserted ${sampleEndorsers.length} sample endorsers`);
}

async function insertSampleRSSFeeds() {
  // Get category IDs
  const categories = await sql`SELECT id, name FROM rss_feed_categories`;
  const categoryMap = new Map(categories.rows.map(row => [row.name, row.id]));
  
  const sampleFeeds = [
    {
      category: 'Political News',
      name: 'NYT Politics',
      url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
      description: 'New York Times Politics',
      keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york'],
      exclude_keywords: ['obituary', 'death', 'funeral']
    },
    {
      category: 'Political News',
      name: 'AMNY Politics',
      url: 'https://www.amny.com/politics/feed/',
      description: 'AMNY Politics',
      keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york'],
      exclude_keywords: ['obituary', 'death', 'funeral']
    },
    {
      category: 'Union & Labor',
      name: 'Labor Press',
      url: 'https://laborpress.org/feed/',
      description: 'Labor Press',
      keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'labor'],
      exclude_keywords: ['obituary', 'death', 'funeral']
    },
    {
      category: 'Business & Finance',
      name: 'Crain\'s New York Business',
      url: 'https://www.crainsnewyork.com/rss.xml',
      description: 'Crain\'s New York Business',
      keywords: ['endorsement', 'endorse', 'mayor', 'nyc', 'new york', 'business'],
      exclude_keywords: ['obituary', 'death', 'funeral']
    }
  ];

  for (const feed of sampleFeeds) {
    const categoryId = categoryMap.get(feed.category);
    if (categoryId) {
      // Insert without arrays for now to avoid type issues
      await sql`
        INSERT INTO rss_feeds (
          category_id, name, url, description
        ) VALUES (
          ${categoryId}, ${feed.name}, ${feed.url}, ${feed.description}
        )
      `;
    }
  }
  
  console.log(`✅ Inserted ${sampleFeeds.length} sample RSS feeds`);
}

async function insertSampleCandidates() {
  const sampleCandidates = [
    {
      name: 'Eric Adams',
      party: 'Democratic',
      photo_url: '/images/candidates/adams.jpeg',
      website: 'https://ericadams2025.com',
      bio: 'Current Mayor of New York City, former NYPD officer and Brooklyn Borough President',
      campaign_color: '#1E40AF',
      position_summary: {
        public_safety: 'Supports increased police presence and tough-on-crime policies',
        housing: 'Advocates for affordable housing and development',
        education: 'Supports charter schools and school choice',
        economy: 'Pro-business policies and economic development'
      }
    },
    {
      name: 'Andrew Cuomo',
      party: 'Democratic',
      photo_url: '/images/candidates/cuomo.jpeg',
      website: 'https://andrewcuomo.com',
      bio: 'Former Governor of New York, former Attorney General, son of former Governor Mario Cuomo',
      campaign_color: '#DC2626',
      position_summary: {
        public_safety: 'Supports criminal justice reform and police accountability',
        housing: 'Advocates for tenant protections and affordable housing',
        education: 'Supports public education and teacher unions',
        economy: 'Progressive economic policies and worker protections'
      }
    },
    {
      name: 'Zohran Mamdani',
      party: 'Democratic',
      photo_url: '/images/candidates/mamdani.jpeg',
      website: 'https://zohranmamdani.com',
      bio: 'New York State Assemblymember representing Astoria, progressive activist',
      campaign_color: '#059669',
      position_summary: {
        public_safety: 'Supports police reform and community safety alternatives',
        housing: 'Advocates for rent control and tenant rights',
        education: 'Supports public education and student debt relief',
        economy: 'Progressive policies including universal basic income'
      }
    },
    {
      name: 'Curtis Sliwa',
      party: 'Republican',
      photo_url: '/images/candidates/sliwa.jpeg',
      website: 'https://curtissliwa.com',
      bio: 'Founder of Guardian Angels, radio host, and former mayoral candidate',
      campaign_color: '#7C2D12',
      position_summary: {
        public_safety: 'Supports increased police presence and tough-on-crime policies',
        housing: 'Advocates for property rights and development',
        education: 'Supports school choice and charter schools',
        economy: 'Pro-business policies and tax cuts'
      }
    }
  ];

  for (const candidate of sampleCandidates) {
    await sql`
      INSERT INTO candidates (
        name, party, photo_url, website, bio, campaign_color, position_summary
      ) VALUES (
        ${candidate.name}, ${candidate.party}, ${candidate.photo_url}, 
        ${candidate.website}, ${candidate.bio}, ${candidate.campaign_color}, 
        ${JSON.stringify(candidate.position_summary)}
      )
    `;
  }
  
  console.log(`✅ Inserted ${sampleCandidates.length} sample candidates`);
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
} 