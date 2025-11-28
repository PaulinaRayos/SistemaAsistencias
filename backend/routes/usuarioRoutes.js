const express = require('express');
const router = express.Router();
const { obtenerUsuarios, registrarUsuario, iniciarSesion } = require('../controllers/usuarioController');

// Rutas
router.get('/', obtenerUsuarios);       // GET /api/usuarios
router.post('/registro', registrarUsuario); // POST /api/usuarios/registro
router.post('/login', iniciarSesion);       // POST /api/usuarios/login

module.exports = router;