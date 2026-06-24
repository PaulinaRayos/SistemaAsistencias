# SDRAI - ITSON Attendance Tracking System 

An automated and secure attendance registration ecosystem engineered for ITSON (Instituto Tecnológico de Sonora). Built with an asynchronous, decoupled architecture using Node.js, Express, and MongoDB, this system maps institutional workflows under an efficient Model-View-Controller (MVC) architectural design pattern.

This iteration represents full feature delivery executed under the Scrum Agile Methodology Framework, delivering functional production slices over iterative Sprints.

## System Architecture & Backend Topography

The platform decouples operational domains into clear structural layers:

* **`models/` (Data Schema Layer):** Manages persistent data representations for domain entities (Asistencia.js, Aula.js, Usuario.js) via Mongoose / MongoDB validation schemas.
* **`controllers/` (Business Logic Orchestration):** Processes core HTTP requests, orchestrates data flow, and executes attendance criteria through functional modules (asistenciaController.js, aulaController.js, usuarioController.js).
* **`routes/` (REST API Routing Endpoints):** Exposes decoupled endpoint patterns mapping structural resources cleanly (asistenciaRoutes.js, aulaRoutes.js, authRoutes.js).
* **`mocks/` (Infrastructure Simulation Layer):** Simulates institutional external authentications and active scheduling limits (sistemaAuthMock.js, sistemaHorariosMock.js) to guarantee validation integrity.
* **`frontend/` (Presentation Views):** Lightweight client layer driving dynamic DOM manipulations and fetch calls via native asynchronous JavaScript modules (asistencias.js, login.js).

## Tech Stack & Implementation Matrix

* **Runtime Environment:** Node.js
* **Backend Framework:** Express.js (REST API Pattern)
* **Database Solution:** MongoDB (Persistent non-relational storage)
* **Environment Configuration:** Secure variables managed through .env wrappers
* **Testing Methodologies:** Automated Postman test suites and mock data orchestration layers

## Operational Endpoints & Testing Credentials

The system includes functional authentication views to manage different user roles:

### Available Target Viewports
* **Authentication Portal:** http://localhost:3000/pages/login.html

### Mock Test Environments
* **Student Access Profile (Alumno):**
    * **ID / User Identifier:** A012345678
    * **Credential Password:** Alumno123
* **Faculty Access Profile (Maestro):**
    * **ID / User Identifier:** M012345678
    * **Credential Password:** Maestro123

## Installation & Deployment Guide

1. Clone this repository to your local directory.
2. Open your terminal at the root path and execute package installation:
   npm install
3. Navigate into the backend/ directory and spin up the developmental pipeline:
   npm run dev
4. Configure local .env database strings to enable active persistent synchronization.
