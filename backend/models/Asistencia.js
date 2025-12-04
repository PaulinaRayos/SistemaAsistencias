const mongoose = require('mongoose');

const asistenciaSchema = new mongoose.Schema({
    matricula: { type: String, required: true },
    nombreAlumno: { type: String, required: true },
    materia: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    ubicacion: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    estado: { type: String, enum: ['Presente', 'Tarde', 'Ausente'], default: 'Presente' }
});


module.exports = mongoose.model('Asistencia', asistenciaSchema);
