// Utils/email.js
const nodemailer = require('nodemailer');

async function sendEmail(to, link) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,   // your gmail
            pass: process.env.EMAIL_PASS    // Gmail App Password
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your project download link',
        html: `
            <p>Thank you for your purchase 🎉</p>
            <p>Click the link below to download your project (valid for 1 hour):</p>
            <p><a href="${link}" style="color:#4a6cf7; text-decoration:none;">Download Project</a></p>
        `
    });
}

async function sendOtpEmail(to, otp) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Verify your email - OTP',
        html: `
            <p>Your OTP is: <b>${otp}</b></p>
            <p>This code will expire in 5 minutes.</p>
        `
    });
}

module.exports = { sendEmail, sendOtpEmail };
