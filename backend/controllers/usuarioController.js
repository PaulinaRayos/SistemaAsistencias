const Usuario = require('../models/Usuario');

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
};

// Registrar nuevo usuario
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const existe = await Usuario.findOne({ correo });
    if (existe) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    const nuevoUsuario = new Usuario({ nombre, correo, contraseña });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error });
  }
};

// ----------------------------------------------------
// NUEVO: INICIAR SESIÓN
// ----------------------------------------------------
const iniciarSesion = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // 1. Buscar usuario por correo
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // 2. Validar contraseña (Comparación directa por ahora, idealmente usar bcrypt)
    if (usuario.contraseña !== contraseña) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // 3. Responder éxito
    res.json({ 
      mensaje: 'Inicio de sesión exitoso', 
      usuario: { nombre: usuario.nombre, correo: usuario.correo } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

module.exports = { obtenerUsuarios, registrarUsuario, iniciarSesion };