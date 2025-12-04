// routes/usuarioRoutes.js

const express = require('express');
const router = express.Router();

const { 
  obtenerUsuarios, 
  registrarUsuario, 
  iniciarSesion 
} = require('../controllers/usuarioController');

// GET /api/usuarios
router.get('/', obtenerUsuarios);

// POST /api/usuarios/registro
router.post('/registro', registrarUsuario);

// POST /api/usuarios/login
router.post('/login', iniciarSesion);

module.exports = router;
