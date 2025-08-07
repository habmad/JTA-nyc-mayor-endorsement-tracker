import { initializeDatabase } from './init-db';
import EndorsementScraper from './endorsement-scraper';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

async function testScraper() {
  try {
    console.log('🚀 Starting endorsement scraper test...');
    
    // Initialize database first
    await initializeDatabase();
    
    // Create scraper instance
    const scraper = new EndorsementScraper();
    
    // Test with a small subset first
    console.log('🔍 Testing scraper with first few endorsers...');
    
    // Get endorsers and candidates
    const endorsers = await scraper['getEndorsers']();
    const candidates = await scraper['getCandidates']();
    
    console.log(`📊 Found ${endorsers.length} endorsers and ${candidates.length} candidates`);
    
    // Test with just the first endorser and first candidate
    if (endorsers.length > 0 && candidates.length > 0) {
      const testEndorser = endorsers[0];
      const testCandidate = candidates[0];
      
      console.log(`🧪 Testing: ${testEndorser.name} → ${testCandidate.name}`);
      
      const endorsements = await scraper['searchForEndorsements'](testEndorser);
      
      if (endorsements.length > 0) {
        console.log(`✅ Found ${endorsements.length} endorsement(s):`);
        endorsements.forEach((endorsement, index) => {
          console.log(`  ${index + 1}. ${endorsement.source_title}`);
          console.log(`     URL: ${endorsement.source_url}`);
          console.log(`     Quote: ${endorsement.quote.substring(0, 100)}...`);
          console.log(`     Candidate: ${endorsement.candidate_name || 'Unknown'}`);
        });
        
        // Save to database
        await scraper['saveEndorsements'](endorsements, testEndorser.id);
        console.log('💾 Saved to database');
      } else {
        console.log('❌ No endorsements found for this endorser');
      }
    } else {
      console.log('❌ No endorsers or candidates found in database');
    }
    
    console.log('✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testScraper()
    .then(() => {
      console.log('🎉 Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export default testScraper; 