const express = require('express');
const router = express.Router();
const { obtenerUsuarios, registrarUsuario } = require('../controllers/usuarioController');

// Obtener lista de usuarios
router.get('/', obtenerUsuarios);

// Registrar un nuevo usuario
router.post('/', registrarUsuario);

module.exports = router;