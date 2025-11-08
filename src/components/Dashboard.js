// src/components/Dashboard.js

// 🌟 Importaciones añadidas: useState, useEffect, axios
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext'; 
import { auth } from '../firebase';        
import { signOut } from 'firebase/auth';
// 🌟 'useLocation' añadido para detectar navegación
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
// 🌟 Spinner añadido para el estado de carga
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap'; 

// 🌟 CAMBIO 1: URL de API actualizada
// Usa la URL de Render en producción, o localhost en desarrollo
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com' // <-- ¡Tu URL pública!
    : 'http://localhost:3000';

const Dashboard = () => {
    const { currentUser } = useAuth(); 
    const navigate = useNavigate(); 
    // 🌟 Hook 'useLocation'
    const location = useLocation();

    // 🌟 Nuevo estado para las estadísticas
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

    // 🌟 Nuevo Hook para cargar datos del Dashboard
    useEffect(() => {
        const fetchSummary = async () => {
            // 🌟 Mostramos el spinner en cada recarga
            setLoading(true); 
            try {
                const response = await axios.get(`${API_BASE_URL}/api/dashboard-summary`);
                setSummary(response.data);
            } catch (err) {
                console.error("Error al cargar el resumen del dashboard:", err);
                // Si falla, muestra 'Error'
                setSummary({ total: '!', pendientes: '!', finalizadas: '!' }); 
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    // 🌟 CORRECCIÓN: El 'useEffect' ahora depende de 'location'.
    // Se ejecutará cada vez que navegues A ESTA PÁGINA.
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
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={10} lg={9}>
                    <Card className="shadow-lg p-4">
                        <Card.Body>
                            {/* Encabezado del Dashboard */}
                            <h1 className="text-center mb-4 text-primary">👋 Panel de Control UrbanFix 2026</h1>
                            <hr />

                            {/* Información del Usuario */}
                            <p className="lead">
                                ¡Bienvenido, **{currentUser ? currentUser.email : 'Usuario de UrbanFix'}**!
                            </p>
                            
                            <div className="mb-4">
                                <p><strong>Rol:</strong> Administrador (Asumiendo un rol base)</p>
                            </div>

                            {/* Botón para Cerrar Sesión */}
                            <div className="mb-5 d-flex justify-content-end">
                                <Button variant="outline-danger" onClick={handleLogout}>
                                    Cerrar Sesión
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Sección de Estadísticas (AHORA REAL) */}
            <Row className="justify-content-center mt-4">
                <Col md={10} lg={9}>
                    <Card className="shadow-sm">
                        <Card.Body>
                        {/* 🌟 Emoji '📈' eliminado */}
                        <h3 className="mb-3">Resumen de Solicitudes</h3>
                        <Row className="text-center">
                            {/* Tarjeta 1: Solicitudes Totales */}
                            <Col md={4} className="mb-3">
                                <Card className="shadow-sm border-primary">
                                    <Card.Body>
                                        <h2 className="text-primary">{renderStat(summary.total)}</h2>
                                        {/* 🌟 Tipografía afinada */}
                                        <p className="text-muted mb-0 small text-uppercase fw-bold">TOTALES CREADAS</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            {/* Tarjeta 2: Solicitudes Pendientes */}
                            <Col md={4} className="mb-3">
                                <Card className="shadow-sm border-warning">
                                    <Card.Body>
                                        <h2 className="text-warning">{renderStat(summary.pendientes)}</h2>
                                        {/* 🌟 Tipografía afinada */}
                                        <p className="text-muted mb-0 small text-uppercase fw-bold">PENDIENTES</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            {/* Tarjeta 3: Solicitudes Finalizadas */}
                            <Col md={4} className="mb-3">
                                <Card className="shadow-sm border-success">
                                    <Card.Body>
                                        <h2 className="text-success">{renderStat(summary.finalizadas)}</h2>
                                        {/* 🌟 Tipografía afinada */}
                                        <p className="text-muted mb-0 small text-uppercase fw-bold">FINALIZADAS</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <hr />
                        
                        {/* Botón para Navegar a la Vista de Solicitudes */}
                        <div className="d-grid gap-2">
                            <Link to="/solicitudes">
                                <Button variant="primary" size="lg" className="w-100">
                                    Administrar Solicitudes
                                </Button>
                            </Link>
                        </div>

                        </Card.Body>
                    </Card> {/* Card cerrada correctamente */}
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;