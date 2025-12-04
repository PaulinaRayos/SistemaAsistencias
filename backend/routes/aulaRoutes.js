const express = require('express');
const router = express.Router();
const { obtenerAulasMock, crearAula, eliminarAula } = require('../controllers/aulaController');

// Endpoint que devuelve solo las aulas mock
router.get('/mock', obtenerAulasMock); // GET /api/aulas/mock

// Endpoints opcionales si algún día quieres usar BD
router.post('/', crearAula);          // POST /api/aulas
router.delete('/:id', eliminarAula);  // DELETE /api/aulas/:id

module.exports = router;
