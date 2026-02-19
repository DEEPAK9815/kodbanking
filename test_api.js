// using native fetch
// If standard fetch is available (Node 18+), we don't need require.
// But to be safe, I'll use standard fetch if available, else I might fail if node-fetch isn't installed.
// Since I installed packages earlier, I didn't install node-fetch.
// I will rely on Node's built-in fetch (Node 18+) or axios if I installed it (I didn't).
// I will write a script that uses http module to be dependency-free for the test script or assume Node 18+.

const http = require('http');

function postRequest(path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body || '{}') }));
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

function getRequest(path, token, cookie) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: {
                'Cookie': cookie || '',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function runTests() {
    const testUser = {
        uname: 'testuser_' + Date.now(),
        password: 'password123',
        email: 'test@example.com',
        phone: '1234567890'
    };

    console.log('--- Starting API Tests ---');

    // 1. Register
    try {
        console.log(`Registering user: ${testUser.uname}`);
        const regRes = await postRequest('/register', JSON.stringify(testUser));
        if (regRes.status === 201) {
            console.log('✅ Registration Successful');
        } else {
            console.error('❌ Registration Failed:', regRes.body);
            return;
        }
    } catch (e) { console.error('Error:', e); return; }

    // 2. Login
    let token = '';
    let cookie = '';
    try {
        console.log('Logging in...');
        const loginRes = await postRequest('/login', JSON.stringify({ uname: testUser.uname, password: testUser.password }));
        if (loginRes.status === 200) {
            console.log('✅ Login Successful');
            token = loginRes.body.token;
            // Extract cookie
            const setCookie = loginRes.headers['set-cookie'];
            if (setCookie) {
                cookie = setCookie[0].split(';')[0];
                console.log('✅ Cookie received:', cookie);
            } else {
                console.error('❌ No cookie received');
            }
        } else {
            console.error('❌ Login Failed:', loginRes.body);
            return;
        }
    } catch (e) { console.error('Error:', e); return; }

    // 3. Check Balance
    try {
        console.log('Checking Balance...');
        const balanceRes = await getRequest('/check-balance', token, cookie);
        if (balanceRes.status === 200) {
            console.log(`✅ Balance Check Successful: ${balanceRes.body.balance}`);
            if (balanceRes.body.balance == 100000) {
                console.log('✅ Balance is correct (100,000)');
            } else {
                console.warn('⚠️ Unexpected balance amount');
            }
        } else {
            console.error('❌ Balance Check Failed:', balanceRes.body);
        }
    } catch (e) { console.error('Error:', e); }

    console.log('--- Tests Completed ---');
}

// Wait for server to start roughly
setTimeout(runTests, 2000);
