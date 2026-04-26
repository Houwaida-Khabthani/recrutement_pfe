require('dotenv').config();
const http = require('http');

async function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:5000');
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
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testFlow() {
  try {
    // Step 1: Login
    console.log('🔐 Login...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'recruiter1@test.com',
      password: 'test123456'
    });

    if (loginRes.status !== 200) {
      console.log('❌ Login failed:', loginRes.data);
      return;
    }

    const token = loginRes.data.token;
    console.log('✅ Login successful');

    // Step 2: Try to update job 6
    console.log('\n📝 Updating job 6...');
    const updateData = {
      titre: 'Senior Full-Stack Developer - Updated',
      type_contrat: 'CDI',
      localisation: 'Remote',
      description: 'A very detailed description about the senior developer role with full stack technologies',
      salaire: 4500,
      experience: 'SENIOR',
      date_expiration: '2025-12-31',
      statut: 'OUVERT'
    };

    console.log('📤 Sending:', JSON.stringify(updateData, null, 2));

    const updateRes = await makeRequest('PUT', '/api/jobs/6', updateData, token);
    console.log('\n📥 Response status:', updateRes.status);
    console.log('📥 Response data:', JSON.stringify(updateRes.data, null, 2));

    if (updateRes.status === 200) {
      console.log('✅ Job updated successfully!');
    } else if (updateRes.status === 400) {
      console.log('❌ Validation error (400)');
      if (updateRes.data.error) {
        console.log('Error:', updateRes.data.error);
      }
    } else {
      console.log('❌ Failed with status:', updateRes.status);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

testFlow();
