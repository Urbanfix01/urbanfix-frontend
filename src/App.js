// src/App.js
// Componente principal de la aplicación que maneja las rutas.

import React from 'react';
// IMPORTACIONES DE REACT ROUTER DOM 
import { Routes, Route, Navigate } from 'react-router-dom';

// Importación del hook de autenticación
import { useAuth } from './AuthContext'; 

// Importación del componente de Encabezado centralizado
import AdminHeader from './components/Header'; 

import './App.css';
import './login.css'; // <-- 1. Se cargan las variables de color
import './dashboard.css'; // <-- 2. Se cargan los estilos del dashboard (que usan las variables)


// 1. Importamos los componentes de la interfaz
import Login from './components/login'; 
import Dashboard from './components/Dashboard'; 
import Solicitudes from './components/solicitudes'; 
import SolicitudForm from './components/SolicitudForm'; 
import Cotizacion from './components/Cotizacion'; 

// 2. Definición del componente PrivateRoute (Guardia de Ruta)
const PrivateRoute = ({ children }) => {
    // Obtenemos el estado de autenticación
    const { currentUser, loading } = useAuth();
    
    // Muestra un estado de carga mientras Firebase verifica el usuario
    if (loading) {
        return <p className="loading-message">Cargando...</p>;
    }

    // Si el usuario existe, muestra el componente hijo
    // Si no está logueado, redirige a /login
    return currentUser ? children : <Navigate to="/login" replace />;
};

function App() {
    // Lógica para mostrar/ocultar el Header
    const { currentUser } = useAuth(); 
    
    return (
        <div className="App">
            {/* Si el usuario está autenticado, mostramos el encabezado centralizado */}
            {currentUser && <AdminHeader />} 
            
            <Routes>
                
                {/* Ruta pública: Login */}
                <Route path="/login" element={<Login />} />

                {/* Ruta pública: Solicitar */}
                <Route path="/solicitar" element={<SolicitudForm />} />
                
                {/* Rutas Privadas */}
                <Route 
                    path="/dashboard" 
                    element={<PrivateRoute><Dashboard /></PrivateRoute>} 
                />
                <Route
                    path="/solicitudes"
                    element={<PrivateRoute><Solicitudes /></PrivateRoute>}
                />

                <Route
                    path="/cotizar/:id"
                    element={<PrivateRoute><Cotizacion /></PrivateRoute>}
                />
                
                {/* Redirección: Si alguien va a la raíz, lo enviamos al dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
            </Routes>
        </div>
    );
}

export default App;