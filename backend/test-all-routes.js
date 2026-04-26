require('dotenv').config();
const http = require('http');

const BASE_URL = 'http://localhost:5000';

async function testAllRoutes() {
  const routes = [
    '/api/recruiters',
    '/api/recruiters/',
    '/api/recruiters/profile',
    '/api/jobs',
    '/api/auth/login'
  ];

  for (const route of routes) {
    try {
      const response = await new Promise((resolve) => {
        const url = new URL(route, BASE_URL);
        const options = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const req = http.request(url, options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({ status: res.statusCode, route, path: url.pathname });
          });
        });

        req.on('error', () => resolve({ status: 'ERROR', route, path: url.pathname }));
        req.end();
      });

      console.log(`${response.route}: ${response.status}`);
    } catch (error) {
      console.log(`${route}: ERROR`);
    }
  }

  process.exit(0);
}

testAllRoutes();
