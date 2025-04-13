const COD = require('../models/cod');

const createCOD = async (req, res) => {
  try {
    const { customerName, phoneNumber, address, amount, method } = req.body;

    if (!req.files['contractPicture']) {
      return res.status(400).json({ message: 'Contract picture is required' });
    }

    const contractPicture = req.files['contractPicture'][0].location;
    const checkPicture = req.files['checkPicture']?.[0]?.location || null;

    if (method === 'Check' && !checkPicture) {
      return res.status(400).json({ message: 'Check picture is required for Check payments' });
    }

    const newCOD = new COD({
      customerName,
      phoneNumber,
      address,
      amount,
      method,
      contractPicture,
      checkPicture
    });

    const saved = await newCOD.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Error saving COD', error: err.message });
  }
};
