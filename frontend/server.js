const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 5173;
const HOST = '0.0.0.0';

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: 'http://10.10.11.243:3001',
  changeOrigin: true,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`
🎉 RME LMS Frontend Server is running!

📍 Local:   http://localhost:${PORT}
🌐 Network: http://10.10.11.243:${PORT}

Backend API: http://10.10.11.243:3001
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
}); 