// mock simple: materias por matricula/hora
const horarios = [
  { matricula: '182233', materia: 'Arquitectura', dia: 'Lunes', horaInicio: '09:00', horaFin: '10:30' }
];

function verificarHorario(matricula, materia) {
  // versión simplificada: siempre retorna true para pruebas
  return true;
}

module.exports = { verificarHorario };