const express = require('express');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { S3Client } = require('@aws-sdk/client-s3');
const { verifyToken } = require('../Middleware/auth'); // ✅ Correct usage
require('dotenv').config();


const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const router = express.Router();

router.get('/s3-url/:key(*)', verifyToken, async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({ signedUrl });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ error: 'Unable to generate signed view URL' });
  }
});

module.exports = router;
