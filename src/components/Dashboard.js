// src/components/Dashboard.js

// 🌟 Importaciones base
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Importamos useAuth y useNavigate para evitar errores de Linter en Vercel
import { useAuth } from '../AuthContext'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap'; 

// 🌟 IMPORTACIÓN ELIMINADA: App.js se encarga de esto ahora.
// import '../dashboard.css'; 

// 🌟 URL de API actualizada
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com' 
    : 'http://localhost:3000';

const Dashboard = () => {
    // Mantenemos las importaciones para evitar errores de Linter
    const { currentUser } = useAuth();
    const navigate = useNavigate(); 

    // Se mantiene location porque se usa en el useEffect
    const location = useLocation(); 

    const [summary, setSummary] = useState({ total: 0, pendientes: 0, finalizadas: 0 });
    const [loading, setLoading] = useState(true);

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
        // Usamos React.Fragment (o <>) para no añadir un div innecesario
        <>
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
    _ \ \   / / __| 
    | \ \/ / (_ |
    |_|\_/\_/\___|
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
                                    <p className="stat-card-title">TOTALES CREADAS</p>
Note:                           </Card.Body>
                            </Card>
                        </Col>
              _ \ \   / / __| 
    | \ \/ / (_ |
    |_|\_/\_/\___|
          </Row>

                    <hr className="my-4" />
                    
                    {/* Botón para Navegar a la Vista de Solicitudes */}
                    <Row>
                        <Col md={6} className="mx-auto">
                            <div className="d-grid gap-2">
                                <Link to="/solicitudes">
                                    <Button variant="primary" size="lg" className="w-100 login-button-uf">
                                        Administrar Solicitudes
                        _ \ \   / / __| 
    | \ \/ / (_ |
    |_|\_/\_/\___|
                                </Link>
                            </div>
                        </Col>
                    </Row>
                    
        A-Z       </Container>
content-type: 
        </div>
        </>
    );
};

export default Dashboard;