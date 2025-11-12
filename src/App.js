// src/App.js
// Componente principal de la aplicación que maneja las rutas.

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Corregido: Si AuthContext.js está en la raíz de src/, la importación es directa
import { useAuth } from './AuthContext.js'; 
import './App.css';
import './login.css'; 


// 1. Importamos los componentes de la interfaz
// Corregido: La ruta a components/ requiere la notación ./components/archivo
import Login from './components/login.js'; 
import Solicitudes from './components/solicitudes.js'; 
import SolicitudForm from './components/SolicitudForm.js'; 
import Cotizacion from './components/Cotizacion.js'; 

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
    return (
        <div className="App">
            <Routes>
                
                {/* Ruta pública: Login */}
                <Route path="/login" element={<Login />} />

                {/* Ruta pública: Solicitar */}
                <Route path="/solicitar" element={<SolicitudForm />} />
                
                {/* RUTA PRINCIPAL ADMINISTRADOR: Ahora apunta directamente a Solicitudes */}
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
                
                {/* Redirección: Si alguien va a la raíz o al antiguo dashboard, va a Solicitudes */}
                <Route path="/" element={<Navigate to="/solicitudes" replace />} />
                <Route path="/dashboard" element={<Navigate to="/solicitudes" replace />} />
                
            </Routes>
        </div>
    );
}

export default App;