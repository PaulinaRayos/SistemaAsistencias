const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

module.exports = async function connectDB() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error conectando a MongoDB', err);
    process.exit(1);
  }
}