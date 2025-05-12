const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { verifyToken } = require('../Middleware/auth');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

router.get('/get-upload-url', verifyToken, async (req, res) => {
  const { fileName, fileType, folder } = req.query;

  if (!fileName || !fileType || !folder) {
    return res.status(400).json({ error: 'Missing fileName, fileType or folder' });
  }

  const key = `${folder}/${Date.now()}-${fileName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ACL: 'private'
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    res.status(200).json({ url, key });
  } catch (err) {
    console.error('❌ Failed to generate signed upload URL:', err);
    res.status(500).json({ error: 'Failed to generate URL' });
  }
});

router.get('/get-download-url', verifyToken, async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: 'Missing file key' });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes

    res.status(200).json({ url });
  } catch (err) {
    console.error('❌ Failed to generate signed download URL:', err);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

module.exports = router;
