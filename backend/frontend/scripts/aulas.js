// Verificar sesión
if (!localStorage.getItem('usuario')) {
    window.location.href = 'login.html';
}

const form = document.getElementById('formAula');
const tabla = document.querySelector('#tablaAulas tbody');
const mensaje = document.getElementById('mensaje');

// Cargar aulas al iniciar
async function cargarAulas() {
    try {
        const res = await fetch('http://localhost:3000/api/aulas');
        const aulas = await res.json();
        
        tabla.innerHTML = '';
        aulas.forEach(aula => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${aula.nombre}</b></td>
                <td>${aula.edificio || '-'}</td>
                <td>${aula.lat}, ${aula.lng}</td>
                <td>
                    <button class="btn-delete" onclick="eliminarAula('${aula._id}')">Eliminar</button>
                </td>
            `;
            tabla.appendChild(tr);
        });
    } catch (error) {
        console.error('Error cargando aulas:', error);
    }
}

// Guardar nueva aula
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const aulaData = {
        nombre: document.getElementById('nombre').value,
        edificio: document.getElementById('edificio').value,
        lat: parseFloat(document.getElementById('lat').value),
        lng: parseFloat(document.getElementById('lng').value),
        radio: parseFloat(document.getElementById('radio').value)
    };

    try {
        const res = await fetch('http://localhost:3000/api/aulas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aulaData)
        });

        if (res.ok) {
            mensaje.style.color = 'green';
            mensaje.innerText = 'Aula guardada correctamente.';
            form.reset();
            cargarAulas(); // Recargar tabla
        } else {
            const err = await res.json();
            mensaje.style.color = 'red';
            mensaje.innerText = 'Error: ' + err.mensaje;
        }
    } catch (error) {
        mensaje.innerText = 'Error de conexión.';
    }
});

// Eliminar aula
window.eliminarAula = async (id) => {
    if(!confirm('¿Seguro que deseas eliminar este aula?')) return;

    try {
        await fetch(`http://localhost:3000/api/aulas/${id}`, { method: 'DELETE' });
        cargarAulas();
    } catch (error) {
        alert('Error al eliminar');
    }
};

function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// Iniciar
cargarAulas();