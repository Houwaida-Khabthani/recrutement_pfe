require('dotenv').config();
const http = require('http');

async function test() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/recruiters/profile',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoyNSwicm9sZSI6IkVOVESSUlTRSIsImVtYWlsIjoicmVjcnVpdGVyMUB0ZXN0LmNvbSIsImlhdCI6MTc3NTEyNTAwMDAwMCwiZXhwIjoxNzc1MjExNDAwMDAwfQ.xxx'
      }
    };

    const req = http.request(options, (res) => {
      console.log('Status:', res.statusCode);
      console.log('Headers:', JSON.stringify(res.headers, null, 2));
      
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Body:', body);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('Error:', e.message);
      resolve();
    });

    req.end();
  });
}

test().then(() => process.exit(0));
