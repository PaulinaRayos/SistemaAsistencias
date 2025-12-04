// alumnosMock.js

// Alumno estático (mock temporal)
const alumno = {
    nombre: "Juan Pérez",
    matricula: "22550011",
    contraseña: "123",
    rol: "Alumno",
    carrera: "Ingeniería en Software",
    semestre: 5
};

function validarAlumno(matricula, contraseña) {
    if (matricula === alumno.matricula && contraseña === alumno.contraseña) {
        return alumno; // regresa al alumno completo
    }
    return null; // si no coincide
}
module.exports = { validarAlumno };