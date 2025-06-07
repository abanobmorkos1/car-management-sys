const express = require('express');
const { S3Client, PutObjectCommand , GetObjectCommand   } = require('@aws-sdk/client-s3');
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
      return `cars/${meta.year}-${meta.make}-${meta.model}/${meta.salesPerson}/${meta.driver || 'unknown-driver'}`;
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

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

    res.status(200).json({ uploadUrl, key });
  } catch (err) {
    console.error('❌ Failed to generate signed upload URL:', err);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

router.get('/signed-url', verifyToken, async (req, res) => {
  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ error: 'Missing key' });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min
    res.json({ url: signedUrl });
  } catch (err) {
    console.error('❌ Failed to generate signed GET URL:', err);
    res.status(500).json({ error: 'Failed to generate signed GET URL' });
  }
});

router.post('/bonus/upload', verifyToken, async (req, res) => {
  const { type, key } = req.body;

  if (!type || !['review', 'customer'].includes(type) || !key) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const bonus = await BonusUpload.create({
      user: req.user.id,
      type,
      key
    });

    res.status(201).json(bonus);
  } catch (err) {
    console.error('❌ Error saving bonus upload:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/bonus/my-uploads', verifyToken, async (req, res) => {
  try {
    const uploads = await BonusUpload.find({ user: req.user.id });
    res.json(uploads);
  } catch (err) {
    console.error('❌ Error fetching uploads:', err);
    res.status(500).json({ error: 'Failed to fetch bonus uploads' });
  }
});


module.exports = router;
