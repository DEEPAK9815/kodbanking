const { initDB, pool } = require('./db');
const bcrypt = require('bcrypt');

async function verifyLogin(username, password) {
    try {
        await initDB();
        console.log(`Checking user: ${username}`);

        const [rows] = await pool.query('SELECT * FROM koduser WHERE uname = ?', [username]);

        if (rows.length === 0) {
            console.log('❌ User NOT FOUND in database.');
            return;
        }

        const user = rows[0];
        console.log('✅ User FOUND.');
        console.log(`Stored Hash: ${user.password}`);

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            console.log('✅ Password MATCHES.');
        } else {
            console.log('❌ Password does NOT match.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

// Usage: node verify_login.js <username> <password>
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node verify_login.js <username> <password>');
    process.exit(1);
}

verifyLogin(args[0], args[1]);
