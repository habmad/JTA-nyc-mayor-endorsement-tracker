import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        id, name, party, photo_url, website, bio, 
        campaign_color, position_summary, created_at
      FROM candidates 
      ORDER BY name
    `;
    
    return NextResponse.json({
      success: true,
      candidates: result.rows
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
} 