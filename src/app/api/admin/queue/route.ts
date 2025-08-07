import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Get unverified endorsements (confidence = 'reported' or 'rumored')
    const unverifiedResult = await sql`
      SELECT 
        e.*,
        ai_confidence,
        ai_reasoning
      FROM endorsements e
      LEFT JOIN endorsement_ai_analysis aia ON e.id = aia.endorsement_id
      WHERE e.confidence IN ('reported', 'rumored')
      ORDER BY e.discovered_at DESC
    `;

    // Get flagged endorsements
    const flaggedResult = await sql`
      SELECT 
        e.*,
        flag_reason
      FROM endorsements e
      LEFT JOIN endorsement_flags ef ON e.id = ef.endorsement_id
      WHERE ef.id IS NOT NULL
      ORDER BY e.discovered_at DESC
    `;

    // Get retractions
    const retractionsResult = await sql`
      SELECT 
        e.*,
        retraction_evidence
      FROM endorsements e
      WHERE e.is_retracted = true
      ORDER BY e.retracted_at DESC
    `;

    // Get potential duplicates (same endorser + candidate + similar dates)
    const duplicatesResult = await sql`
      SELECT 
        endorser_id,
        candidate_id,
        COUNT(*) as count,
        array_agg(id) as endorsement_ids
      FROM endorsements
      WHERE confidence IN ('reported', 'rumored', 'confirmed')
      GROUP BY endorser_id, candidate_id
      HAVING COUNT(*) > 1
    `;

    return NextResponse.json({
      success: true,
      queue: {
        unverified: unverifiedResult.rows,
        flagged: flaggedResult.rows,
        retractions: retractionsResult.rows,
        duplicates: duplicatesResult.rows.map(row => ({
          group_id: `${row.endorser_id}-${row.candidate_id}`,
          endorsements: row.endorsement_ids
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching admin queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin queue' },
      { status: 500 }
    );
  }
} 