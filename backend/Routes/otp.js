// routes/otp.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { sendOtpEmail } = require('../Utils/email');



let otpStore = {}; // temporary in-memory store (replace with Redis/DB in prod)

// 📌 Send OTP
router.post('/send', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins validity

    otpStore[email] = { otp, expiresAt };

    // Send OTP via email
    
     await sendOtpEmail(email, otp);


    res.json({ message: "OTP sent successfully" });
});

// 📌 Verify OTP
router.post('/verify', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Missing fields" });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: "No OTP found" });

    if (record.expiresAt < Date.now()) {
        delete otpStore[email];
        return res.status(400).json({ error: "OTP expired" });
    }

    if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    delete otpStore[email]; // ✅ clear OTP once used
    res.json({ success: true, message: "OTP verified successfully" });
});

module.exports = router;
