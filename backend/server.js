require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./database/mongo_connection');

const asistenciaRoutes = require('./routes/asistenciaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const aulaRoutes = require('./routes/aulaRoutes'); 

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'frontend')));

connectDB();

app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/aulas', aulaRoutes); 

app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));