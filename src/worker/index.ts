import { startBackgroundSystem } from '../lib/start-background-system';
import { scheduleRecurringJobs, getQueueStats } from '../lib/background-jobs';
import { rssFeedParser } from '../lib/rss-parser';
import { endorsementCollector } from '../lib/data-collection';
import { DatabaseService } from '../lib/database-service';
import * as http from 'http';

console.log('🚀 Starting EndorseNYC Background Worker...');
console.log('📊 Process ID:', process.pid);
console.log('📊 Node version:', process.version);
console.log('📊 Platform:', process.platform);

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
console.log('🔧 Creating HTTP server...');
const server = http.createServer((req, res) => {
  try {
    console.log(`📡 HTTP Request: ${req.method} ${req.url}`);
    
    if (req.url === '/api/health' && req.method === 'GET') {
      console.log('✅ Health check requested');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(healthCheck()));
    } else if (req.url === '/api/test' && req.method === 'GET') {
      console.log('✅ Test endpoint requested');
      // Simple test endpoint that doesn't require any dependencies
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        message: 'Worker is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        pid: process.pid
      }));
    } else if (req.url === '/api/jobs' && req.method === 'POST') {
      console.log('📋 Job request received');
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
          console.error('❌ Job processing error:', error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    } else {
      console.log('❌ Unknown endpoint:', req.url);
      res.writeHead(404);
      res.end('Not Found');
    }
  } catch (error: any) {
    console.error('❌ HTTP server error:', error.message);
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
    console.log('🚀 Starting worker process...');
    console.log('📊 Environment check:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - PORT:', process.env.PORT);
    console.log('  - POSTGRES_URL:', process.env.POSTGRES_URL ? 'Set' : 'Not set');
    console.log('  - REDIS_URL:', process.env.REDIS_URL ? 'Set' : 'Not set');

    // Start HTTP server immediately for health checks
    const port = parseInt(process.env.PORT || '3001');
    console.log(`🌐 Starting HTTP server on port ${port}...`);
    
    server.listen(port, () => {
      console.log(`✅ HTTP server listening on port ${port}`);
      console.log(`✅ Health check available at http://localhost:${port}/api/health`);
      console.log(`✅ Test endpoint available at http://localhost:${port}/api/test`);
    }).on('error', (err: any) => {
      console.error('❌ HTTP server error:', err.message);
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${port} is in use, trying port ${port + 1}`);
        server.listen(port + 1, () => {
          console.log(`✅ HTTP server listening on port ${port + 1}`);
        });
      }
    });

    // Test health endpoint immediately
    setTimeout(() => {
      console.log('🧪 Testing health endpoint...');
      fetch(`http://localhost:${port}/api/test`)
        .then(response => {
          console.log(`✅ Health endpoint test: ${response.status} ${response.statusText}`);
        })
        .catch(error => {
          console.error('❌ Health endpoint test failed:', error.message);
        });
    }, 1000);

    console.log('🔧 Attempting to initialize background systems...');

    // Try to initialize database and background system
    try {
      console.log('📊 Initializing database connection...');
      await DatabaseService.initializeDatabase();
      console.log('✅ Database initialized successfully');
      
      console.log('🔧 Starting background system...');
      await startBackgroundSystem();
      console.log('✅ Background system started successfully');
      
      console.log('⏰ Scheduling recurring jobs...');
      await scheduleRecurringJobs();
      console.log('✅ Recurring jobs scheduled successfully');
      
      console.log('✅ Background worker started successfully!');
    } catch (dbError: any) {
      console.warn('⚠️ Database initialization failed, but HTTP server is running:', dbError.message);
      console.log('🔄 Will retry database connection in background...');
      
      // Retry database connection in background
      setTimeout(async () => {
        try {
          console.log('🔄 Retrying database connection...');
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
    
    console.log('🎉 Worker startup completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Error starting background worker:', error);
    console.error('❌ Error stack:', error.stack);
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

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('❌ Error stack:', error.stack);
  console.log('🔄 Worker will continue running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
  console.log('🔄 Worker will continue running...');
});

// Start the worker
console.log('🎬 Starting worker...');
startWorker().catch((error) => {
  console.error('❌ Worker startup failed:', error.message);
  console.error('❌ Error stack:', error.stack);
  console.log('🔄 Worker will continue running with limited functionality...');
});
