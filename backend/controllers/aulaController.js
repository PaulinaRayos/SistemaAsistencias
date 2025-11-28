const Aula = require('../models/Aula');

// Listar todas las aulas
const obtenerAulas = async (req, res) => {
  try {
    const aulas = await Aula.find();
    res.json(aulas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener aulas', error });
  }
};

// Crear nueva aula
const crearAula = async (req, res) => {
  try {
    const { nombre, edificio, lat, lng, radio } = req.body;

    if (!nombre || !lat || !lng) {
      return res.status(400).json({ mensaje: 'Nombre, Latitud y Longitud son obligatorios' });
    }

    const nuevaAula = new Aula({ nombre, edificio, lat, lng, radio });
    await nuevaAula.save();

    res.status(201).json({ mensaje: 'Aula registrada exitosamente', aula: nuevaAula });
  } catch (error) {
    // Error de duplicado (código 11000 en Mongo)
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe un aula con ese nombre' });
    }
    res.status(500).json({ mensaje: 'Error al registrar aula', error });
  }
};

// Eliminar aula
const eliminarAula = async (req, res) => {
  try {
    const { id } = req.params;
    await Aula.findByIdAndDelete(id);
    res.json({ mensaje: 'Aula eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar aula' });
  }
};

module.exports = { obtenerAulas, crearAula, eliminarAula };