const http = require('http');

console.log('🧪 Testing Login Endpoint...\n');

const testData = {
    email: 'recruiter@test.com',
    password: 'test123456'
};

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(testData))
    }
};

console.log('📤 Sending request to: http://localhost:5000/api/auth/login\n');
console.log('📝 Payload:', JSON.stringify(testData, null, 2));
console.log('\n⏳ Waiting for response...\n');

const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('\n✅ Response received:\n');
        
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));
            
            if (parsed.token) {
                console.log('\n🎉 SUCCESS! Token received:');
                console.log(parsed.token.substring(0, 50) + '...');
            } else if (parsed.message) {
                console.log('\n⚠️  Error message:', parsed.message);
            }
        } catch (e) {
            console.log('Raw response:', data);
        }

        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('\n❌ Connection Error:');
    console.error(`   Type: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    console.error('\n💡 This usually means the backend server is NOT running.');
    console.error('   Start it with: node start-dev.js');
    process.exit(1);
});

req.on('timeout', () => {
    console.error('\n⏱️  Request timed out - server not responding');
    process.exit(1);
});

req.setTimeout(5000);

// Send the request
req.write(JSON.stringify(testData));
req.end();

console.log('Process: test-login-flow.js started at', new Date().toLocaleTimeString());
