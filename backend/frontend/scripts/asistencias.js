// Validar sesión
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario || usuario.rol !== 'Maestro' && usuario.rol !== 'Profesor') {
    // Redirigir si no es maestro, o si no hay sesión
    window.location.href = 'login.html';
}

let todasLasAsistencias = []; // Guardamos los datos crudos

// ----------------------------------------------------
// CARGAR MATERIAS DEL MAESTRO (Función ÚNICA y Correcta)
// ----------------------------------------------------
function cargarMateriasMaestro(materias) {
    const select = document.getElementById('filtroMateria');
    // Usamos 'Seleccione una Materia' para que la consulta no se haga hasta que se elija una
    select.innerHTML = '<option value="">Seleccione una Materia</option>';

    materias.forEach(mat => {
        const option = document.createElement('option');
        option.value = mat;
        option.textContent = mat;
        select.appendChild(option);
    });
}

// ----------------------------------------------------
// RENDERIZAR TABLA (Completa con métricas y estado 'Falta')
// ----------------------------------------------------
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

            // Clasificar y contar los estados
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
        // Mensaje cuando no hay datos
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Seleccione una materia y una fecha para generar el reporte.</td></tr>';
    }

    // Actualizar las métricas
    document.getElementById('totalReg').innerText = lista.length;
    document.getElementById('totalPresente').innerText = contPresente;
    document.getElementById('totalTarde').innerText = contTarde;
    // Debes tener un span con id="totalFalta" en tu HTML
    const totalFaltaElement = document.getElementById('totalFalta');
    if (totalFaltaElement) {
        totalFaltaElement.innerText = contFalta;
    }
}

// ----------------------------------------------------
// FILTRO (Función central de consulta)
// ----------------------------------------------------
async function aplicarFiltros() {
    const matriculaFiltro = document.getElementById('filtroMatricula').value.toLowerCase();
    const materiaFiltro = document.getElementById('filtroMateria').value;
    const estadoFiltro = document.getElementById('filtroEstado').value;

    // Obtener la fecha
    const fechaFiltro = document.getElementById('filtroFecha').value;

    // VALIDACIÓN CLAVE: NO consultamos al BE si faltan Materia o Fecha
    if (!materiaFiltro || materiaFiltro === "" || !fechaFiltro) {
        // Si faltan filtros clave, simplemente vaciamos la tabla sin llamar al BE
        renderizarTabla([]);
        return;
    }

    try {
        // Llama a la NUEVA RUTA del backend (que calcula las faltas)
        const url = `http://localhost:3000/api/asistencias/reporte-grupo?rfcMaestro=${usuario.matricula}&materia=${materiaFiltro}&fecha=${fechaFiltro}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.datos) {
            console.error('Error al obtener reporte:', data.mensaje);
            todasLasAsistencias = [];
            renderizarTabla([]);
            return;
        }

        // 1. Guardar los datos obtenidos
        todasLasAsistencias = data.datos;

        // 2. Aplicar filtros secundarios (Matrícula y Estado)
        const filtrados = todasLasAsistencias.filter(item => {
            const matchMatricula = item.matricula.toLowerCase().includes(matriculaFiltro);
            const matchEstado = estadoFiltro === "" || item.estado === estadoFiltro;

            return matchMatricula && matchEstado;
        });

        renderizarTabla(filtrados);

    } catch (error) {
        console.error('Error al cargar datos del reporte:', error);
        renderizarTabla([]);
    }
}

// ----------------------------------------------------
// CARGAR ASISTENCIAS DESDE API (Solo carga materias)
// ----------------------------------------------------
async function cargarAsistencias() {
    try {
        // 1. Obtener materias del maestro (Usando la ruta corta y corregida)
        // Usamos la ruta que se monta directamente en /api
        const resMaterias = await fetch(`http://localhost:3000/api/materias-maestro?matricula=${usuario.matricula}`);
        const dataMaterias = await resMaterias.json();

        if (!dataMaterias.materias) {
            console.error('No se encontraron materias para el maestro.', dataMaterias.mensaje);
            return;
        }

        const materiasMaestro = dataMaterias.materias;
        cargarMateriasMaestro(materiasMaestro);

        // 2. Ejecutar filtros iniciales para mostrar la tabla vacía 
        // y que el maestro deba seleccionar la materia/fecha
        aplicarFiltros();

    } catch (error) {
        console.error('Error cargando inicial:', error);
    }
}

// ----------------------------------------------------
// PDF (Se mantiene igual)
// ----------------------------------------------------
function descargarPDF() {
    const elemento = document.getElementById('reporteImprimible');
    const titulo = document.getElementById('tituloReporte');
    titulo.style.display = 'block';

    const opciones = {
        margin: 10,
        filename: 'reporte_asistencias_itson.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opciones).from(elemento).save().then(() => {
        titulo.style.display = 'none';
    });
}

// ----------------------------------------------------
// CERRAR SESIÓN (Se mantiene igual)
// ----------------------------------------------------
function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// ----------------------------------------------------
// INICIAR
// ----------------------------------------------------
cargarAsistencias();