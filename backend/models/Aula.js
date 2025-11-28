const mongoose = require('mongoose');

const aulaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true, // Ej: "B12"
    unique: true,
    trim: true
  },
  edificio: {
    type: String, // Ej: "B"
    trim: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  radio: {
    type: Number,
    default: 20 // Metros de tolerancia por defecto
  }
});

module.exports = mongoose.model('Aula', aulaSchema);