// Traer usuario y clase seleccionada desde localStorage
const usuario = JSON.parse(localStorage.getItem('usuario'));
const claseSeleccionada = localStorage.getItem('claseSeleccionada');

const matriculaInput = document.getElementById('matricula');
const materiaInput = document.getElementById('materia');
const btnRegistrar = document.getElementById('btnRegistrar');
const status = document.getElementById('status');
const mensajeClase = document.getElementById('mensajeClase');
const claseText = document.getElementById('claseSeleccionadaText');

// Verificar que haya usuario logueado
if (!usuario) {
    window.location.href = 'login.html';
}

// Verificar que haya clase seleccionada
if (!claseSeleccionada) {
    mensajeClase.style.color = 'red';
    mensajeClase.innerText = "No se ha seleccionado ninguna clase. Redirigiendo...";
    setTimeout(() => {
        window.location.href = 'seleccionClase.html';
    }, 1500);
} else {
    // Llenar campos con info del usuario y la clase
    matriculaInput.value = usuario.matricula;
    materiaInput.value = claseSeleccionada;
    claseText.innerText = claseSeleccionada;
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

// Función para calcular distancia en metros entre dos coordenadas
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    function deg2rad(deg) { return deg * (Math.PI / 180); }
    const R = 6371000; // metros
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(deg2rad(lat1))*Math.cos(deg2rad(lat2)) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Evento de registro
btnRegistrar.addEventListener('click', async () => {
    status.innerText = "";
    try {
        const ubicacion = await obtenerUbicacion();

        // MOCK de aula, reemplazar con API real si hay
        const aulaMock = { lat: 27.48, lng: -109.98, radio: 50 }; 
        const distancia = getDistanceFromLatLonInMeters(
            ubicacion.lat, ubicacion.lng,
            aulaMock.lat, aulaMock.lng
        );

        if (distancia > aulaMock.radio) {
            status.style.color = 'red';
            status.innerText = "❌ No estás dentro del aula permitida para registrar asistencia";
            return;
        }

        // Llamada a la API para registrar asistencia
        const resp = await fetch('http://localhost:3000/api/asistencias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                matricula: usuario.matricula,
                clase: claseSeleccionada,
                ubicacion
            })
        });

        let data;
        try { data = await resp.json(); } 
        catch { data = { mensaje: "Error inesperado del servidor" }; }

        if (!resp.ok) {
            status.style.color = 'red';
            status.innerText = "❌ Error: " + (data.mensaje || "Error desconocido");
            return;
        }

        status.style.color = 'green';
        status.innerText = "✔ " + data.mensaje;

    } catch (err) {
        status.style.color = 'red';
        status.innerText = '❌ Error: ' + (err.message || err);
    }
});
