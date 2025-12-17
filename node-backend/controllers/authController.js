const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require("axios"); 


/* --- 1. SIGNUP --- */
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) return res.status(400).json({ error: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User created", user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/* --- 2. LOGIN --- */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "User not found" });

    const user = result.rows[0];

    // Check Password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: "Invalid password" });

    // Create Token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ 
      message: "Login successful", 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/* --- 3. SEND OTP --- */
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    await axios.post(
      `${process.env.OTP_SERVICE_URL}/send-otp`,
      { email }
    );

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP Service Error:", error.message);
    res.status(500).json({ error: "OTP service unavailable" });
  }
};



/* --- 4. VERIFY OTP --- */
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await db.query('SELECT * FROM otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1', [email]);
    
    if (result.rows.length === 0) return res.status(400).json({ error: "No OTP found" });

    const record = result.rows[0];

    // Check expiry
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // Check match
    if (record.otp_code !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Clear OTP after success
    await db.query('DELETE FROM otps WHERE email = $1', [email]);

    res.status(200).json({ message: "OTP Verified" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* --- 5. RESET PASSWORD --- */
exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
    
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* --- 6. GET ME (Protected Route Example) --- */
exports.getMe = async (req, res) => {
  try {
    const user = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};