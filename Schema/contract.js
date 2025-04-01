const contractSchema = new mongoose.Schema({
  name: { type: String, required: true },
  Adress: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'owner', 'staff', 'driver'], default: 'staff' },
});