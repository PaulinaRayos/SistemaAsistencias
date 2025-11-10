const Asistencia = require('../models/Asistencia');
const sistemaHorariosMock = require('../mocks/sistemaHorariosMock');
const sistemaAuthMock = require('../mocks/sistemaAuthMock');

// registrar asistencia (simplificado)
async function registrarAsistencia(req, res) {
  try {
    const { matricula, materia, ubicacion } = req.body;

    // validaciones básicas: auth mock y horario mock
    const usuario = sistemaAuthMock.validarUsuario(matricula);
    if (!usuario) return res.status(401).json({ mensaje: 'Usuario no autenticado' });

    const horarioValido = sistemaHorariosMock.verificarHorario(matricula, materia);
    if (!horarioValido) return res.status(400).json({ mensaje: 'No hay clase en este horario' });

    // aquí la validación real de GPS debe hacerse en frontend o con lógica adicional
    const nueva = new Asistencia({ ...req.body });
    await nueva.save();
    res.json({ mensaje: 'Asistencia registrada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
}

async function listarAsistencias(req, res) {
  console.log("Ruta /api/asistencias activada"); // mensaje en la consola

  try {
    const datos = await Asistencia.find().limit(200).sort({ fecha: -1 });
    res.json({
      mensaje: "Ruta de asistencias funcionando correctamente",
      total: datos.length,
      datos
    });
  } catch (error) {
    console.error("Error al listar asistencias:", error);
    res.status(500).json({ mensaje: "Error al obtener las asistencias" });
  }
}

module.exports = { registrarAsistencia, listarAsistencias };