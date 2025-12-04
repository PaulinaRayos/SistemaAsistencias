const Usuario = require('../models/Usuario');

// IMPORTAR MOCKS CORREGIDOS
const { 
  validarLogin, 
  validarPorMatricula, 
  validarPorNombre 
} = require('../mocks/sistemaAuthMock');

const { validarAdmin } = require('../mocks/adminMock');


// =====================================================
// OBTENER TODOS LOS USUARIOS (BD)
// =====================================================
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
};


// =====================================================
// REGISTRAR NUEVO USUARIO (BD)
// =====================================================
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, matricula, contraseña } = req.body;

    if (!nombre || !matricula || !contraseña) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const existe = await Usuario.findOne({ matricula });
    if (existe) {
      return res.status(400).json({ mensaje: 'La matrícula ya está registrada' });
    }

    const nuevoUsuario = new Usuario({ nombre, matricula, contraseña });
    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error });
  }
};


// =====================================================
// INICIAR SESIÓN (ADMIN → BD → MOCKS)
// =====================================================
const iniciarSesion = async (req, res) => {
  try {
    const { matricula, contraseña } = req.body;

    if (!matricula || !contraseña) {
      return res.status(400).json({ mensaje: "Faltan datos" });
    }


    // -------------------------------------------------
    // 1) VALIDAR ADMIN
    // -------------------------------------------------
    const admin = validarAdmin(matricula, contraseña);
    if (admin) {
      return res.json({
        mensaje: 'Inicio de sesión exitoso (Admin)',
        usuario: {
          nombre: admin.nombre,
          matricula: admin.matricula,
          rol: admin.rol
        }
      });
    }


    // -------------------------------------------------
    // 2) VALIDAR USUARIO EN BASE DE DATOS
    // -------------------------------------------------
    const usuarioBD = await Usuario.findOne({ matricula });

    if (usuarioBD) {
      if (usuarioBD.contraseña !== contraseña) {
        return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
      }

      return res.json({
        mensaje: 'Inicio de sesión exitoso',
        usuario: {
          nombre: usuarioBD.nombre,
          matricula: usuarioBD.matricula,
          rol: 'Usuario'
        }
      });
    }


    // -------------------------------------------------
    // 3) VALIDAR USUARIOS MOCK (ALUMNOS / MAESTROS)
    // -------------------------------------------------
    
    // Opción A: validar matrícula + contraseña
    const usuarioMockLogin = validarLogin(matricula, contraseña);

    if (usuarioMockLogin) {
      return res.json({
        mensaje: 'Inicio de sesión exitoso (Mock)',
        usuario: usuarioMockLogin
      });
    }

    // Opción B: validar por nombre (solo si ingresó nombre)
    const usuarioMockNombre = validarPorNombre(matricula);

    if (usuarioMockNombre) {
      return res.json({
        mensaje: 'Inicio de sesión exitoso (Mock por nombre)',
        usuario: usuarioMockNombre
      });
    }


    // Si no existe en BD ni en mocks
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });


  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};



module.exports = { obtenerUsuarios, registrarUsuario, iniciarSesion };
