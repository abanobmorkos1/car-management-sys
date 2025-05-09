const express = require('express');
const router = express.Router();
const getSignedUrlForView = require('../Utils/getSignedUrlForView');
const { verifyToken } = require('../Middleware/auth'); 

router.get('/get-image-url', verifyToken, async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: 'Missing key parameter' });
  }

  try {
    const signedUrl = await getSignedUrlForView(key);
    res.status(200).json({ url: signedUrl });
  } catch (error) {
    console.error('❌ Error generating signed view URL:', error);
    res.status(500).json({ error: 'Could not generate image URL' });
  }
});

module.exports = router;

