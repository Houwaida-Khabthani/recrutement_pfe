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
    // Login
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'recruiter1@test.com',
      password: 'test123456'
    });

    const token = loginRes.data.token;

    // Test 1: With numeric salaire (should fail?)
    console.log('\n Test 1: salaire as number');
    let res = await makeRequest('PUT', '/api/jobs/6', {
      titre: 'Test Job',
      type_contrat: 'CDI',
      localisation: 'Tunis',
      description: 'A very detailed description about a test job',
      salaire: 5000,
      experience: 'JUNIOR',
      date_expiration: '2025-12-31'
    }, token);
    console.log('Status:', res.status, 'Error:', res.data.error || 'OK');

    // Test 2: With string salaire (might fail)
    console.log('\n Test 2: salaire as string');
    res = await makeRequest('PUT', '/api/jobs/6', {
      titre: 'Test Job',
      type_contrat: 'CDI',
      localisation: 'Tunis',
      description: 'A very detailed description about a test job',
      salaire: '5000',
      experience: 'JUNIOR',
      date_expiration: '2025-12-31'
    }, token);
    console.log('Status:', res.status, 'Error:', res.data.error || 'OK');

    // Test 3: Missing title
    console.log('\n Test 3: missing title');
    res = await makeRequest('PUT', '/api/jobs/6', {
      type_contrat: 'CDI',
      localisation: 'Tunis',
      description: 'A very detailed description about a test job'
    }, token);
    console.log('Status:', res.status, 'Error:', res.data.error || 'OK');

    // Test 4: Short description
    console.log('\n Test 4: description <20 chars');
    res = await makeRequest('PUT', '/api/jobs/6', {
      titre: 'Test Job',
      type_contrat: 'CDI',
      localisation: 'Tunis',
      description: 'Short desc'
    }, token);
    console.log('Status:', res.status, 'Error:', res.data.error || 'OK');

    // Test 5: Invalid date format
    console.log('\n Test 5: invalid date format');
    res = await makeRequest('PUT', '/api/jobs/6', {
      titre: 'Test Job',
      type_contrat: 'CDI',
      localisation: 'Tunis',
      description: 'A very detailed description',
      date_expiration: '31-12-2025'
    }, token);
    console.log('Status:', res.status, 'Error:', res.data.error || 'OK');

    // Test 6: negative salaire
    console.log('\n Test 6: negative salaire');
    res = await makeRequest('PUT', '/api/jobs/6', {
      titre: 'Test Job',
      type_contrat: 'CDI',
      localisation: 'Tunis',
      description: 'A very detailed description',
      salaire: -1000
    }, token);
    console.log('Status:', res.status, 'Error:', res.data.error || 'OK');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

testFlow();
