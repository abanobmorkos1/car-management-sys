const BonusUpload = require('../Schema/BonusUpload'); // ✅ The correct schema
const getFriday = require('../Utils/weekUtils');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// 💰 Get Bonus Totals
exports.getBonuses = async (req, res) => {
  const start = getFriday(new Date());
  const uploads = await BonusUpload.find({
    driverId: req.user.id,
    createdAt: { $gte: start }
  });

  const reviewCount = uploads.filter(u => u.type === 'review').length;
  const customerCount = uploads.filter(u => u.type === 'customer').length;
  const total = reviewCount * 25 + customerCount * 5;

  res.json({ reviewCount, customerCount, total });
};

// 📝 Save uploaded S3 key to DB
exports.saveUpload = async (req, res) => {
  const { key, type } = req.body;

  if (!key || !type) {
    return res.status(400).json({ error: 'Missing key or type' });
  }

  try {
    const upload = new BonusUpload({
      driverId: req.user.id,
      key,
      type,
      createdAt: new Date()
    });

    await upload.save();
    res.status(201).json({ message: 'Upload saved successfully' });
  } catch (err) {
    console.error('❌ Error saving upload:', err);
    res.status(500).json({ error: 'Failed to save upload' });
  }
};

// 📂 Get all uploads
exports.getMyUploads = async (req, res) => {
  try {
    const uploads = await BonusUpload.find({ driverId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(uploads);
  } catch (err) {
    console.error('Failed to get uploads:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 🗑️ Delete from S3 and DB (Safe)
exports.deleteUpload = async (req, res) => {
  try {
    const upload = await BonusUpload.findOne({ _id: req.params.id, driverId: req.user.id });
    if (!upload) return res.status(404).json({ message: 'Upload not found' });

    let s3Key = upload.key;

    // 👇 fallback if key is missing but imageUrl is present
    if (!s3Key && upload.imageUrl?.includes('.amazonaws.com/')) {
      s3Key = upload.imageUrl.split('.amazonaws.com/')[1];
    }

    if (!s3Key) {
      console.error('❌ Could not determine S3 key:', upload);
      return res.status(400).json({ error: 'Missing S3 key for deletion' });
    }

    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    }));

    await upload.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
