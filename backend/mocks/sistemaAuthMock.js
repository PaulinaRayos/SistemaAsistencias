
// Normalizador (acentos)

function normalizarNombre(nombre) {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


// Mocks de usuarios UNIFICADOS

const usuarios = [

  // Módulo ITSON institucional

  { matricula: "A001", nombre: "Carlos Rivera", rol: "Alumno", contraseña: "123" },
  { matricula: "A002", nombre: "Ana Martínez", rol: "Alumno", contraseña: "123" },
  { matricula: "A003", nombre: "Roberto González", rol: "Alumno", contraseña: "123" },
  { matricula: "A004", nombre: "Sofía Hernández", rol: "Alumno", contraseña: "123" },
  { matricula: "A005", nombre: "Miguel Soto", rol: "Alumno", contraseña: "123" },
  { matricula: "A006", nombre: "Elena Ruiz", rol: "Alumno", contraseña: "123" },
  { matricula: "201015", nombre: "Jesús Castro", rol: "Alumno", contraseña: "123" },
  { matricula: "212248", nombre: "Andrea López", rol: "Alumno", contraseña: "123" },
  { matricula: "229071", nombre: "David Flores", rol: "Alumno", contraseña: "123" },
  { matricula: "230502", nombre: "Ximena Días", rol: "Alumno", contraseña: "123" },
  { matricula: "248899", nombre: "Ricardo Chávez", rol: "Alumno", contraseña: "123" },
  { matricula: "190033", nombre: "Gabriela Paz", rol: "Alumno", contraseña: "123" },
  { matricula: "204411", nombre: "Hugo Morales", rol: "Alumno", contraseña: "123" },
  { matricula: "215566", nombre: "Laura Vega", rol: "Alumno", contraseña: "123" },






  { matricula: "M001", nombre: "Luis Herrera", rol: "Maestro", contraseña: "123" },
  { matricula: "ADMIN1", nombre: "Administrador ITSON", rol: "Admin", contraseña: "123" },


  // Usuarios reales 

  { matricula: "182233", nombre: "Paulina Rodríguez", rol: "Alumno", contraseña: "123" },
  { matricula: "247045", nombre: "Cesar Adrian Duran Avalos", rol: "Alumno", contraseña: "123" },
  { matricula: "225330", nombre: "Valeria Guadalupe Encinas", rol: "Alumno", contraseña: "123" },

  // Profesor real
  { matricula: "10001", nombre: "Jose Robles", rol: "Profesor", contraseña: "123" },

  // Test sin horario
  { matricula: "111111", nombre: "Pepe", rol: "Alumno", contraseña: "123" },
  { matricula: "000000", nombre: "Pepe", rol: "Alumno", contraseña: "123" }
];


// VALIDACIONES

// Validación por matrícula + contraseña (login real)
function validarLogin(matricula, contraseña) {
  return usuarios.find(u =>
    u.matricula === matricula && u.contraseña === contraseña
  ) || null;
}

// Validar usuario por matrícula (para registro de asistencia)
function validarUsuario(matricula) {
  return validarPorMatricula(matricula);
}

// Validar solo por matrícula (por si lo necesitas)
function validarPorMatricula(matricula) {
  return usuarios.find(u => u.matricula === matricula) || null;
}

// Validar nombre (insensible a acentos y mayúsculas)
function validarPorNombre(nombreIngresado) {
  const nombreNormalizado = normalizarNombre(nombreIngresado);

  return usuarios.find(u =>
    normalizarNombre(u.nombre) === nombreNormalizado
  ) || null;
}


// EXPORTS
module.exports = {
  usuarios,
  validarLogin,
  validarPorMatricula,
  validarPorNombre,
  validarUsuario
};
