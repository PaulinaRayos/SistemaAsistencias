document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = document.getElementById('email').value;
    const contraseña = document.getElementById('password').value;
    const mensaje = document.getElementById('mensaje');

    try {
        const res = await fetch('http://localhost:3000/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contraseña })
        });

        const data = await res.json();

        if (res.ok) {
            mensaje.style.color = 'green';
            mensaje.innerText = 'Login exitoso, redirigiendo...';
            
            // Guardar sesión (simple)
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // Redirigir a la lista de asistencias
            setTimeout(() => {
                window.location.href = 'asistencias.html';
            }, 1000);
        } else {
            mensaje.style.color = 'red';
            mensaje.innerText = data.mensaje;
        }

    } catch (error) {
        console.error(error);
        mensaje.innerText = "Error de conexión con el servidor";
    }
});