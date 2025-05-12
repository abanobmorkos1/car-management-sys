const express = require('express');
const router = express.Router();
const getSignedUrlForView = require('../Utils/getSignedUrlForView');
const { verifyToken } = require('../Middleware/auth');
const BonusUpload = require('../Schema/BonusUpload');
const LeaseReturns = require('../Schema/lease');

router.get('/get-image-url', verifyToken, async (req, res) => {
  const { key } = req.query;

  if (!key) return res.status(400).json({ error: 'Missing key parameter' });

  try {
    const bonusFound = await BonusUpload.findOne({ key, driverId: req.user.id });

    const leaseFound = await LeaseReturns.findOne({
      $or: [
        { odometerKey: key },
        { titleKey: key },
        { damageKeys: key }
      ]
    });

    // If the key is in BonusUpload (and belongs to driver) OR if it's part of any lease return
    if (!bonusFound && !leaseFound) {
      return res.status(403).json({ error: 'Access denied. Image not found.' });
    }

    const signedUrl = await getSignedUrlForView(key);
    res.status(200).json({ url: signedUrl });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    res.status(500).json({ error: 'Could not generate signed URL' });
  }
});

module.exports = router;
