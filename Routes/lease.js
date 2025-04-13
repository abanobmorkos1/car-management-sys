const express = require('express');
const { addLr, getAlllr, deleteLr , updateLr } = require('../Controllers/leasecontroller');
const router = express.Router();

// Add a lease return
router.post('/createlr', addLr);

// Get all lease returns
router.get('/getlr', getAlllr);

// Delete a lease by ID
router.delete('/deletelLr/:id', deleteLr);

// Update a lease by ID
router.put('/updateLr/:id', updateLr);

module.exports = router;
