// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const Asistencia = require('./models/Asistencia');
const connectDB = require('./database/mongo_connection');

// Mocks / controladores
const sistemaHorariosMock = require('./mocks/sistemaHorariosMock');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const aulaRoutes = require('./routes/aulaRoutes');
const authRoutes = require('./routes/authRoutes');
const materiasRoutes = require('./routes/materiasRoutes');
const asistenciaController = require('./controllers/asistenciaController');

const app = express();

app.use(cors());
app.use(express.json());

// Frontend
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/mocks', express.static(path.join(__dirname, 'mocks')));

// Rutas base
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/aulas', aulaRoutes);
app.use('/api', authRoutes);
app.use('/api', materiasRoutes);

// Horarios de alumno
app.get('/api/horarios/:matricula', (req, res) => {
  const matricula = req.params.matricula;
  const materias = sistemaHorariosMock.obtenerHorario(matricula);

  if (!materias || materias.length === 0) {
    return res.status(404).json({ mensaje: 'No se encontraron materias para este alumno' });
  }

  res.json(materias);
});

// Reporte por rango (usa el controller)
app.get('/api/asistencias/reporte-grupo-rango', asistenciaController.obtenerAsistenciasPorGrupoRango);

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// Seed de asistencias de prueba
async function seedAsistencias() {
  try {
    await Asistencia.deleteMany({});

    const registros = [];
    const ubicacionBase = {
      B12: { lat: 27.484, lng: -109.933 }
    };

    const alumnosMetodologias = [
      "182233", "247045", "A001", "A002", "A003", "A004", "A005", "A006",
      "201015", "212248", "229071", "230502", "248899", "190033"
    ];

    // 03/12/2025 (Miércoles) – faltas parciales
    const fechaMiercolesHoy = new Date('2025-12-03T12:45:00Z');
    const faltasMiercoles = ['A004', '212248', '229071'];

    alumnosMetodologias.forEach(alumno => {
      if (!faltasMiercoles.includes(alumno)) {
        const estado = Math.random() > 0.8 ? 'Tarde' : 'Presente';
        registros.push({
          matricula: alumno,
          nombreAlumno: `Alumno ${alumno}`,
          materia: "Metodologías Ágiles",
          fecha: fechaMiercolesHoy,
          estado,
          ubicacion: ubicacionBase.B12
        });
      }
    });

    // 01/12/2025 (Lunes) – solo algunos presentes
    const fechaLunesSiguiente = new Date('2025-12-01T12:35:00Z');
    const presentesLunes = ['182233', 'A001', '230502'];

    alumnosMetodologias.forEach(alumno => {
      if (presentesLunes.includes(alumno)) {
        registros.push({
          matricula: alumno,
          nombreAlumno: `Alumno ${alumno}`,
          materia: "Metodologías Ágiles",
          fecha: fechaLunesSiguiente,
          estado: 'Presente',
          ubicacion: ubicacionBase.B12
        });
      }
    });

    await Asistencia.insertMany(registros);
    console.log(`Seed completo: ${registros.length} asistencias insertadas.`);
  } catch (error) {
    console.error('Error al hacer seed de asistencias:', error);
  }
}

async function iniciarServidor() {
  try {
    await connectDB();
    console.log('Conectado a MongoDB');

    await seedAsistencias();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  } catch (error) {
    console.error('Error inicializando el servidor:', error);
  }
}

iniciarServidor();
