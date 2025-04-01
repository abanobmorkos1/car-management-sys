const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  windowSticker: { type: Boolean, required: true, default: false },
  windowStickerpic:{ type: String, required: function() { return this.windowSticker; } }
});

module.exports = mongoose.model('Car', carSchema);