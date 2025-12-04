const Asistencia = require('../models/Asistencia');
const sistemaHorariosMock = require('../mocks/sistemaHorariosMock');
const sistemaAuthMock = require('../mocks/sistemaAuthMock');
const aulasMock = require('../mocks/aulasMock'); // <<< Usamos el mock de aulas
const calcularDistancia = require('../utils/distancia');

const { obtenerAlumnosPorMateria } = require('../mocks/gruposMock'); // Para lista de alumnos
const { validarPorMatricula } = require('../mocks/sistemaAuthMock'); // Para nombre de alumno



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

    // 1. Validar autenticación (Mock)
    const usuario = sistemaAuthMock.validarPorMatricula(matricula);
    if (!usuario)
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });

    // 2. Validar horario
    const horario = sistemaHorariosMock.verificarHorario(matricula, materia);
    if (!horario)
      return res.status(400).json({ mensaje: 'No hay clase en este horario' });


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

    // 4. Validar ubicación usando mock de aulas
    const aulaActual = aulasMock[horario.aula]; // <<< Mock
    if (!aulaActual) {
      return res.status(404).json({
        mensaje: `Error de configuración: El aula ${horario.aula} no tiene coordenadas registradas.`
      });
    }

    const distancia = calcularDistancia(
      ubicacion.lat,
      ubicacion.lng,
      aulaActual.lat,
      aulaActual.lng
    );

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

    const diffMin = (ahora - horaInicioClase) / 1000 / 60;
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
      aula: horario.aula
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




// -------------------------------------------------------------
// OBTENER MATERIAS DEL MAESTRO (Mock)
// -------------------------------------------------------------
async function obtenerMateriasPorMaestro(req, res) {
  try {
    const { rfc } = req.query;

    if (!rfc)
      return res.status(400).json({ mensaje: "Falta el RFC del maestro" });

    // Usamos el mock de horarios
    const materias = sistemaHorariosMock.obtenerMateriasPorMaestro(rfc);

    if (!materias || materias.length === 0)
      return res.status(404).json({ mensaje: "El maestro no tiene materias registradas" });

    res.json({
      mensaje: "Materias encontradas",
      total: materias.length,
      materias
    });

  } catch (error) {
    console.error("Error al obtener materias del maestro:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

// =============================================================
//  OBTENER ASISTENCIAS POR GRUPO CON FALTAS
// =============================================================
async function obtenerAsistenciasPorGrupo(req, res) {
  try {
    // 1. Obtener parámetros: Maestro (RFC), materia y fecha
    const { rfcMaestro, materia, fecha } = req.query; // Se espera la fecha como 'YYYY-MM-DD'

    if (!rfcMaestro || !materia || !fecha) {
      return res.status(400).json({
        mensaje: "Faltan parámetros: rfcMaestro, materia y fecha son obligatorios."
      });
    }

    // 2. Definir el rango de fecha para el día específico
    const fechaClase = new Date(fecha);
    const inicioDia = new Date(fechaClase);
    inicioDia.setHours(0, 0, 0, 0); // Inicio del día (00:00:00)
    const finDia = new Date(fechaClase);
    finDia.setHours(23, 59, 59, 999); // Fin del día (23:59:59)

    // 3. Obtener la lista de MATRÍCULAS de todos los alumnos de ese grupo/materia
    // Se usa el mock que importaste: obtenerAlumnosPorMateria
    const alumnosDelGrupo = obtenerAlumnosPorMateria(rfcMaestro, materia);

    if (!alumnosDelGrupo || alumnosDelGrupo.length === 0) {
      return res.status(404).json({
        mensaje: `No se encontraron alumnos en el grupo de ${materia} para el maestro ${rfcMaestro}.`
      });
    }

    // 4. Obtener las asistencias REGISTRADAS para esa materia y rango de fecha
    const asistenciasRegistradas = await Asistencia.find({
      materia,
      fecha: { $gte: inicioDia, $lte: finDia }
    }).lean(); // lean() hace la consulta más rápida

    // 5. Mapear las asistencias registradas a un objeto para búsqueda rápida por matrícula
    const asistenciasMap = asistenciasRegistradas.reduce((map, reg) => {
      map[reg.matricula] = reg;
      return map;
    }, {});

    // 6. Generar la lista final con FALTAS automáticas
    const reporteFinal = alumnosDelGrupo.map(matricula => {
      const registro = asistenciasMap[matricula];
      // Obtener el nombre del alumno (usando el mock que importaste)
      const infoAlumno = validarPorMatricula(matricula) || { nombre: `Alumno desconocido (${matricula})` };

      if (registro) {
        // Asistencia registrada (Presente o Tarde)
        return registro;
      } else {
        // No hay registro, es FALTA / Ausente
        return {
          matricula: matricula,
          nombreAlumno: infoAlumno.nombre,
          materia: materia,
          fecha: inicioDia, // Usar el inicio del día para la falta
          estado: 'Falta', // Nuevo estado "Falta" o "Ausente"
          ubicacion: { lat: 0, lng: 0 } // Datos de ubicación por defecto
        };
      }
    });

    res.json({
      mensaje: `Reporte de asistencias para ${materia} del ${fechaClase.toLocaleDateString()}`,
      total: reporteFinal.length,
      datos: reporteFinal
    });

  } catch (error) {
    console.error("Error al obtener reporte por grupo:", error);
    res.status(500).json({ mensaje: "Error al generar el reporte" });
  }
}


module.exports = {
  registrarAsistencia,
  listarAsistencias,
  obtenerAsistenciasPorGrupo
};