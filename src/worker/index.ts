import { startBackgroundSystem } from '../lib/start-background-system';
import { scheduleRecurringJobs, getQueueStats } from '../lib/background-jobs';
import { rssFeedParser } from '../lib/rss-parser';
import { endorsementCollector } from '../lib/data-collection';
import { DatabaseService } from '../lib/database-service';
import * as http from 'http';

console.log('🚀 Starting EndorseNYC Background Worker...');

// Health check endpoint for Railway
const healthCheck = () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    rss: rssFeedParser.getStats(),
    collector: endorsementCollector.getStats()
  };
};

// Create simple HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthCheck()));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Start the background system
async function startWorker() {
  try {
    console.log('📊 Initializing database connection...');
    await DatabaseService.initializeDatabase();
    
    console.log('🔧 Starting background system...');
    await startBackgroundSystem();
    
    console.log('⏰ Scheduling recurring jobs...');
    await scheduleRecurringJobs();
    
    console.log('✅ Background worker started successfully!');
    
    // Start HTTP server for health checks
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`🌐 Health check server listening on port ${port}`);
    });
    
    // Log stats every 5 minutes
    setInterval(async () => {
      const stats = await getQueueStats();
      console.log('📈 Queue Stats:', stats);
    }, 5 * 60 * 1000);
    
    // Health check every minute
    setInterval(() => {
      const health = healthCheck();
      console.log('💚 Health Check:', health.status);
    }, 60 * 1000);
    
  } catch (error) {
    console.error('❌ Error starting background worker:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close();
  await endorsementCollector.stopCollection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close();
  await endorsementCollector.stopCollection();
  process.exit(0);
});

// Start the worker
startWorker().catch(console.error);
