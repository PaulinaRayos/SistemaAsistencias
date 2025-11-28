const express = require('express');
const router = express.Router();
const { obtenerAulas, crearAula, eliminarAula } = require('../controllers/aulaController');

router.get('/', obtenerAulas);      // GET /api/aulas
router.post('/', crearAula);        // POST /api/aulas
router.delete('/:id', eliminarAula); // DELETE /api/aulas/:id

module.exports = router;