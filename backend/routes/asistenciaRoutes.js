const express = require('express');
const router = express.Router();
const { registrarAsistencia, listarAsistencias } = require('../controllers/asistenciaController');

router.post('/', registrarAsistencia);
router.get('/', listarAsistencias);

module.exports = router;