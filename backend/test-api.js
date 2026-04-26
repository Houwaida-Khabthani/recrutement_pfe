// Test script to diagnose the 400 error
const http = require('http');

// First, get the token from browser storage or use a test token
// For now, let's test the API directly

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/jobs/my-jobs',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + (process.argv[2] || 'test-token'),
    'Content-Type': 'application/json'
  }
};

console.log('\n📡 Testing API endpoint: GET /api/jobs/my-jobs\n');
console.log('Headers:', options.headers);
console.log('\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response Headers:`, res.headers);
    console.log(`Response Body:`, data);
    
    if (res.statusCode >= 400) {
      console.log('\n❌ ERROR DETECTED');
      try {
        const json = JSON.parse(data);
        console.log('Error Details:', json);
      } catch (e) {
        console.log('Raw Response:', data);
      }
    } else {
      console.log('\n✅ Success!');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
