const Asistencia = require('../models/Asistencia');
const Aula = require('../models/Aula'); // <<< CAMBIO 1: Importamos el modelo de la BD
const sistemaHorariosMock = require('../mocks/sistemaHorariosMock');
const sistemaAuthMock = require('../mocks/sistemaAuthMock');
// const aulasMock = require('../mocks/aulasMock'); // <<< ESTO YA NO SE USA
const calcularDistancia = require('../utils/distancia');

// Función auxiliar para normalizar texto
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ----------------------------------------------
//  REGISTRAR ASISTENCIA
// ----------------------------------------------
async function registrarAsistencia(req, res) {
  try {
    const { matricula, materia, ubicacion } = req.body;

    // 1. Validar autenticación (Simulada con Mock por ahora)
    const usuario = sistemaAuthMock.validarUsuario(matricula);
    if (!usuario)
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });

    // 2. Validar horario
    const horarioValido = sistemaHorariosMock.verificarHorario(matricula, materia);
    if (!horarioValido)
      return res.status(400).json({ mensaje: 'No hay clase en este horario' });

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

    // ------------------------------------------------------------------
    // 4. Validar ubicación (AHORA CON DATOS REALES DE MONGODB)
    // ------------------------------------------------------------------
    
    // Buscamos el aula en la BD por su nombre (Ej: "B12")
    const aulaActual = await Aula.findOne({ nombre: horario.aula }); // <<< CAMBIO 2: Consulta a BD

    if (!aulaActual) {
      // Si el aula está en el horario pero no en la BD de aulas
      return res.status(404).json({ 
        mensaje: `Error de configuración: El aula ${horario.aula} no tiene coordenadas registradas en el sistema.` 
      });
    }

    const distancia = calcularDistancia(
      ubicacion.lat,
      ubicacion.lng,
      aulaActual.lat,
      aulaActual.lng
    );

    // Usamos el radio configurado en la BD (o 20m por defecto)
    const radioPermitido = aulaActual.radio || 20;

    if (distancia > radioPermitido) {
      return res.status(400).json({
        mensaje: "Fuera del aula. Debes estar dentro del salón para registrar asistencia.",
        distancia: Math.round(distancia) + " metros",
        limite: radioPermitido + " metros"
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

    // 6. Guardar la asistencia
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
      distancia: Math.round(distancia),
      aula: aulaActual.nombre
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
}

//  LISTAR ASISTENCIAS
async function listarAsistencias(req, res) {
  try {
    const datos = await Asistencia.find().limit(200).sort({ fecha: -1 });
    res.json({
      mensaje: "Datos obtenidos",
      total: datos.length,
      datos
    });
  } catch (error) {
    console.error("Error al listar asistencias:", error);
    res.status(500).json({ mensaje: "Error al obtener las asistencias" });
  }
}

module.exports = { registrarAsistencia, listarAsistencias };