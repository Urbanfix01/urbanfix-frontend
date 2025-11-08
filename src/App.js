// src/App.js
// Componente principal de la aplicación que maneja las rutas.

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; 
import './App.css';

// 1. Importamos los componentes de la interfaz
import Login from './components/login'; 
import Dashboard from './components/Dashboard';
import Solicitudes from './components/solicitudes'; // 🌟 ¡NUEVA IMPORTACIÓN!

// 2. Definición del componente PrivateRoute (Guardia de Ruta)
// Debe estar definido ANTES de que la función App lo use.
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
                
                {/* Ruta pública: Login (ruta en minúsculas) */}
                <Route path="/login" element={<Login />} />
                
                {/* Ruta Privada: Dashboard (Protegida) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />

                {/* 🌟 ¡AQUÍ ESTÁ LA RUTA QUE FALTABA! 🌟 */}
                <Route
                    path="/solicitudes"
                    element={
                        <PrivateRoute>
                            <Solicitudes />
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