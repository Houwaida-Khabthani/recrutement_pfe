const http = require('http');

// Start the server
const app = require('./src/app');
const config = require('./src/config/env');
const PORT = config.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n✓ Server running on port ${PORT}\n`);
  
  // Simulate login request
  setTimeout(async () => {
    console.log('=== Testing Login Endpoint ===\n');
    
    const testData = {
      email: 'aeros@gmail.com',  // Admin user
      password: 'password123'     // Try with test password first
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      const text = await response.text();
      
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, text);
      
      if (response.status !== 200) {
        try {
          const json = JSON.parse(text);
          console.log(`\n❌ Error: ${json.error || json.message}`);
        } catch (e) {
          console.log(`\n❌ Response is not JSON`);
        }
      }
      
    } catch (error) {
      console.error('Fetch error:', error.message);
    }
    
    server.close();
    process.exit(0);
  }, 1000);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
