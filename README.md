SDRAI - Sistema de Registro de Asistencias ITSON

Proyecto desarrollado en Node.js + Express + MongoDB, correspondiente al Sprint 1 del sistema SDRAI (Sistema de Registro de Asistencias ITSON).

Este módulo incluye:

-API para registrar asistencias.
-Validaciones básicas mediante mocks de autenticación y horarios.
-Conexión a MongoDB
-Pruebas funcionales con Postman.


Antes de ejecutar el proyecto asegúrate de tener instalado:

-Node.js
-npm
-MongoDB (local o Atlas)
-Postman

Instalación y ejecución


Abre Git Bash Here o una terminal dentro de la carpeta del proyecto.

Ejecuta:
npm install
npm run dev

Abre Postman y prueba las tres rutas:

GET http://localhost:3000/

POST http://localhost:3000/api/asistencias

GET http://localhost:3000/api/asistencias

Si ves el mensaje "Asistencia registrada correctamente", significa que tu API está funcionando correctamente.

Probar:

Ruta principal (GET)
Probar conexión del servidor
GET http://localhost:3000/

Respuesta esperada:
"API Sistema de Asistencias ITSON"

Registrar asistencia (POST)
URL:
POST http://localhost:3000/api/asistencias

Body (JSON):
{
"matricula": "182233",
"nombreAlumno": "Paulina Rodríguez",
"materia": "Metodologías Ágiles",
"ubicacion": { "lat": 27.492, "lng": -109.948 },
"estado": "Presente"
}

Respuesta esperada:
{ "mensaje": "Asistencia registrada correctamente" }

Consultar asistencias (GET)
URL:
GET http://localhost:3000/api/asistencias

Respuesta esperada:
{
"mensaje": "Ruta de asistencias funcionando correctamente",
"total": 1,
"datos": [
{
"matricula": "182233",
"nombreAlumno": "Paulina Rodríguez",
"materia": "Metodologías Ágiles",
"fecha": "2025-11-10T07:06:14.576Z",
"estado": "Presente"
}
]
}