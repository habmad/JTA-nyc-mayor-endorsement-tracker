import { config } from 'dotenv';
import { safePopulateDatabase } from './populate-endorsements';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Run the safe database population
async function main() {
  try {
    console.log('🎯 Running safe database population...');
    await safePopulateDatabase();
    console.log('🎉 Database population completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database population failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
} 