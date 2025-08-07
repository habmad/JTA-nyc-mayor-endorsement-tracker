import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        id, name, display_name, title, organization, category, subcategory, 
        borough, influence_score, twitter_handle, instagram_handle
      FROM endorsers 
      ORDER BY influence_score DESC
    `;
    
    return NextResponse.json({ endorsers: result.rows });
  } catch (error) {
    console.error('Error fetching endorsers:', error);
    return NextResponse.json({ error: 'Failed to fetch endorsers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      display_name,
      title,
      organization,
      category,
      subcategory,
      borough,
      influence_score,
      twitter_handle,
      instagram_handle,
      linkedin_url,
      personal_website,
      is_organization = false
    } = body;

    // Validate required fields
    if (!name || !category || influence_score === undefined) {
      return NextResponse.json(
        { error: 'Name, category, and influence_score are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['politician', 'union', 'celebrity', 'media', 'business', 'nonprofit', 'academic', 'religious'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: ' + validCategories.join(', ') },
        { status: 400 }
      );
    }

    // Validate influence_score
    if (influence_score < 0 || influence_score > 100) {
      return NextResponse.json(
        { error: 'Influence score must be between 0 and 100' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO endorsers (
        name, display_name, title, organization, category, subcategory,
        borough, influence_score, twitter_handle, instagram_handle,
        linkedin_url, personal_website, is_organization
      ) VALUES (
        ${name}, ${display_name}, ${title}, ${organization}, ${category}, ${subcategory},
        ${borough}, ${influence_score}, ${twitter_handle}, ${instagram_handle},
        ${linkedin_url}, ${personal_website}, ${is_organization}
      ) RETURNING id, name, display_name, title, organization, category, subcategory,
        borough, influence_score, twitter_handle, instagram_handle
    `;

    return NextResponse.json({ 
      message: 'Endorser added successfully',
      endorser: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding endorser:', error);
    return NextResponse.json({ error: 'Failed to add endorser' }, { status: 500 });
  }
} 