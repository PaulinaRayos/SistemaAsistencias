// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Modelos y mocks
const Asistencia = require('./models/Asistencia'); // Ajusta la ruta si es necesario
const { gruposMaestros, obtenerMateriasPorMaestro, obtenerAlumnosPorMateria } = require('./mocks/gruposMock');


// Rutas existentes
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const aulaRoutes = require('./routes/aulaRoutes');
const authRoutes = require('./routes/authRoutes');
const materiasRoutes = require('./routes/materiasRoutes');

// Conexión a MongoDB
const connectDB = require('./database/mongo_connection');

// Inicializar Express
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Carpeta del frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Servir la carpeta de mocks
app.use('/mocks', express.static(path.join(__dirname, 'mocks')));

// Registrar rutas API
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/aulas', aulaRoutes);
app.use('/api', authRoutes);
app.use('/api', materiasRoutes);

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});


// Importar el mock de horarios del alumno
const sistemaHorariosMock = require('./mocks/sistemaHorariosMock');

// Endpoint para obtener materias de un alumno por matrícula
app.get('/api/horarios/:matricula', (req, res) => {
    const matricula = req.params.matricula;
    const materias = sistemaHorariosMock.obtenerHorario(matricula);

    if (!materias || materias.length === 0) {
        return res.status(404).json({ mensaje: 'No se encontraron materias para este alumno' });
    }

    res.json(materias);
});






// Función para llenar la base con registros de asistencias automáticamente
async function seedAsistencias() {
  try {
    const count = await Asistencia.countDocuments();
    if (count > 0) {
      console.log('Ya hay asistencias en la base de datos, no se insertan nuevas.');
      return;
    }

    const registros = [];

    // Valores base de ubicación por aula
    const ubicacionBase = {
      B12: { lat: 27.484, lng: -109.933 } // ejemplo para aula B12
      // Si tuvieras más aulas, puedes agregarlas aquí
    };

    Object.keys(gruposMaestros).forEach(maestro => {
      gruposMaestros[maestro].forEach(grupo => {
        grupo.alumnos.forEach(alumno => {
          registros.push({
            matricula: alumno,
            nombreAlumno: `Alumno ${alumno}`,
            materia: grupo.materia,
            fecha: new Date(),
            estado: Math.random() > 0.5 ? 'Presente' : 'Tarde',
            ubicacion: ubicacionBase[grupo.aula] || { lat: 0, lng: 0 } // usa ubicación del aula o 0 si no existe
          });
        });
      });
    });

    await Asistencia.insertMany(registros);
    console.log(`Seed completo: ${registros.length} asistencias insertadas.`);
  } catch (error) {
    console.error('Error al hacer seed de asistencias:', error);
  }
}
// Función principal para iniciar servidor
async function iniciarServidor() {
  try {
    await connectDB(); // connectDB debe retornar la promesa de mongoose.connect
    console.log('Conectado a MongoDB');

    await seedAsistencias(); // Seed automático al iniciar

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  } catch (error) {
    console.error('Error inicializando el servidor:', error);
  }
}

iniciarServidor();
