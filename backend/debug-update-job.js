const http = require('http');

console.log('🧪 Testing Job Update Endpoint...\n');

// First, get a valid token by logging in
const loginData = {
    email: 'recruiter@test.com',
    password: 'test123456'
};

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(loginData))
    }
};

console.log('📝 Step 1: Getting login token...\n');

const loginReq = http.request(loginOptions, (loginRes) => {
    let data = '';

    loginRes.on('data', (chunk) => {
        data += chunk;
    });

    loginRes.on('end', () => {
        try {
            const loginResult = JSON.parse(data);
            
            if (loginResult.token) {
                console.log('✅ Login successful!');
                console.log('Token:', loginResult.token.substring(0, 50) + '...\n');
                
                // Now update the job
                updateJob(loginResult.token);
            } else {
                console.error('❌ Login failed:', loginResult);
                process.exit(1);
            }
        } catch (e) {
            console.error('❌ Parse error:', e.message);
            process.exit(1);
        }
    });
});

loginReq.on('error', (error) => {
    console.error('❌ Login request error:', error.message);
    process.exit(1);
});

loginReq.write(JSON.stringify(loginData));
loginReq.end();

function updateJob(token) {
    console.log('📝 Step 2: Updating job ID 6...\n');

    const updateData = {
        titre: "Senior Full-Stack Developer UPDATED",
        type_contrat: "CDI",
        localisation: "Tunisia",
        description: "Exciting updated opportunity for Senior Full-Stack Developer position with new benefits",
        salaire: 5500,
        experience: "3+ years",
        date_expiration: "2026-05-12",
        statut: "OUVERT"
    };

    console.log('📤 Payload:', JSON.stringify(updateData, null, 2));
    console.log('\n🔐 Authorization: Bearer ' + token.substring(0, 30) + '...\n');

    const updateOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/jobs/6',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Length': Buffer.byteLength(JSON.stringify(updateData))
        }
    };

    const updateReq = http.request(updateOptions, (updateRes) => {
        console.log(`📊 Status Code: ${updateRes.statusCode}`);
        console.log(`📋 Headers:`, updateRes.headers);

        let data = '';

        updateRes.on('data', (chunk) => {
            data += chunk;
        });

        updateRes.on('end', () => {
            console.log('\n✅ Response received:\n');
            
            try {
                const parsed = JSON.parse(data);
                console.log(JSON.stringify(parsed, null, 2));
                
                if (updateRes.statusCode === 200) {
                    console.log('\n🎉 UPDATE SUCCESSFUL!');
                } else if (updateRes.statusCode >= 400) {
                    console.log('\n❌ UPDATE FAILED!');
                    if (parsed.error) {
                        console.log('Error:', parsed.error);
                    }
                    if (parsed.message) {
                        console.log('Message:', parsed.message);
                    }
                }
            } catch (e) {
                console.log('Raw response:', data);
            }

            process.exit(0);
        });
    });

    updateReq.on('error', (error) => {
        console.error('\n❌ Request Error:');
        console.error(`   Type: ${error.code}`);
        console.error(`   Message: ${error.message}`);
        process.exit(1);
    });

    updateReq.write(JSON.stringify(updateData));
    updateReq.end();
}
