import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { RSSFeedConfig } from '../../../../lib/rss-parser';

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        id, name, url, check_frequency_minutes as checkFrequencyMinutes,
        is_active as isActive, keywords, exclude_keywords as excludeKeywords
      FROM rss_feeds 
      WHERE is_active = true
      ORDER BY name
    `;
    
    const feeds: RSSFeedConfig[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      url: row.url,
      checkFrequencyMinutes: row.checkfrequencyminutes,
      isActive: row.isactive,
      keywords: row.keywords || [],
      excludeKeywords: row.excludekeywords || []
    }));
    
    return NextResponse.json({
      success: true,
      feeds
    });
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSS feeds' },
      { status: 500 }
    );
  }
} 