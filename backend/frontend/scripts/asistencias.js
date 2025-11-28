// Validar sesión
const usuario = localStorage.getItem('usuario');
if (!usuario) window.location.href = 'login.html';

let todasLasAsistencias = []; // Variable global para guardar datos crudos

async function cargarAsistencias() {
    try {
        const res = await fetch('http://localhost:3000/api/asistencias');
        const data = await res.json();
        
        if(data.datos) {
            todasLasAsistencias = data.datos; // Guardamos copia original
            renderizarTabla(todasLasAsistencias); // Mostramos todo al inicio
        }

    } catch (error) {
        console.error('Error cargando asistencias:', error);
    }
}

function renderizarTabla(lista) {
    const tbody = document.querySelector('#tablaAsistencias tbody');
    tbody.innerHTML = '';

    // Contadores para métricas (SDRAI-8)
    let contPresente = 0;
    let contTarde = 0;

    if(lista.length > 0) {
        lista.forEach(asistencia => {
            const fila = document.createElement('tr');
            const fecha = new Date(asistencia.fecha).toLocaleString();
            const claseEstado = asistencia.estado === 'Tarde' ? 'estado-tarde' : 'estado-presente';

            // Sumar métricas
            if(asistencia.estado === 'Presente') contPresente++;
            if(asistencia.estado === 'Tarde') contTarde++;

            fila.innerHTML = `
                <td>${fecha}</td>
                <td>${asistencia.matricula}</td>
                <td>${asistencia.nombreAlumno || 'Desconocido'}</td>
                <td>${asistencia.materia}</td>
                <td class="${claseEstado}">${asistencia.estado}</td>
            `;
            tbody.appendChild(fila);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No se encontraron datos con esos filtros.</td></tr>';
    }

    // Actualizar tarjetas (SDRAI-8)
    document.getElementById('totalReg').innerText = lista.length;
    document.getElementById('totalPresente').innerText = contPresente;
    document.getElementById('totalTarde').innerText = contTarde;
}

// Función de filtrado (SDRAI-8)
function aplicarFiltros() {
    const matricula = document.getElementById('filtroMatricula').value.toLowerCase();
    const materia = document.getElementById('filtroMateria').value.toLowerCase();
    const estado = document.getElementById('filtroEstado').value;

    const filtrados = todasLasAsistencias.filter(item => {
        const matchMatricula = item.matricula.toLowerCase().includes(matricula);
        const matchMateria = item.materia ? item.materia.toLowerCase().includes(materia) : false;
        const matchEstado = estado === "" || item.estado === estado;

        return matchMatricula && matchMateria && matchEstado;
    });

    renderizarTabla(filtrados);
}

// Función PDF (SDRAI-5)
function descargarPDF() {
    const elemento = document.getElementById('reporteImprimible');
    const titulo = document.getElementById('tituloReporte');
    
    // Mostrar título temporalmente para el PDF
    titulo.style.display = 'block';

    const opciones = {
        margin: 10,
        filename: 'reporte_asistencias_itson.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opciones).from(elemento).save().then(() => {
        // Ocultar título de nuevo
        titulo.style.display = 'none';
    });
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// Iniciar
cargarAsistencias();