// controllers/aulaController.js

// Importa el objeto con las aulas
const aulasMock = require('../mocks/aulasMock');

// Devolver aulas como ARRAY para que el frontend pueda hacer forEach
const obtenerAulasMock = (req, res) => {
  try {
    const aulasArray = Object.entries(aulasMock).map(([aula, datos]) => ({
      aula,
      ...datos
    }));

    res.json(aulasArray);
  } catch (error) {
    console.error("Error al obtener aulas mock:", error);
    res.status(500).json({ mensaje: 'Error al obtener aulas mock' });
  }
};

// (Opcional) Si algún día quieres agregar aulas, pero no necesario hoy
const crearAula = (req, res) => {
  res.status(501).json({ mensaje: "Agregar aulas no está habilitado en mock" });
};

const eliminarAula = (req, res) => {
  res.status(501).json({ mensaje: "Eliminar aulas no está habilitado en mock" });
};

module.exports = { obtenerAulasMock, crearAula, eliminarAula };
