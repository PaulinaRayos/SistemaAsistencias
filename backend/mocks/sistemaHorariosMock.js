// mock simple: materias por matricula/hora
//const horarios = [
 // { matricula: '182233', materia: 'Arquitectura', dia: 'Lunes', horaInicio: '09:00', horaFin: '10:30' }
//];

//function verificarHorario(matricula, materia) {
  // versión simplificada: siempre retorna true para pruebas
 // return true;
//}

//module.exports = { verificarHorario };


const horarios = {
  "182233": [
    {
      materia: "Metodologías Ágiles",
      aula: "B12",
      horaInicio: "10:00",
      horaFin: "11:00",
      dias: ["Lunes", "Miércoles"]
    }
  ]
};

function verificarHorario(matricula, materia) {
  const hoy = new Date();
  const horaActual = hoy.toTimeString().slice(0,5);
  const diaSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][hoy.getDay()];

  const lista = horarios[matricula] || [];
  
// Buscar el horario correcto
  const horario = lista.find(h =>
    h.materia === materia &&
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