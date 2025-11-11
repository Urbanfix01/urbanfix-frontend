// src/App.js
// Componente principal de la aplicación que maneja las rutas.

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Volvemos a la importación estándar sin extensión
import { useAuth } from './AuthContext'; 
import './App.css';
import './login.css'; 


// 1. Importamos los componentes de la interfaz
// Volvemos a la importación estándar sin extensión y usando PascalCase
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

    // Si el usuario existe, muestra el componente hijo (Dashboard)
    // Si no está logueado, redirige a /login
    return currentUser ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <div className="App">
            <Routes>
                
                {/* Ruta pública: Login */}
                <Route path="/login" element={<Login />} />

                {/* Ruta pública: Solicitar */}
                <Route path="/solicitar" element={<SolicitudForm />} />
                
                {/* Ruta Privada: Dashboard (Protegida) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />
                
                {/* Ruta Privada: Solicitudes (Protegida) */}
                <Route
                    path="/solicitudes"
                    element={
                        <PrivateRoute>
                            <Solicitudes />
                        </PrivateRoute>
                    }
                />

                {/* Ruta Privada: Cotización (Protegida) */}
                <Route
                    path="/cotizar/:id"
                    element={
                        <PrivateRoute>
                            <Cotizacion />
                        </PrivateRoute>
                    }
                />
                
                {/* Redirección: Si alguien va a la raíz, lo enviamos al dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
            </Routes>
        </div>
    );
}

export default App;