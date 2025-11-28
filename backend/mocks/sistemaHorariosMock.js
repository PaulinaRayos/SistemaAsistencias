// Normalizar texto (quita acentos y minúsculas/mayúsculas)
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const horarios = {
  "182233": [
    {
      materia: "Metodologías Ágiles",
      aula: "B12",
      horaInicio: "12:30",
      horaFin: "14:30",
      dias: ["Lunes", "Miércoles"]
    },
    {
      materia: "Administración de Proyectos",
      aula: "B12",
      horaInicio: "09:00",
      horaFin: "10:30",
      dias: ["Martes", "Jueves"]
    }
  ],

  "247045": [
    {
      materia: "Arquitectura Empresarial",
      aula: "B12",
      horaInicio: "00:00",
      horaFin: "05:00",
      dias: ["Lunes", "Miércoles", "Viernes"]
    },
    {
      materia: "Administración de Proyectos",
      aula: "B12",
      horaInicio: "11:00",
      horaFin: "12:30",
      dias: ["Martes"]
    }
  ],

  "225330": [
    {
      materia: "Administración de Proyectos",
      aula: "B12",
      horaInicio: "10:00",
      horaFin: "11:00",
      dias: ["Lunes", "Miércoles"]
    },
    {
      materia: "Arquitectura Empresarial",
      aula: "B12",
      horaInicio: "00:00",
      horaFin: "02:30",
      dias: ["Lunes","Martes", "Jueves", "Viernes"]
    }
  ]
};

// ------------------------------
// Validar horario en tiempo real
// ------------------------------
function verificarHorario(matricula, materiaIngresada) {
  const hoy = new Date();
  const horaActual = hoy.toTimeString().slice(0, 5);
  const diaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][hoy.getDay()];

  const lista = horarios[matricula] || [];

  const materiaNormalizada = normalizar(materiaIngresada);

  // Comparación flexible de materias
  const horario = lista.find(h =>
    normalizar(h.materia) === materiaNormalizada &&
    h.dias.includes(diaSemana) &&
    horaActual >= h.horaInicio &&
    horaActual <= h.horaFin
  );

  return horario || null;
}

function obtenerHorario(matricula) {
  return horarios[matricula] || [];
}

module.exports = { verificarHorario, obtenerHorario };
