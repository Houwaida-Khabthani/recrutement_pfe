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
        console.log(`Headers:`, res.headers);
        console.log(`Response:`, data);
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
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');

    console.log('\n📝 Step 2: Try to create a job');
    const jobData = {
      titre: 'Test Job',
      type_contrat: 'CDI',
      localisation: 'Tunis',
      description: 'This is a test job with enough description to pass validation',
      salaire: 3000,
      experience: '2',
      date_expiration: '2025-12-31'
    };

    const createdRes = await makeRequest('POST', '/api/jobs', jobData, token);
    
    if (createdRes.status !== 201) {
      console.log('❌ Job creation failed with status:', createdRes.status);
      console.log('Response data:', createdRes.data);
    } else {
      console.log('✅ Job created successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

testFlow();
