import { startBackgroundSystem } from '../lib/start-background-system';
import { scheduleRecurringJobs, getQueueStats } from '../lib/background-jobs';
import { rssFeedParser } from '../lib/rss-parser';
import { endorsementCollector } from '../lib/data-collection';
import { DatabaseService } from '../lib/database-service';
import * as http from 'http';

console.log('🚀 Starting EndorseNYC Background Worker...');

// Health check endpoint for Railway
const healthCheck = () => {
  try {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      rss: rssFeedParser.getStats(),
      collector: endorsementCollector.getStats(),
      database: 'initializing' // Will be updated when DB connects
    };
  } catch (error: any) {
    return {
      status: 'starting',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: error.message
    };
  }
};

// Create simple HTTP server for health checks
const server = http.createServer((req, res) => {
  try {
    if (req.url === '/api/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(healthCheck()));
    } else if (req.url === '/api/jobs' && req.method === 'POST') {
      // Handle job requests
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const { type, data } = JSON.parse(body);
          console.log(`📋 Received job request: ${type}`);
          
          // Handle different job types
          switch (type) {
            case 'rss-check':
              // Trigger RSS feed check
              await rssFeedParser.checkAllFeeds();
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: 'RSS check triggered' }));
              break;
              
            case 'background-system-start':
              // Start background system
              await startBackgroundSystem();
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: 'Background system started' }));
              break;
              
            default:
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Unknown job type' }));
          }
        } catch (error: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  } catch (error: any) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }));
  }
});

// Start the background system
async function startWorker() {
  try {
    // Start HTTP server immediately for health checks
    const port = parseInt(process.env.PORT || '3001');
    server.listen(port, () => {
      console.log(`🌐 Health check server listening on port ${port}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${port} is in use, trying port ${port + 1}`);
        server.listen(port + 1, () => {
          console.log(`🌐 Health check server listening on port ${port + 1}`);
        });
      } else {
        console.error('❌ Server error:', err);
      }
    });

    // Try to initialize database and background system
    try {
      console.log('📊 Initializing database connection...');
      await DatabaseService.initializeDatabase();
      
      console.log('🔧 Starting background system...');
      await startBackgroundSystem();
      
      console.log('⏰ Scheduling recurring jobs...');
      await scheduleRecurringJobs();
      
      console.log('✅ Background worker started successfully!');
    } catch (dbError: any) {
      console.warn('⚠️ Database initialization failed, but HTTP server is running:', dbError.message);
      console.log('🔄 Will retry database connection in background...');
      
      // Retry database connection in background
      setTimeout(async () => {
        try {
          await DatabaseService.initializeDatabase();
          await startBackgroundSystem();
          await scheduleRecurringJobs();
          console.log('✅ Background system started after retry!');
        } catch (retryError: any) {
          console.error('❌ Background system retry failed:', retryError.message);
        }
      }, 10000); // Retry after 10 seconds
    }
    
    // Log stats every 5 minutes (with error handling)
    setInterval(async () => {
      try {
        const stats = await getQueueStats();
        console.log('📈 Queue Stats:', stats);
      } catch (error: any) {
        console.log('📈 Queue Stats: Not available yet -', error.message);
      }
    }, 5 * 60 * 1000);
    
    // Health check every minute
    setInterval(() => {
      try {
        const health = healthCheck();
        console.log('💚 Health Check:', health.status);
      } catch (error: any) {
        console.log('💚 Health Check: Error -', error.message);
      }
    }, 60 * 1000);
    
  } catch (error: any) {
    console.error('❌ Error starting background worker:', error);
    // Don't exit the process, just log the error
    console.log('🔄 Worker will continue running with limited functionality...');
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
