// backend\routes\materiasRoutes.js

const express = require('express');
const router = express.Router();
const sistemaHorariosMock = require('../mocks/sistemaHorariosMock');

// GET /api/materias-maestro?matricula=...
router.get('/materias-maestro', (req, res) => {
    // 1. Usa 'matricula' (que es lo que enviamos desde el frontend)
    const { matricula } = req.query; 

    if (!matricula) return res.status(400).json({ mensaje: "Falta la matrícula del maestro" });

    // 2. Llama a la función del mock que usa la matrícula del maestro
    const materias = sistemaHorariosMock.obtenerMateriasPorMaestro(matricula);
    
    // 3. Envía la respuesta en el formato esperado por el frontend (objeto con clave 'materias')
    res.json({ materias });
});

module.exports = router;
