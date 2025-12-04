// Traer usuario desde localStorage
const usuario = JSON.parse(localStorage.getItem('usuario'));
const modulosClases = document.getElementById('modulosClases');
const btnCerrar = document.getElementById('cerrarSesion');

if (!usuario) {
    window.location.href = 'login.html';
}

// --- Cargar aulas desde backend (mock) ---
let aulasMock = {}; // objeto final de aulas
async function cargarAulas() {
    try {
        const resp = await fetch('http://localhost:3000/api/aulas/mock');
        if (!resp.ok) throw new Error('No se pudieron cargar las aulas');
        const aulasArray = await resp.json();
        console.log('Aulas cargadas desde mock:', aulasArray);

        // Convertir array a objeto para acceso rápido por clave
        aulasMock = {};
        aulasArray.forEach(a => {
            aulasMock[a.aula] = { lat: a.lat, lng: a.lng, radio: a.radio };
        });
        console.log('Aulas transformadas en objeto:', aulasMock);
    } catch (err) {
        console.error('Error al cargar aulas:', err);
    }
}

// Variables
let materiasAlumno = [];

// Función para cargar materias desde el backend
async function cargarMaterias() {
    try {
        const resp = await fetch(`http://localhost:3000/api/horarios/${usuario.matricula}`);
        if (!resp.ok) throw new Error('No se pudieron cargar las materias');
        materiasAlumno = await resp.json();
        mostrarModulos(); // Mostrar módulos después de cargar
    } catch (err) {
        console.error(err);
        modulosClases.innerHTML = '<p style="color:red;">Error al cargar las materias.</p>';
    }
}

// Función para obtener ubicación
async function obtenerUbicacion() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject("Geolocalización no soportada");
        navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            err => reject(err)
        );
    });
}

// Calcular distancia en metros
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    if (lat1 === lat2 && lon1 === lon2) return 0;
    const R = 6371000;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Verificar horario
function estaEnHorario(horario) {
    const ahora = new Date();
    const [hIni, mIni] = horario.horaInicio.split(':').map(Number);
    const [hFin, mFin] = horario.horaFin.split(':').map(Number);

    const inicio = new Date(); inicio.setHours(hIni, mIni, 0);
    const fin = new Date(); fin.setHours(hFin, mFin, 0);

    return ahora >= inicio && ahora <= fin;
}

// Mostrar módulos
function mostrarModulos() {
    modulosClases.innerHTML = '';
    materiasAlumno.forEach(clase => {
        const div = document.createElement('div');
        div.className = 'moduloClase';
        div.innerHTML = `
      <h3>${clase.materia}</h3>
      <p>Horario: ${clase.horaInicio} - ${clase.horaFin}</p>
      <button class="btnRegistrar">Registrar Asistencia</button>
      <p class="status"></p>
    `;
        modulosClases.appendChild(div);
    });
}

// Registrar asistencia
modulosClases.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('btnRegistrar')) return;

    const claseNombre = e.target.parentElement.querySelector('h3').innerText;
    const clase = materiasAlumno.find(c => c.materia === claseNombre);
    const statusP = e.target.parentElement.querySelector('.status');

    if (!estaEnHorario(clase)) {
        statusP.style.color = 'red';
        statusP.innerText = "❌ No estás dentro del horario de la clase";
        return;
    }

    try {
        console.log('Clase a registrar:', clase.materia, clase.aula);
        console.log('Aulas disponibles:', Object.keys(aulasMock));
        const aula = aulasMock[clase.aula]; // clave = nombre del aula
        if (!aula) {
            statusP.style.color = 'red';
            statusP.innerText = '❌ Aula no encontrada';
            return;
        }

        const ubicacion = await obtenerUbicacion();
        const distancia = getDistanceFromLatLonInMeters(ubicacion.lat, ubicacion.lng, aula.lat, aula.lng);

        const margen = 3;
        if (distancia > aula.radio + margen) {
            statusP.style.color = 'red';
            statusP.innerText = `❌ No estás dentro del aula permitida (${Math.round(distancia)}m)`;
            console.log('Ubicación actual del alumno:', ubicacion);
            return;
        }

        // Registrar asistencia
        const resp = await fetch('http://localhost:3000/api/asistencias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                matricula: usuario.matricula,
                nombreAlumno: usuario.nombre,
                materia: claseNombre,
                fecha: new Date(),
                estado: 'Presente',
                ubicacion
            })
        });
        const data = await resp.json();

        if (!resp.ok) {
            statusP.style.color = 'red';
            statusP.innerText = `❌ Error: ${data.mensaje || 'Desconocido'}`;
            return;
        }

        statusP.style.color = 'green';
        statusP.innerText = `✔ Asistencia registrada con éxito`;

    } catch (err) {
        statusP.style.color = 'red';
        statusP.innerText = '❌ Error al obtener ubicación o registrar asistencia';
        console.error(err);
    }
});

// Cerrar sesión
btnCerrar.addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
});

// Inicializar: primero cargar aulas, luego materias
(async () => {
    await cargarAulas();
    cargarMaterias();
})();
