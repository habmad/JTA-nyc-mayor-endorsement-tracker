import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function cleanDuplicates() {
  try {
    console.log('🧹 Starting duplicate cleanup...');
    
    // 1. Clean duplicate candidates (handle foreign key constraints)
    console.log('\n📋 Checking for duplicate candidates...');
    const duplicateCandidates = await sql`
      SELECT name, COUNT(*) as count
      FROM candidates 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateCandidates.rows.length > 0) {
      console.log(`Found ${duplicateCandidates.rows.length} candidates with duplicates:`);
      for (const candidate of duplicateCandidates.rows) {
        console.log(`  - ${candidate.name}: ${candidate.count} duplicates`);
        
        // Get all candidate IDs for this name
        const candidateIds = await sql`
          SELECT id FROM candidates WHERE name = ${candidate.name} ORDER BY created_at
        `;
        
        if (candidateIds.rows.length > 1) {
          const keepId = candidateIds.rows[0].id; // Keep the first one
          const deleteIds = candidateIds.rows.slice(1).map(row => row.id);
          
          // Update endorsements to reference the kept candidate
          for (const deleteId of deleteIds) {
            await sql`
              UPDATE endorsements 
              SET candidate_id = ${keepId}
              WHERE candidate_id = ${deleteId}
            `;
          }
          
          // Now delete the duplicate candidates
          for (const deleteId of deleteIds) {
            await sql`
              DELETE FROM candidates 
              WHERE id = ${deleteId}
            `;
          }
        }
      }
    } else {
      console.log('✅ No duplicate candidates found');
    }
    
    // 2. Clean duplicate endorsers (handle foreign key constraints)
    console.log('\n👥 Checking for duplicate endorsers...');
    const duplicateEndorsers = await sql`
      SELECT name, COUNT(*) as count
      FROM endorsers 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateEndorsers.rows.length > 0) {
      console.log(`Found ${duplicateEndorsers.rows.length} endorsers with duplicates:`);
      for (const endorser of duplicateEndorsers.rows) {
        console.log(`  - ${endorser.name}: ${endorser.count} duplicates`);
        
        // Get all endorser IDs for this name
        const endorserIds = await sql`
          SELECT id FROM endorsers WHERE name = ${endorser.name} ORDER BY created_at
        `;
        
        if (endorserIds.rows.length > 1) {
          const keepId = endorserIds.rows[0].id; // Keep the first one
          const deleteIds = endorserIds.rows.slice(1).map(row => row.id);
          
          // Update endorsements to reference the kept endorser
          for (const deleteId of deleteIds) {
            await sql`
              UPDATE endorsements 
              SET endorser_id = ${keepId}
              WHERE endorser_id = ${deleteId}
            `;
          }
          
          // Now delete the duplicate endorsers
          for (const deleteId of deleteIds) {
            await sql`
              DELETE FROM endorsers 
              WHERE id = ${deleteId}
            `;
          }
        }
      }
    } else {
      console.log('✅ No duplicate endorsers found');
    }
    
    // 3. Clean duplicate endorsements
    console.log('\n🤝 Checking for duplicate endorsements...');
    const duplicateEndorsements = await sql`
      SELECT 
        er.name as endorser_name,
        c.name as candidate_name,
        e.source_url,
        e.endorsed_at,
        COUNT(*) as count
      FROM endorsements e
      JOIN endorsers er ON e.endorser_id = er.id
      JOIN candidates c ON e.candidate_id = c.id
      GROUP BY er.name, c.name, e.source_url, e.endorsed_at
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateEndorsements.rows.length > 0) {
      console.log(`Found ${duplicateEndorsements.rows.length} endorsement groups with duplicates:`);
      for (const endorsement of duplicateEndorsements.rows) {
        console.log(`  - ${endorsement.endorser_name} → ${endorsement.candidate_name}: ${endorsement.count} duplicates`);
        
        // Keep the first one, delete the rest
        await sql`
          DELETE FROM endorsements 
          WHERE id IN (
            SELECT e.id
            FROM endorsements e
            JOIN endorsers er ON e.endorser_id = er.id
            JOIN candidates c ON e.candidate_id = c.id
            WHERE er.name = ${endorsement.endorser_name}
            AND c.name = ${endorsement.candidate_name}
            AND e.source_url = ${endorsement.source_url}
            AND e.endorsed_at = ${endorsement.endorsed_at}
            AND e.id NOT IN (
              SELECT e2.id
              FROM endorsements e2
              JOIN endorsers er2 ON e2.endorser_id = er2.id
              JOIN candidates c2 ON e2.candidate_id = c2.id
              WHERE er2.name = ${endorsement.endorser_name}
              AND c2.name = ${endorsement.candidate_name}
              AND e2.source_url = ${endorsement.source_url}
              AND e2.endorsed_at = ${endorsement.endorsed_at}
              LIMIT 1
            )
          )
        `;
      }
    } else {
      console.log('✅ No duplicate endorsements found');
    }
    
    // 4. Clean duplicate RSS feeds
    console.log('\n📰 Checking for duplicate RSS feeds...');
    const duplicateRSSFeeds = await sql`
      SELECT url, COUNT(*) as count
      FROM rss_feeds 
      GROUP BY url 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateRSSFeeds.rows.length > 0) {
      console.log(`Found ${duplicateRSSFeeds.rows.length} RSS feeds with duplicates:`);
      for (const feed of duplicateRSSFeeds.rows) {
        console.log(`  - ${feed.url}: ${feed.count} duplicates`);
        
        // Keep the first one, delete the rest
        await sql`
          DELETE FROM rss_feeds 
          WHERE url = ${feed.url} 
          AND id NOT IN (
            SELECT id FROM rss_feeds WHERE url = ${feed.url} LIMIT 1
          )
        `;
      }
    } else {
      console.log('✅ No duplicate RSS feeds found');
    }
    
    // 5. Show final counts
    console.log('\n📊 Final database state:');
    const finalCounts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM candidates) as candidates,
        (SELECT COUNT(*) FROM endorsers) as endorsers,
        (SELECT COUNT(*) FROM endorsements) as endorsements,
        (SELECT COUNT(*) FROM rss_feeds) as rss_feeds
    `;
    
    const counts = finalCounts.rows[0];
    console.log(`   - Candidates: ${counts.candidates}`);
    console.log(`   - Endorsers: ${counts.endorsers}`);
    console.log(`   - Endorsements: ${counts.endorsements}`);
    console.log(`   - RSS Feeds: ${counts.rss_feeds}`);
    
    console.log('\n✅ Duplicate cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during duplicate cleanup:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  cleanDuplicates()
    .then(() => {
      console.log('🎉 Duplicate cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Duplicate cleanup failed:', error);
      process.exit(1);
    });
} 