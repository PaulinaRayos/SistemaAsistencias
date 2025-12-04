// Normalizar texto
function normalizar(texto) {
  if (!texto) return ""; // evita error si es undefined o null
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const horarios = {
  "A001": [
    { materia: "Metodologías Ágiles", aula: "B12", horaInicio: "12:30", horaFin: "13:30", dias: ["Lunes", "Sábado"] },
    { materia: "Matemáticas Discretas", aula: "B14", horaInicio: "09:00", horaFin: "10:30", dias: ["Martes", "Jueves"] }
  ],
  "182233": [
    { materia: "Metodologías Ágiles", aula: "B12", horaInicio: "12:30", horaFin: "14:30", dias: ["Lunes", "Miércoles"] },
    { materia: "Administración de Proyectos", aula: "B12", horaInicio: "09:00", horaFin: "10:30", dias: ["Martes", "Jueves"] }
  ],
  "247045": [
    { materia: "Arquitectura Empresarial", aula: "B12", horaInicio: "00:00", horaFin: "05:00", dias: ["Lunes", "Miércoles", "Viernes"] },
    { materia: "Administración de Proyectos", aula: "B12", horaInicio: "11:00", horaFin: "12:30", dias: ["Martes"] }
  ],
  "225330": [
    { materia: "Administración de Proyectos", aula: "B12", horaInicio: "10:00", horaFin: "11:00", dias: ["Lunes", "Miércoles"] },
    { materia: "Arquitectura Empresarial", aula: "B12", horaInicio: "00:00", horaFin: "02:30", dias: ["Lunes", "Martes", "Jueves", "Viernes"] }
  ]
};

// --- Validar en tiempo real ---
function verificarHorario(matricula, materiaIngresada) {
  const hoy = new Date();
  const horaActual = hoy.toTimeString().slice(0, 5);
  const diaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][hoy.getDay()];

  const lista = horarios[matricula] || [];
  const materiaNormalizada = normalizar(materiaIngresada);

  return lista.find(h =>
    normalizar(h.materia) === materiaNormalizada &&
    h.dias.includes(diaSemana) &&
    horaActual >= h.horaInicio &&
    horaActual <= h.horaFin
  ) || null;
}

function obtenerHorario(matricula) {
  return horarios[matricula] || [];
}

function obtenerMateriasPorMaestro(matricula) {
  const grupos = {
    "M001": { "Metodologías Ágiles": ["182233", "247045"], "Administración de Proyectos": ["225330", "182233"] },
    "10001": { "Arquitectura Empresarial": ["247045", "225330"] }
  };


  const materiasDelMaestro = grupos[matricula];
  return materiasDelMaestro ? Object.keys(materiasDelMaestro) : [];

  //const lista = horarios[matricula] || [];
  //return lista.map(h => h.materia);
}

function obtenerAlumnosPorMateria(matriculaMaestro, materia) {
  const grupos = {
    "M001": { "Metodologías Ágiles": ["182233", "247045"], "Administración de Proyectos": ["225330", "182233"] },
    "10001": { "Arquitectura Empresarial": ["247045", "225330"] }
  };
  return grupos[matriculaMaestro]?.[materia] || [];
}


const sistemaHorariosMock = { verificarHorario, obtenerHorario, obtenerMateriasPorMaestro, obtenerAlumnosPorMateria };

// Exportar para Node
if (typeof module !== "undefined" && module.exports) {
  module.exports = sistemaHorariosMock;
}

// Exportar para navegador
if (typeof window !== "undefined") {
  window.sistemaHorariosMock = sistemaHorariosMock;
}
