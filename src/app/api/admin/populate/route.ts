import { NextRequest, NextResponse } from 'next/server';
import { populateEndorsements } from '../../../../lib/populate-endorsements';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting population via API...');
    await populateEndorsements();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database populated successfully with endorsers and endorsements from the article' 
    });
  } catch (error) {
    console.error('Error populating database:', error);
    return NextResponse.json(
      { error: 'Failed to populate database' },
      { status: 500 }
    );
  }
} 