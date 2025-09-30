const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const { db } = require('../firebase');
const { supabase } = require('../Utils/supabase');
const { sendEmail } = require('../Utils/email');
const { createPurchase } = require('../models/purchaseSchema');

// 📌 Verify Razorpay signature
function verifyRazorpaySignature(orderId, paymentId, signature) {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    return expectedSignature === signature;
}

// 📌 Generate signed Supabase download link
async function generateTempLink(fileUrl) {
    // Extract path from URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1]; // "myfile.zip"
    const filePath = `projects/${fileName}`;

    const { data, error } = await supabase
        .storage
        .from('projects')
        .createSignedUrl(filePath, 60 * 60);

    if (error) throw error;
    return data.signedUrl;
}


// 📌 Purchase route
router.post('/', async (req, res) => {
    const { name, email, projectId, orderId, paymentId, signature } = req.body;

    if (!name || !email || !projectId || !orderId || !paymentId || !signature) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // ✅ Verify Razorpay payment
        const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
        if (!isValid) {
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        // ✅ Get project metadata from Firestore
        const projectRef = db.collection('projects').doc(projectId);
        const project = await projectRef.get();
        if (!project.exists) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const projectData = project.data();
        const fileUrl = projectData.fileUrl; // stored in Firestore when you uploaded
        if (!fileUrl) {
            return res.status(400).json({ error: 'Project file URL missing' });
        }

        // ✅ Generate signed download link
        const downloadLink = await generateTempLink(fileUrl);

        // ✅ Save purchase record in Firestore
        const purchaseDoc = createPurchase({
            name,
            email,
            projectId,
            projectName: projectData.name,
            downloadLink,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
        });

        await db.collection('purchases').add(purchaseDoc);
        res.json({
    message: 'Payment successful. Download link generated.',
    link: downloadLink
});

        // ✅ Send email with download link
        // await sendEmail(email, downloadLink);

        // res.json({
        //     message: 'Payment successful. Download link sent to your email.',
        //     link: downloadLink // optional: return it directly too
        // });

    } catch (err) {
        console.error("Purchase error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
