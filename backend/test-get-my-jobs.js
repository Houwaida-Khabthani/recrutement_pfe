const http = require('http');

console.log('🧪 Testing getMyJobs After Update...\n');

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
                console.log('✅ Login successful!\n');
                
                // Now get my jobs
                getMyJobs(loginResult.token);
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

function getMyJobs(token) {
    console.log('📝 Step 2: Getting my jobs...\n');

    const getMyJobsOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/jobs/my-jobs',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const getReq = http.request(getMyJobsOptions, (getRes) => {
        console.log(`📊 Status Code: ${getRes.statusCode}\n`);

        let data = '';

        getRes.on('data', (chunk) => {
            data += chunk;
        });

        getRes.on('end', () => {
            try {
                const jobs = JSON.parse(data);
                console.log(`Found ${Array.isArray(jobs) ? jobs.length : 0} jobs:\n`);
                
                if (Array.isArray(jobs) && jobs.length > 0) {
                    jobs.forEach((job, idx) => {
                        console.log(`${idx + 1}. ${job.titre} (ID: ${job.id_offre})`);
                        console.log(`   Status: ${job.statut}`);
                        console.log(`   Company: ${job.id_entreprise}`);
                    });
                } else if (Array.isArray(jobs)) {
                    console.log('⚠️  Empty array returned!');
                } else {
                    console.log('⚠️  Not an array:');
                    console.log(JSON.stringify(jobs, null, 2));
                }
            } catch (e) {
                console.log('Raw response:', data);
            }

            process.exit(0);
        });
    });

    getReq.on('error', (error) => {
        console.error('❌ Request Error:', error.message);
        process.exit(1);
    });

    getReq.end();
}
