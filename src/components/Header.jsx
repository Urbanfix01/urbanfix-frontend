import React from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para navegación interna

function Header() {
    return (
        // Usamos la clase 'main-header' que definiste en App.css
        <header className="main-header">
            {/* El logo como Enlace al Dashboard */}
            {/* Usamos <Link to="..."> para evitar que la página se recargue */}
            <Link to="/dashboard" className="logo-link">
                <img 
                    src="/logo.png" // Ruta correcta desde la carpeta public
                    alt="Urbanfix Logo" 
                    className="app-logo" // Usamos la clase 'app-logo' que definiste para el tamaño
                />
            </Link>
            
            {/* Aquí irían tus enlaces de navegación, botones, etc. */}
            <nav className="main-nav">
                {/* Ejemplo de enlaces usando Link y la clase main-nav que definiste */}
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/solicitudes">Solicitudes</Link>
                {/* Si tienes un componente de Logout, lo puedes poner aquí */}
            </nav>
        </header>
    );
}

export default Header;