/* Estilos existentes (si tienes alguno) */
.loading-message {
  text-align: center;
  margin-top: 50px;
  font-size: 1.2rem;
}

/* --- ✅ NUEVOS ESTILOS PARA EL LOGIN --- */

.login-page-wrapper {
  overflow: hidden; /* Evita barras de scroll innecesarias */
  background-color: #f8f9fa; /* Color de fondo para el lado del formulario */
}

/* Columna Izquierda (Branding) */
.login-branding-side {
  /* Un gradiente azul oscuro */
  background: linear-gradient(135deg, #0d6efd 30%, #0a58ca 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 2rem;
}

.login-logo {
  max-width: 150px;
  height: auto;
  border-radius: 50%; /* Asume que el logo es circular o cuadrado */
  background-color: white;
  padding: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Columna Derecha (Formulario) */
.login-form-side {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 450px; /* Ancho máximo del formulario */
  border-radius: 1rem; /* Bordes redondeados */
}

/* Ajustes de Bootstrap */
.input-group .form-control {
  border-left: 0;
}
.input-group .input-group-text {
  background-color: white;
  border-right: 0;
}