const Asistencia = require('../models/Asistencia');
const sistemaHorariosMock = require('../mocks/sistemaHorariosMock');
const sistemaAuthMock = require('../mocks/sistemaAuthMock');
const aulasMock = require('../mocks/aulasMock');
const calcularDistancia = require('../utils/distancia');
const { obtenerAlumnosPorMateria } = require('../mocks/gruposMock');
const { validarPorMatricula } = require('../mocks/sistemaAuthMock');

// ---------------------- AUXILIARES ----------------------
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


function validarDiaDeClase(materia, matriculaAlumno, fecha) {
  const diaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][fecha.getDay()];
  
  const horariosAlumno = sistemaHorariosMock.obtenerHorario(matriculaAlumno) || [];

  return horariosAlumno.some(h =>
    h.materia === materia && h.dias.includes(diaSemana)
  );
}

// genera fechas día por día
function getDatesBetween(startDate, endDate) {
  const dates = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
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

async function obtenerAsistenciasPorGrupo(req, res) {
  try {
    const { rfcMaestro, materia, fecha } = req.query;

    if (!rfcMaestro || !materia || !fecha) {
      return res.status(400).json({
        mensaje: "Faltan parámetros: rfcMaestro, materia y fecha son obligatorios."
      });
    }

    const fechaClase = new Date(fecha + 'T12:00:00');
    const alumnosDelGrupo = obtenerAlumnosPorMateria(rfcMaestro, materia);

    if (!alumnosDelGrupo || alumnosDelGrupo.length === 0) {
      return res.status(404).json({
        mensaje: `No se encontraron alumnos en el grupo de ${materia} para el maestro ${rfcMaestro}.`
      });
    }

    const matriculaAlumnoMuestra = alumnosDelGrupo[0];
    if (!validarDiaDeClase(materia, matriculaAlumnoMuestra, fechaClase)) {

      const diaSemana = fechaClase.toLocaleDateString('es-ES', { weekday: 'long' });
      return res.status(400).json({
        mensaje: `El grupo de ${materia} no tiene clase el día ${diaSemana}. Seleccione una fecha válida.`
      });
    }


    const inicioDia = new Date(fechaClase);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fechaClase);
    finDia.setHours(23, 59, 59, 999);
    const asistenciasRegistradas = await Asistencia.find({
      materia,
      fecha: { $gte: inicioDia, $lte: finDia }
    }).lean();


    const asistenciasMap = asistenciasRegistradas.reduce((map, reg) => {
      map[reg.matricula] = reg;
      return map;
    }, {});


    const reporteFinal = alumnosDelGrupo.map(matricula => {
      const registro = asistenciasMap[matricula];
      const infoAlumno = validarPorMatricula(matricula) || { nombre: `Alumno desconocido (${matricula})` };

      if (registro) {
        return registro;
      } else {

        return {
          matricula,
          nombreAlumno: infoAlumno.nombre,
          materia,
          fecha: inicioDia,
          estado: 'Falta',
          ubicacion: { lat: 0, lng: 0 }
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

// ---------------------- REPORTE POR RANGO ----------------------
async function obtenerAsistenciasPorGrupoRango(req, res) {
  try {
    const { rfcMaestro, materia, fechaInicio, fechaFin } = req.query;

    if (!rfcMaestro || !materia || !fechaInicio || !fechaFin) {
      return res.status(400).json({
        mensaje: "Faltan parámetros: rfcMaestro, materia, fechaInicio y fechaFin son obligatorios."
      });
    }

    const inicio = new Date(fechaInicio + 'T12:00:00');
    const fin = new Date(fechaFin + 'T12:00:00');

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || fin < inicio) {
      return res.status(400).json({ mensaje: "Rango de fechas inválido" });
    }

    const alumnosDelGrupo = obtenerAlumnosPorMateria(rfcMaestro, materia);
    if (!alumnosDelGrupo || alumnosDelGrupo.length === 0) {
      return res.status(404).json({
        mensaje: `No se encontraron alumnos en el grupo de ${materia} para el maestro ${rfcMaestro}.`
      });
    }

    const fechas = getDatesBetween(
      new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()),
      new Date(fin.getFullYear(), fin.getMonth(), fin.getDate())
    );

    const reporteAcumulado = [];

    for (const fechaActual of fechas) {
      const matriculaAlumnoMuestra = alumnosDelGrupo[0];

      // Solo días donde realmente hay clase
      if (!validarDiaDeClase(materia, matriculaAlumnoMuestra, fechaActual)) {
        continue;
      }

      const inicioDia = new Date(fechaActual);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(fechaActual);
      finDia.setHours(23, 59, 59, 999);

      const asistenciasRegistradas = await Asistencia.find({
        materia,
        fecha: { $gte: inicioDia, $lte: finDia }
      }).lean();

      const asistenciasMap = asistenciasRegistradas.reduce((map, reg) => {
        map[reg.matricula] = reg;
        return map;
      }, {});

      alumnosDelGrupo.forEach(matricula => {
        const registro = asistenciasMap[matricula];
        const infoAlumno = validarPorMatricula(matricula) || { nombre: `Alumno desconocido (${matricula})` };

        if (registro) {
          reporteAcumulado.push(registro);
        } else {
          reporteAcumulado.push({
            matricula,
            nombreAlumno: infoAlumno.nombre,
            materia,
            fecha: inicioDia,
            estado: 'Falta',
            ubicacion: { lat: 0, lng: 0 }
          });
        }
      });
    }

    return res.json({
      mensaje: `Reporte de asistencias para ${materia} del rango ${fechaInicio} a ${fechaFin}`,
      total: reporteAcumulado.length,
      datos: reporteAcumulado
    });

  } catch (error) {
    console.error("Error al obtener reporte por grupo en rango:", error);
    return res.status(500).json({ mensaje: "Error al generar el reporte por rango" });
  }
}

module.exports = {
  registrarAsistencia,
  listarAsistencias,
  obtenerAsistenciasPorGrupo,
  obtenerAsistenciasPorGrupoRango
};