const mongoose = require('mongoose');

const asistenciaSchema = new mongoose.Schema({
  matricula: { type: String, required: true },
  nombreAlumno: String,
  materia: String,
  fecha: { type: Date, default: Date.now },
  ubicacion: {
    lat: Number,
    lng: Number
  },
  estado: { type: String, enum: ['Presente','Ausente','Tarde'], default: 'Presente' }
});

module.exports = mongoose.model('Asistencia', asistenciaSchema);