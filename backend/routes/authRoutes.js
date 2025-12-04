const express = require("express");
const router = express.Router();

const { validarLogin } = require("../mocks/sistemaAuthMock"); // ruta al mock

router.post("/login", (req, res) => {
    const { matricula, contraseña } = req.body;

    const usuario = validarLogin(matricula, contraseña);

    if (!usuario) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.json({ mensaje: "Inicio de sesión exitoso", usuario });
});

module.exports = router;
