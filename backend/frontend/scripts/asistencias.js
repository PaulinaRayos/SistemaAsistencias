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
    if (todasLasAsistencias.length === 0) {
        alert("Primero debe aplicar los filtros de Materia y Rango para generar el reporte.");
        return;
    }

    // Obtener información del reporte para el título
    const materia = document.getElementById('filtroMateria').value;
    const inicio = document.getElementById('filtroFechaInicio').value;
    const fin = document.getElementById('filtroFechaFin').value;


    let calcPresente = 0;
    let calcTarde = 0;
    let calcFalta = 0;

    // Aplicamos los filtros secundarios (matrícula y estado)
    const matriculaFiltro = document.getElementById('filtroMatricula').value.toLowerCase();
    const estadoFiltro = document.getElementById('filtroEstado').value;

    const datosFiltradosParaPDF = todasLasAsistencias.filter(item => {
        const matriculaItem = (item.matricula || '').toLowerCase();
        const matchMatricula = matriculaItem.includes(matriculaFiltro);
        const matchEstado = estadoFiltro === '' || item.estado === estadoFiltro;

        // Clasificamos el estado para el reporte final de métricas
        if (matchMatricula && matchEstado) {
            if (item.estado === 'Presente') calcPresente++;
            else if (item.estado === 'Tarde') calcTarde++;
            else if (item.estado === 'Falta' || item.estado === 'Ausente') calcFalta++;
        }
        return matchMatricula && matchEstado;
    });

    const totalReg = datosFiltradosParaPDF.length;

   
    // Preparar los datos y la cabecera
    const columns = ["Fecha", "Matrícula", "Nombre", "Materia", "Estado"];

    const rows = todasLasAsistencias.map(item => [
        new Date(item.fecha).toLocaleString(),
        item.matricula,
        item.nombreAlumno || 'Desconocido',
        item.materia,
        item.estado
    ]);

    // Crear instancia de jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait', 'mm', 'a4');

    // const doc = new window.jspdf.jsPDF('portrait', 'mm', 'a4');


    // Definir estilos para el encabezado
    const primaryColor = '#0057a8'; // Azul ITSON
    const title = `Reporte de Asistencias - ${materia}`;
    const subtitle = `Rango: ${inicio} a ${fin}`;

    let yPos = 20; // Posición inicial

    // Agregar contenido (Título y Subtítulo)
    doc.setFontSize(14);
    doc.text(title, 14, yPos); // Posición 14mm desde el borde, 20mm desde arriba
    yPos += 6;
    doc.setFontSize(10);
    doc.text(subtitle, 14, yPos);
    yPos += 4; // Posición de inicio de tabla (30mm)

    // Generar la tabla usando autoTable
    doc.autoTable({
        head: [columns],
        body: rows,
        startY: yPos, // Inicia la tabla debajo del subtítulo
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: {
            fillColor: primaryColor, // Color del encabezado de la tabla
            textColor: 255, // Blanco
            fontStyle: 'bold'
        },

        columnStyles: {
            // Asegurar que la columna de estado sea estrecha si es necesario
            4: { cellWidth: 20 }
        },
    });


    // AGREGAR TOTALES USANDO LA POSICIÓN FINAL DE LA TABLA

    // Accedemos a la posición Y final del último elemento dibujado por autoTable
    const finalY = doc.lastAutoTable.finalY;

    // Si la tabla no existe o está vacía, usamos 35mm como fallback.
    const startMetricsY = (finalY || yPos) + 10;

    // Manejo de salto de página si los totales caen muy abajo
    if (startMetricsY > 270) {
        doc.addPage();
        startMetricsY = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTALES DEL REPORTE:`, 14, startMetricsY);

    doc.setFont('helvetica', 'normal');
    doc.text(`Total registros: ${totalReg}`, 14, startMetricsY + 6);
    doc.text(`Presentes: ${calcPresente}`, 14, startMetricsY + 12);
    doc.text(`Tarde: ${calcTarde}`, 14, startMetricsY + 18);
    doc.text(`Faltas: ${calcFalta}`, 14, startMetricsY + 24);


    // 5. Guardar el archivo
    doc.save(`reporte_asistencias_${materia}_${inicio}_a_${fin}.pdf`);
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// Iniciar
cargarAsistencias();
