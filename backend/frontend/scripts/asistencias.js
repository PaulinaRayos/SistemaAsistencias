// Validar sesión
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario || (usuario.rol !== 'Maestro' && usuario.rol !== 'Profesor')) {
    window.location.href = 'login.html';
}

let todasLasAsistencias = [];

// Cargar materias del maestro
function cargarMateriasMaestro(materias) {
    const select = document.getElementById('filtroMateria');
    select.innerHTML = '<option value="">Seleccione una Materia</option>';

    materias.forEach(mat => {
        const option = document.createElement('option');
        option.value = mat;
        option.textContent = mat;
        select.appendChild(option);
    });
}

// Renderizar tabla y métricas
function renderizarTabla(lista) {
    const tbody = document.querySelector('#tablaAsistencias tbody');
    tbody.innerHTML = '';

    let contPresente = 0;
    let contTarde = 0;
    let contFalta = 0;

    if (lista.length > 0) {
        lista.forEach(asistencia => {
            const fila = document.createElement('tr');
            const fecha = new Date(asistencia.fecha).toLocaleString();
            let claseEstado = '';

            if (asistencia.estado === 'Presente') {
                contPresente++;
                claseEstado = 'estado-presente';
            } else if (asistencia.estado === 'Tarde') {
                contTarde++;
                claseEstado = 'estado-tarde';
            } else if (asistencia.estado === 'Falta' || asistencia.estado === 'Ausente') {
                contFalta++;
                claseEstado = 'estado-falta';
            }

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
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Seleccione una materia y un rango de fechas para generar el reporte.</td></tr>';
    }

    document.getElementById('totalReg').innerText = lista.length;
    document.getElementById('totalPresente').innerText = contPresente;
    document.getElementById('totalTarde').innerText = contTarde;
    const totalFaltaElement = document.getElementById('totalFalta');
    if (totalFaltaElement) totalFaltaElement.innerText = contFalta;
}

// Filtros
async function aplicarFiltros() {
    const matriculaFiltro = document.getElementById('filtroMatricula').value.toLowerCase();
    const materiaFiltro = document.getElementById('filtroMateria').value;
    const estadoFiltro = document.getElementById('filtroEstado').value;
    const fechaInicioStr = document.getElementById('filtroFechaInicio').value;
    const fechaFinStr = document.getElementById('filtroFechaFin').value;

    if (!materiaFiltro || !fechaInicioStr || !fechaFinStr) {
        renderizarTabla([]);
        return;
    }

    const fechaInicio = new Date(fechaInicioStr + 'T00:00:00');
    const fechaFin = new Date(fechaFinStr + 'T23:59:59');

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        alert('Alguna de las fechas es inválida');
        renderizarTabla([]);
        return;
    }

    if (fechaFin < fechaInicio) {
        alert('La fecha final no puede ser menor que la fecha inicial');
        renderizarTabla([]);
        return;
    }

    try {
        const params = new URLSearchParams({
            rfcMaestro: usuario.matricula,
            materia: materiaFiltro,
            fechaInicio: fechaInicioStr,
            fechaFin: fechaFinStr
        });

        const url = `http://localhost:3000/api/asistencias/reporte-grupo-rango?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.datos) {
            console.error('Error al obtener reporte:', data.mensaje);
            todasLasAsistencias = [];
            renderizarTabla([]);
            return;
        }

        todasLasAsistencias = data.datos;

        const filtrados = todasLasAsistencias.filter(item => {
            const matriculaItem = (item.matricula || '').toLowerCase();
            const matchMatricula = matriculaItem.includes(matriculaFiltro);
            const matchEstado = estadoFiltro === '' || item.estado === estadoFiltro;
            return matchMatricula && matchEstado;
        });

        renderizarTabla(filtrados);

    } catch (error) {
        console.error('Error al cargar datos del reporte:', error);
        renderizarTabla([]);
    }
}

// Cargar materias del maestro al iniciar
async function cargarAsistencias() {
    try {
        const resMaterias = await fetch(`http://localhost:3000/api/materias-maestro?matricula=${usuario.matricula}`);
        const dataMaterias = await resMaterias.json();

        if (!dataMaterias.materias) {
            console.error('No se encontraron materias para el maestro.', dataMaterias.mensaje);
            return;
        }

        const materiasMaestro = dataMaterias.materias;
        cargarMateriasMaestro(materiasMaestro);

        // Tabla vacía hasta que seleccione filtros
        renderizarTabla([]);

    } catch (error) {
        console.error('Error cargando inicial:', error);
    }
}

// PDF
function descargarPDF() {
    const elemento = document.getElementById('reporteImprimible');
    const titulo = document.getElementById('tituloReporte');
    titulo.style.display = 'block';

    const opciones = {
        margin: 10,
        filename: 'reporte_asistencias_itson.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            // importante: limitar el ancho al del contenedor
            // si tu contenedor es de ~1000px, úsalo aquí
            width: elemento.offsetWidth
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf()
        .set(opciones)
        .from(elemento)
        .save()
        .then(() => {
            titulo.style.display = 'none';
        });
}


// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// Iniciar
cargarAsistencias();
