// adminMock.js

// Admin estático (mock)
const admin = {
    nombre: "Administrador",
    matricula: "ADMIN",
    contraseña: "123",
    rol: "Admin"
};

function validarAdmin(matricula, contraseña) {
    if (matricula === admin.matricula && contraseña === admin.contraseña) {
        return admin;
    }
    return null;
}

module.exports = { validarAdmin };
