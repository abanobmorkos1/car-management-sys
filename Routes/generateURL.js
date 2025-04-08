const express = require('express');
const router = express.Router();
const generateUploadURL = require('../Utils/aws');

router.get('/get-upload-url', async (req, res) => {
  try {
    const { fileName, fileType } = req.query;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'Missing fileName or fileType' });
    }

    const url = await generateUploadURL(fileName, fileType);
    res.status(200).json({ url });
  } catch (err) {
    console.error('Error generating pre-signed URL:', err);
    res.status(500).json({ error: 'Failed to generate URL' });
  }
});

module.exports = router;
