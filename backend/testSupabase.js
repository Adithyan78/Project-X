// generateSignature.js
const crypto = require('crypto');
require('dotenv').config(); // if you're using .env for RAZORPAY_SECRET

const orderId = "order_test1234";
const paymentId = "pay_test1234";

const signature = crypto
  .createHmac("sha256", process.env.RAZORPAY_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest("hex");

console.log("Generated signature:", signature);
