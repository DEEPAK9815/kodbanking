const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { initDB, pool } = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static('public'));

// Initialize Database
initDB();

// Registration Endpoint
app.post('/register', async (req, res) => {
    const { uid, uname, password, email, phone } = req.body;

    // Basic validation
    if (!uname || !password || !email || !phone) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO koduser (uid, uname, password, email, phone, role, balance) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uid || null, uname, hashedPassword, email, phone, 'customer', 100000]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { uname, password } = req.body;

    if (!uname || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM koduser WHERE uname = ?', [uname]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { sub: user.uname, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Store token in DB
        await pool.query('INSERT INTO UserToken (username, token) VALUES (?, ?)', [user.uname, token]);

        // Set cookie
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Check Balance Endpoint
app.get('/check-balance', async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const username = decoded.sub;

        // Verify token in DB
        const [tokenRows] = await pool.query('SELECT * FROM UserToken WHERE username = ? AND token = ?', [username, token]);

        if (tokenRows.length === 0) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        // Fetch balance
        const [userRows] = await pool.query('SELECT balance FROM koduser WHERE uname = ?', [username]);

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ balance: userRows[0].balance });

    } catch (error) {
        console.error('Balance check error:', error);
        res.status(401).json({ error: 'Unauthorized: Token verification failed' });
    }
});

// Handle 404 (must be last)
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
