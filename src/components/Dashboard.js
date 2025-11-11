// src/components/Dashboard.js

// 🌟 Importaciones añadidas: useState, useEffect, axios
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 🌟 CORRECCIÓN DE RUTA: Volvemos al estándar sin .js
import { useAuth } from '../AuthContext'; 
import { auth } from '../firebase'; 
import { signOut } from 'firebase/auth';
// 🌟 'useLocation' añadido para detectar navegación
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
// 🌟 Spinner, Navbar, Nav añadidos
import { Container, Row, Col, Card, Button, Spinner, Navbar, Nav } from 'react-bootstrap'; 

// 🌟 CAMBIO 1: URL de API actualizada
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com' // <-- ¡Tu URL pública!
    : 'http://localhost:3000';

// 🌟 NUEVO COMPONENTE: Navbar del Administrador (CON LOGO Y TEXTO RESTAURADO)
const DashboardNavbar = ({ userEmail, onLogout }) => {
    return (
        <Navbar expand="lg" className="dashboard-navbar" data-bs-theme="dark">
            <Container fluid className="px-4">
                {/* 🎯 CORRECCIÓN CLAVE: Envolvemos la imagen y el texto en un div para alinear */}
                <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
                    <img 
                        src="/logo.png" // Ruta directa a la carpeta public
                        alt="Urbanfix Logo" 
                        // Reducimos el tamaño un poco más y quitamos el margin-right si usamos una clase
                        style={{ height: '30px', marginRight: '8px' }} 
                    />
                    {/* Restauramos el texto de Admin, asegurando que esté al lado del logo */}
                    <span className="fw-bold text-light">UrbanFix Admin</span> 
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto d-flex align-items-center">
                        <Nav.Item className="text-light me-3">
                            <small>Conectado como:</small> <strong>{userEmail}</strong>
                        </Nav.Item>
                        <Button 
                            variant="outline-light" 
                            onClick={onLogout}
                            size="sm"
                            className="logout-button-uf"
                        >
                            Cerrar Sesión
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};


const Dashboard = () => {
    const { currentUser } = useAuth(); 
// ... (Resto del componente Dashboard sin cambios)
    const navigate = useNavigate(); 
    const location = useLocation();

    const [summary, setSummary] = useState({ total: 0, pendientes: 0, finalizadas: 0 });
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login'); 
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // Hook para cargar datos del Dashboard
    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true); 
            try {
                const response = await axios.get(`${API_BASE_URL}/api/dashboard-summary`);
                setSummary(response.data);
            } catch (err) {
                console.error("Error al cargar el resumen del dashboard:", err);
                setSummary({ total: '!', pendientes: '!', finalizadas: '!' }); 
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [location]); 

    // Función auxiliar para mostrar el spinner o el número
    const renderStat = (value) => {
        return loading ? (
            <Spinner animation="border" size="sm" />
        ) : (
            value
        );
    };

    return (
        // 🌟 Usamos React.Fragment (o <>) para no añadir un div innecesario
        <>
            {/* 1. RENDERIZAMOS LA NUEVA NAVBAR */}
            <DashboardNavbar 
                userEmail={currentUser ? currentUser.email : 'Usuario'}
                onLogout={handleLogout}
            />

            {/* 2. CONTENIDO PRINCIPAL DEL DASHBOARD */}
            <div className="dashboard-content">
                <Container className="py-5">
                    
                    {/* Título de la sección */}
                    <Row className="mb-4">
                        <Col>
                            <h1 className="dashboard-title">Resumen de Solicitudes</h1>
                            <p className="text-muted">
                                Un vistazo rápido a los trabajos pendientes y finalizados.
                            </p>
                        </Col>
                    </Row>
                    
                    {/* Sección de Estadísticas (AHORA CON ESTILO) */}
                    <Row>
                        {/* Tarjeta 1: Solicitudes Pendientes (NARANJA) */}
                        <Col md={4} className="mb-4">
                            {/* 🌟 Clases de estilo personalizadas aplicadas */}
                            <Card className="shadow-sm stat-card pending">
                                <Card.Body>
                                    <h2 className="stat-card-number">{renderStat(summary.pendientes)}</h2>
                                    <p className="stat-card-title">PENDIENTES</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        {/* Tarjeta 2: Solicitudes Finalizadas (VERDE) */}
                        <Col md={4} className="mb-4">
                            <Card className="shadow-sm stat-card completed">
                                <Card.Body>
                                    <h2 className="stat-card-number">{renderStat(summary.finalizadas)}</h2>
                                    <p className="stat-card-title">FINALIZADAS</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Tarjeta 3: Solicitudes Totales (GRIS OSCURO) */}
                        <Col md={4} className="mb-4">
                            <Card className="shadow-sm stat-card total">
                                <Card.Body>
                                    <h2 className="stat-card-number">{renderStat(summary.total)}</h2>
                                    {/* 🌟 CORRECCIÓN DE SINTAXIS: </O> cambiado a </p> */}
                                    <p className="stat-card-title">TOTALES CREADAS</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <hr className="my-4" />
                    
                    {/* Botón para Navegar a la Vista de Solicitudes */}
                    <Row>
                        <Col md={6} className="mx-auto">
                            <div className="d-grid gap-2">
                                <Link to="/solicitudes">
                                    {/* 3. APLICAMOS EL ESTILO DE BOTÓN NARANJA */}
                                    <Button variant="primary" size="lg" className="w-100 login-button-uf">
                                        Administrar Solicitudes
                                    </Button>
                                </Link>
                            </div>
                        </Col>
                    </Row>
                    
                </Container>
            </div>
        </>
    );
};

export default Dashboard;