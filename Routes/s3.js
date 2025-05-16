const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { verifyToken } = require('../Middleware/auth');

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// 📁 Helper to determine folder path dynamically
const getFolderPath = (category, meta, user) => {
  switch (category) {
    case 'new-car':
      return `cars/${meta.year}-${meta.make}-${meta.salesPerson}`;
    case 'lease-return':
      return `lease-returns/${meta.customerName}`;
    case 'cod':
      return `cod/${meta.customerName}`;
    case 'bonus':
      return `bonus/${user.id}`;
    default:
      return `misc/${user.id}`;
  }
};

router.post('/generate-url', verifyToken, async (req, res) => {
  const { fileName, fileType, uploadCategory, meta = {} } = req.body;
  const user = req.user;

  if (!fileName || !fileType || !uploadCategory) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const folder = getFolderPath(uploadCategory, meta, user);
    const key = `${folder}/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ACL: 'private'
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    res.status(200).json({ uploadUrl, key });
  } catch (err) {
    console.error('❌ Failed to generate signed upload URL:', err);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

module.exports = router;
