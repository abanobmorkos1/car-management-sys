const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/webp', 'image/jpg',
  'video/mp4', 'video/quicktime'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and mp4 videos are allowed.'));
  }
};

const upload = multer({
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit make larger if needed
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const folder = req.uploadType || 'uploads';
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.originalname.replace(/\s+/g, '_')}`;
      cb(null, `${folder}/${filename}`);
    }
  })
});

module.exports = upload;
