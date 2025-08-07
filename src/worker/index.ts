import * as http from 'http';

console.log('🚀 Starting Minimal EndorseNYC Background Worker...');
console.log('📊 Process ID:', process.pid);
console.log('📊 Node version:', process.version);
console.log('📊 Platform:', process.platform);

// Create simple HTTP server for health checks
console.log('🔧 Creating HTTP server...');
const server = http.createServer((req, res) => {
  try {
    console.log(`📡 HTTP Request: ${req.method} ${req.url}`);
    
    if (req.url === '/api/health' && req.method === 'GET') {
      console.log('✅ Health check requested');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        pid: process.pid
      }));
    } else if (req.url === '/api/test' && req.method === 'GET') {
      console.log('✅ Test endpoint requested');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        message: 'Worker is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        pid: process.pid
      }));
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

// Start the minimal worker
async function startWorker() {
  try {
    console.log('🚀 Starting minimal worker process...');
    console.log('📊 Environment check:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - PORT:', process.env.PORT);

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

    console.log('🎉 Minimal worker startup completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Error starting minimal worker:', error);
    console.error('❌ Error stack:', error.stack);
  }
}

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('❌ Error stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close();
  process.exit(0);
});

// Start the worker
console.log('🎬 Starting minimal worker...');
startWorker().catch((error) => {
  console.error('❌ Minimal worker startup failed:', error.message);
  console.error('❌ Error stack:', error.stack);
});
