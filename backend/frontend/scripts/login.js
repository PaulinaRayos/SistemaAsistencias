document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const matricula = document.getElementById('matricula').value;
    const contraseña = document.getElementById('password').value;
    const mensaje = document.getElementById('mensaje');

    try {
        const res = await fetch('http://localhost:3000/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula, contraseña })
        });

        const data = await res.json();

        if (res.ok) {
            mensaje.style.color = 'green';
            mensaje.innerText = 'Login exitoso, redirigiendo...';

            // Guardar sesión (simple)
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // Redirigir
            setTimeout(() => {
                const usuario = data.usuario;

                // Convertir rol a minúsculas
                const rol = usuario?.rol?.toLowerCase();

                if (!rol) {
                    window.location.href = 'login.html';
                    return;
                }

                if (rol === 'alumno') {
                    window.location.href = 'seleccionClase.html';
                } else if (rol === 'maestro') {
                    window.location.href = 'asistencias.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);

        } else {
            mensaje.style.color = 'red';
            mensaje.innerText = data.mensaje || "Credenciales incorrectas";
        }

    } catch (error) {
        console.error(error);
        mensaje.innerText = "Error de conexión con el servidor";
    }
});
