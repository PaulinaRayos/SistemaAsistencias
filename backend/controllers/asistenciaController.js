const Asistencia = require('../models/Asistencia');
const sistemaHorariosMock = require('../mocks/sistemaHorariosMock');
const sistemaAuthMock = require('../mocks/sistemaAuthMock');
const aulasMock = require('../mocks/aulasMock');
const calcularDistancia = require('../utils/distancia');

// ----------------------------------------------
//  REGISTRAR ASISTENCIA
// ----------------------------------------------
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function registrarAsistencia(req, res) {
  try {
    const { matricula, materia, ubicacion } = req.body;

    // 1. Validar autenticación
    const usuario = sistemaAuthMock.validarUsuario(matricula);
    if (!usuario)
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });


 // ---------------- VALIDACIÓN DE HORARIOS ----------------
    console.log("🔄 Solicitando horarios del alumno:", matricula);

    let horariosAlumno;

    try {
      horariosAlumno = sistemaHorariosMock.obtenerHorario(matricula);
      console.log("Horarios obtenidos correctamente:", horariosAlumno);
    } catch (error) {
      // ECU03_CP02 — Error al conectar con el mock
      console.error("Error al sincronizar horarios:", error);

      return res.status(500).json({
        mensaje: "Error al sincronizar horarios, reintente más tarde"
      });
    }

    // ECU03_CP03 — Matrícula no existe en el sistema institucional
    if (!horariosAlumno || horariosAlumno.length === 0) {
      console.warn("Matrícula no encontrada en sistema institucional:", matricula);

      return res.status(404).json({
        mensaje: "No se encontraron horarios para esta matrícula"
      });
    }



    // 2. Validar horario
    const horarioValido = sistemaHorariosMock.verificarHorario(matricula, materia);
    if (!horarioValido)
      return res.status(400).json({ mensaje: 'No hay clase en este horario' });

    // Obtener horario específico
    const horario = sistemaHorariosMock.obtenerHorario(matricula)
  .find(h => normalizar(h.materia) === normalizar(materia));

    if (!horario)
      return res.status(400).json({ mensaje: 'Horario no encontrado para esta materia' });

    
    // 3. Verificar si YA registró asistencia hoy

    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    const yaExiste = await Asistencia.findOne({
      matricula,
      materia,
      fecha: { $gte: inicioDia, $lte: finDia }
    });

    if (yaExiste) {
      return res.status(400).json({
        mensaje: "Ya registraste asistencia para esta clase hoy",
        registroPrevio: yaExiste
      });
    }

    // 4. Validar ubicación (igual que antes)

    const aulaActual = aulasMock.find(a => a.aula === horario.aula);

    if (!aulaActual)
      return res.status(500).json({ mensaje: "Aula no configurada en mock" });

    const distancia = calcularDistancia(
      ubicacion.lat,
      ubicacion.lng,
      aulaActual.lat,
      aulaActual.lng
    );

    if (distancia > aulaActual.radio) {
      return res.status(400).json({
        mensaje: "Fuera del aula. Debes estar dentro del aula para registrar asistencia",
        distancia,
        limite: aulaActual.radio
      });
    }

    // 5. Determinar si es "Presente" o "Tarde"

    const ahora = new Date();
    const [h, m] = horario.horaInicio.split(":").map(Number);

    const horaInicioClase = new Date();
    horaInicioClase.setHours(h, m, 0, 0);

    const diffMin = (ahora - horaInicioClase) / 1000 / 60; // minutos de diferencia

    let estado = "Presente";
    if (diffMin > 10) estado = "Tarde";

    // 6. Registrar asistencia
    
    const nueva = new Asistencia({
      matricula,
      nombreAlumno: usuario.nombre,
      materia,
      ubicacion,
      estado,
      fecha: ahora
    });

    await nueva.save();

    res.json({
      mensaje: 'Asistencia registrada correctamente',
      estado,
      minutosTarde: diffMin.toFixed(2),
      distancia,
      aula: aulaActual.aula
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
}

//  LISTAR ASISTENCIAS

async function listarAsistencias(req, res) {
  console.log("Ruta /api/asistencias activada");

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
