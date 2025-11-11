// src/components/Dashboard.js

// 🌟 Importaciones añadidas: useState, useEffect, axios
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 🌟 CORRECCIÓN DE RUTA: Volvemos al estándar sin .js
import { useAuth } from '../AuthContext'; 
// ELIMINADO: import { auth } from '../firebase'; 
// ELIMINADO: import { signOut } from 'firebase/auth';
// 🌟 'useLocation' añadido para detectar navegación
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
// 🌟 Spinner, Navbar, Nav añadidos
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap'; 
// ELIMINADO: import { Navbar, Nav } from 'react-bootstrap'; 

// 🌟 CAMBIO 1: URL de API actualizada
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com' // <-- ¡Tu URL pública!
    : 'http://localhost:3000';

// 🛑 COMPONENTE DashboardNavbar ELIMINADO O COMENTADO (La lógica se movió a Header.jsx)

const Dashboard = () => {
    // ELIMINADO: const { currentUser } = useAuth(); 
    // ELIMINADO: const navigate = useNavigate(); 
    const location = useLocation(); // location sigue siendo útil para el useEffect

    const [summary, setSummary] = useState({ total: 0, pendientes: 0, finalizadas: 0 });
    const [loading, setLoading] = useState(true);

    // 🛑 handleLogout ELIMINADO (La lógica se movió a Header.jsx)
    // const handleLogout = async () => { ... }


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
            {/* 🛑 LA LLAMADA AL NAVBAR SE ELIMINA DE AQUÍ */}

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