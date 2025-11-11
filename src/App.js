// src/App.js (Versión Modificada)

// ... Tus importaciones existentes ...
import Header from './components/Header'; // <-- Importamos el nuevo Header
// ...

// ... Definición de PrivateRoute (sin cambios) ...

function App() {
    // Para decidir si mostrar el Header, necesitamos saber si el usuario está logueado
    const { currentUser, loading } = useAuth(); // <--- Usamos el hook de autenticación

    if (loading) {
        return <p className="loading-message">Cargando la aplicación...</p>;
    }

    // El Header SÓLO se mostrará si hay un usuario autenticado (currentUser es true)
    const shouldShowHeader = currentUser; 
    
    return (
        <div className="App">
            {/* Muestra el Header SÓLO si el usuario está autenticado */}
            {shouldShowHeader && <Header />} 
            
            {/* Las rutas se renderizan debajo del Header (si se muestra) */}
            <Routes>
                
                {/* Rutas Públicas (no tienen Header) */}
                <Route path="/login" element={<Login />} />
                <Route path="/solicitar" element={<SolicitudForm />} />
                
                {/* Rutas Privadas (comparten el Header renderizado arriba) */}
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
                
                {/* Redirección */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
            </Routes>
        </div>
    );
}

export default App;