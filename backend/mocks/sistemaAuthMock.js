// Función para normalizar letras y quitar acentos
function normalizarNombre(nombre) {
  return nombre
    .toLowerCase()
    .normalize("NFD")         // separa letras y acentos
    .replace(/[\u0300-\u036f]/g, ""); // quita los acentos
}

// mock simple: lista de usuarios
const usuarios = [
  { matricula: '182233', nombre: 'Paulina Rodríguez', rol: 'Alumno' },
  { matricula: '10001', nombre: 'Jose Robles', rol: 'Profesor' },

  // Usuarios nuevos que pediste
  { matricula: '247045', nombre: 'Cesar Adrian Duran Avalos', rol: 'Alumno' },
  { matricula: '225330', nombre: 'Valeria Guadalupe Encinas', rol: 'Alumno' }
];

// Validar por matrícula
function validarUsuario(matricula) {
  return usuarios.find(u => u.matricula === matricula) || null;
}

// Validar por nombre (con acentos o mayúsculas, no importa)
function validarNombre(nombreIngresado) {
  const nombreNormalizado = normalizarNombre(nombreIngresado);

  return usuarios.find(u => 
    normalizarNombre(u.nombre) === nombreNormalizado
  ) || null;
}

module.exports = { validarUsuario, validarNombre };
