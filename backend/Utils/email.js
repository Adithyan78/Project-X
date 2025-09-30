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
            <p>Download your project here (valid for 1 hour):</p>
            <a href="${link}">${link}</a>
        `
    });
}

module.exports = { sendEmail };
