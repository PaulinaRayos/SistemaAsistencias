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
    // BORRA ASISTENCIAS VIEJAS PARA PRUEBA
    await Asistencia.deleteMany({});
    const count = await Asistencia.countDocuments();
    if (count > 0) {
      console.log('Ya hay asistencias en la base de datos, no se insertan nuevas.');
      return;
    }

    const registros = [];
    const ubicacionBase = {
      B12: { lat: 27.484, lng: -109.933 }
    };

    // ALUMNOS DEL GRUPO 'Metodologías Ágiles' (M001)
    const alumnosMetodologias = [
      "182233", "247045", "A001", "A002", "A003", "A004", "A005", "A006",
      "201015", "212248", "229071", "230502", "248899", "190033"
    ];

    // -----------------------------------------------------------------------
    // PRUEBA 1: Miércoles 3 de Diciembre (HOY - Faltas Parciales)
    // Faltarán: A004, 212248, 229071
    // -----------------------------------------------------------------------
    const fechaMiercolesHoy = new Date('2025-12-03T12:45:00Z');
    const faltasMiercoles = ['A004', '212248', '229071'];

    alumnosMetodologias.forEach(alumno => {
      if (!faltasMiercoles.includes(alumno)) {
        // Inserta presente o tarde
        const estado = Math.random() > 0.8 ? 'Tarde' : 'Presente';
        registros.push({
          matricula: alumno,
          nombreAlumno: `Alumno ${alumno}`,
          materia: "Metodologías Ágiles",
          fecha: fechaMiercolesHoy,
          estado: estado,
          ubicacion: ubicacionBase.B12
        });
      }
      // Los que faltan (A004, 212248, 229071) serán Falta Automática
    });


    // -----------------------------------------------------------------------
    // PRUEBA 2: Lunes 1 de Diciembre (LUNES  - Faltas Críticas)
    // Faltarán: 182233, A001, 230502 (Solo 3 alumnos registran, el resto Falta)
    // -----------------------------------------------------------------------
    const fechaLunesSiguiente = new Date('2025-12-01T12:35:00Z');
    const presentesLunes = ['182233', 'A001', '230502'];

    alumnosMetodologias.forEach(alumno => {
      if (presentesLunes.includes(alumno)) {
        // Inserta presente
        registros.push({
          matricula: alumno,
          nombreAlumno: `Alumno ${alumno}`,
          materia: "Metodologías Ágiles",
          fecha: fechaLunesSiguiente,
          estado: 'Presente',
          ubicacion: ubicacionBase.B12
        });
      }
      // El resto (11 alumnos) serán Falta Automática
    });


    await Asistencia.insertMany(registros);
    console.log(`Seed completo: ${registros.length} asistencias insertadas. Pruebas listas para 03/12, 08/12 y 10/12.`);
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
