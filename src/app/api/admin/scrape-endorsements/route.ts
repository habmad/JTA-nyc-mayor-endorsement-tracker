import { NextRequest, NextResponse } from 'next/server';
import EndorsementScraper from '@/lib/endorsement-scraper';

export async function POST(request: NextRequest) {
  try {
    const { type, id } = await request.json();
    
    const scraper = new EndorsementScraper();
    let results: any[] = [];
    let endorserName = '';
    let candidateName = '';
    
    switch (type) {
      case 'all':
        console.log('🚀 Starting comprehensive endorsement scraping...');
        await scraper.scrapeAllEndorsements();
        break;
        
      case 'endorser':
        if (!id) {
          return NextResponse.json(
            { error: 'Endorser ID is required for endorser-specific scraping' },
            { status: 400 }
          );
        }
        console.log(`🚀 Starting endorsement scraping for endorser ${id}...`);
        const endorser = await scraper.getEndorserById(id);
        endorserName = endorser?.display_name || endorser?.name || 'Unknown Endorser';
        results = await scraper.scrapeEndorsementsForEndorser(id);
        break;
        
      case 'candidate':
        if (!id) {
          return NextResponse.json(
            { error: 'Candidate ID is required for candidate-specific scraping' },
            { status: 400 }
          );
        }
        console.log(`🚀 Starting endorsement scraping for candidate ${id}...`);
        const candidate = await scraper.getCandidateById(id);
        candidateName = candidate?.name || 'Unknown Candidate';
        results = await scraper.scrapeEndorsementsForCandidate(id);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be "all", "endorser", or "candidate"' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: type === 'endorser' ? `Endorsement scraping completed for ${endorserName}` : 
               type === 'candidate' ? `Endorsement scraping completed for ${candidateName}` :
               `Endorsement scraping completed for type: ${type}`,
      results: results,
      endorserName: endorserName,
      candidateName: candidateName
    });
    
  } catch (error) {
    console.error('❌ Error in endorsement scraping:', error);
    return NextResponse.json(
      { error: 'Failed to scrape endorsements', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endorsement scraper endpoint',
    usage: {
      POST: {
        description: 'Trigger endorsement scraping',
        body: {
          type: '"all" | "endorser" | "candidate"',
          id: 'string (required for endorser/candidate type)'
        }
      }
    }
  });
} 