// gruposMock.js
// Relación maestro → materias → alumnos
const gruposMaestros = {
  "M001": [
    {
      materia: "Metodologías Ágiles", aula: "B12", alumnos: [
        "182233", "247045", "A001", "A002",
        "A003", "A004", "A005", "A006", "201015",
        "212248", "229071", "230502", "248899", "190033"
      ]
    },
    {
      materia: "Administración de Proyectos", aula: "B12", alumnos: [
        "182233", "247045", "A001", "A002",
        "A003", "A004", "A005", "A006", "201015",
        "212248", "229071", "230502", "248899", "190033"
      ]
    }
  ],
  "10001": [
    { materia: "Arquitectura Empresarial", aula: "B12", alumnos: ["247045", "225330"] }
  ]
};

function obtenerMateriasPorMaestro(matriculaMaestro) {
  const grupos = gruposMaestros[matriculaMaestro] || [];
  return grupos.map(g => g.materia);
}

function obtenerAlumnosPorMateria(matriculaMaestro, materia) {
  const grupo = (gruposMaestros[matriculaMaestro] || []).find(g => g.materia === materia);
  return grupo ? grupo.alumnos : [];
}

if (typeof window !== "undefined") {
  window.sistemaGruposMock = {
    obtenerMateriasPorMaestro,
    obtenerAlumnosPorMateria
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    gruposMaestros,
    obtenerMateriasPorMaestro,
    obtenerAlumnosPorMateria // 
  };
}