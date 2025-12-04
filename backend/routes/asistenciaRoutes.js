const express = require('express');
const router = express.Router();

const {
  registrarAsistencia,
  listarAsistencias,
  obtenerAsistenciasPorGrupo
} = require('../controllers/asistenciaController');

// Rutas de Alumnos
router.post('/', registrarAsistencia); // POST /api/asistencias

// Rutas Generales
router.get('/', listarAsistencias); // GET /api/asistencias (Lista general)

// RUTA PARA EL REPORTE POR GRUPO CON FALTAS
router.get('/reporte-grupo', obtenerAsistenciasPorGrupo);

module.exports = router;