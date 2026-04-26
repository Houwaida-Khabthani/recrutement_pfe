require('dotenv').config();
const http = require('http');

const BASE_URL = 'http://localhost:5000';

async function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n[${method} ${path}]`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response:`, data.substring(0, 500));
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testFlow() {
  try {
    console.log('🔐 Step 1: Login as recruiter1');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'recruiter1@test.com',
      password: 'test123456'
    });

    if (loginRes.status !== 200) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = JSON.parse(loginRes.data);
    const token = loginData.token;
    console.log('✅ Login successful');

    console.log('\n👤 Step 2: Get recruiter profile');
    const profileRes = await makeRequest('GET', '/api/recruiters/profile', null, token);
    
    if (profileRes.status !== 200) {
      console.log('❌ Profile request failed with status:', profileRes.status);
      try {
        const errorData = JSON.parse(profileRes.data);
        console.log('Error response:', errorData);
      } catch {
        console.log('Raw response:', profileRes.data.substring(0, 200));
      }
    } else {
      const profileData = JSON.parse(profileRes.data);
      console.log('✅ Profile retrieved successfully');
      console.log('Profile data:', profileData);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

testFlow();
