// mock simple: lista de usuarios
const usuarios = [
  { matricula: '182233', nombre: 'Paulina Rodríguez', rol: 'Alumno' },
  { matricula: '10001', nombre: 'Profesor Uno', rol: 'Profesor' }
];

function validarUsuario(matricula) {
  return usuarios.find(u => u.matricula === matricula) || null;
}

module.exports = { validarUsuario };