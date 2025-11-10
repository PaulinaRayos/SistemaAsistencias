async function obtenerUbicacion() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject('Geolocalización no soportada');
    navigator.geolocation.getCurrentPosition(pos => {
      resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, err => reject(err));
  });
}

document.getElementById('btnRegistrar').addEventListener('click', async () => {
  const matricula = document.getElementById('matricula').value;
  const materia = document.getElementById('materia').value;
  const status = document.getElementById('status');

  try {
    const ubicacion = await obtenerUbicacion();
    const resp = await fetch('http://localhost:3000/api/asistencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricula, materia, ubicacion })
    });
    const data = await resp.json();
    status.innerText = data.mensaje || JSON.stringify(data);
  } catch (err) {
    status.innerText = 'Error: ' + (err.message || err);
  }
});