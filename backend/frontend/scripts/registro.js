async function obtenerUbicacion() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject("Geolocalización no soportada");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => reject(err)
    );
  });
}

document.getElementById('btnRegistrar').addEventListener('click', async () => {
  const matricula = document.getElementById('matricula').value;
  const materia = document.getElementById('materia').value;
  const status = document.getElementById('status');

  try {
   const resp = await fetch('http://localhost:3000/api/asistencias', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ matricula, materia, ubicacion })
});

let data;

// Intentar convertir a JSON aunque sea 400/500
try {
  data = await resp.json();
} catch (e) {
  console.error("No se pudo parsear JSON del backend");
  data = { mensaje: "Error inesperado del servidor" };
}

// Mostrar siempre lo que regresó el backend
console.log("RESPUESTA DEL BACKEND:", data);

if (!resp.ok) {
  status.innerText = "Error" + (data.mensaje || "Error desconocido");
  return;
}

status.innerText = "Bien" + data.mensaje;

  } catch (err) {
    status.innerText = 'Error: ' + (err.message || err);
  }
});