const http = require('http');

async function getAdminToken() {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({
      email: 'admin@company.com',
      password: 'Admin@123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
}

async function testAdminJobs(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/jobs?page=1&limit=5',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    console.log('🔐 Logging in as admin...\n');
    const loginResponse = await getAdminToken();
    
    if (loginResponse.error) {
      console.log('❌ Login failed:', loginResponse.error);
      process.exit(1);
    }

    const token = loginResponse.token;
    console.log('✅ Login successful!');
    console.log('   Token:', token.substring(0, 50) + '...');
    console.log('\n📋 Testing /api/admin/jobs endpoint...\n');

    const jobsResponse = await testAdminJobs(token);
    console.log('Status:', jobsResponse.status);
    console.log('Response:');
    console.log(jobsResponse.data);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
