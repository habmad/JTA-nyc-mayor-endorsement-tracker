import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        id, endorser_id, candidate_id, source_url, source_type,
        source_title, quote, endorsement_type, sentiment, confidence,
        strength, endorsed_at, discovered_at, verified_by, verified_at,
        verification_notes, is_retracted, retraction_reason, retracted_at,
        context_tags, related_endorsement_id, created_at, updated_at
      FROM endorsements 
      ORDER BY discovered_at DESC
    `;
    
    return NextResponse.json({
      success: true,
      endorsements: result.rows
    });
  } catch (error) {
    console.error('Error fetching endorsements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch endorsements' },
      { status: 500 }
    );
  }
} 