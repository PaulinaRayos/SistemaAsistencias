const express = require('express');
const router = express.Router();

// Ejemplo de endpoint temporal
router.get('/', (req, res) => {
  res.json({ mensaje: 'Ruta de usuarios funcionando correctamente' });
});

module.exports = router;