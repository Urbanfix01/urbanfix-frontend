// src/components/solicitudes.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ✅ IMPORTACIONES AÑADIDAS: Modal y ListGroup
import { Container, Table, Button, Form, Alert, Spinner, Stack, Row, Col, InputGroup, Modal, ListGroup } from 'react-bootstrap'; 
// ✅ ICONOS AÑADIDOS: EyeFill
import { PencilFill, SaveFill, XCircleFill, ArrowClockwise, Search, EyeFill } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com' 
    : 'http://localhost:3000'; 

const getStatusVariant = (estado) => {
// ... (código existente sin cambios) ...
};

const Solicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
// ... (código existente sin cambios) ...
    const [editingRowId, setEditingRowId] = useState(null);
    const [originalRowData, setOriginalRowData] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('TODOS'); 

    // ✅ NUEVO: Estados para el Modal de Detalles
    const [showModal, setShowModal] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);

    const estadosValidos = [
// ... (código existente sin cambios) ...
    ];

    const navigate = useNavigate();

    // Lógica para obtener los datos al cargar el componente
    const fetchSolicitudes = async () => { 
// ... (código existente sin cambios) ...
    };
    
    useEffect(() => {
        fetchSolicitudes();
    }, []); 

    // LÓGICA DE ACTUALIZACIÓN (SOLO VISUAL)
    const handleEstadoChange = (solicitudId, newStatus) => {
// ... (código existente sin cambios) ...
    };
    
    const handleMontoChange = (solicitudId, newMonto) => {
// ... (código existente sin cambios) ...
    };


    // Se activa al hacer clic en el lápiz ✏️
    const handleEditClick = (solicitud) => {
// ... (código existente sin cambios) ...
    };

    // Se activa al hacer clic en la X ❌
    const handleCancelClick = (solicitudId) => {
// ... (código existente sin cambios) ...
    };

    // LÓGICA DE GUARDADO (LLAMADA A LA API)
    const handleSaveClick = async (solicitud) => {
// ... (código existente sin cambios) ...
    };

    // LÓGICA DE NAVEGACIÓN A COTIZACIÓN
    const handleCotizarClick = (solicitud) => {
// ... (código existente sin cambios) ...
    };

    // ✅ NUEVO: Funciones para manejar el Modal de Detalles
    const handleShowModal = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSolicitud(null);
    };


    if (loading && solicitudes.length === 0) { // Muestra spinner solo en la carga inicial
// ... (código existente sin cambios) ...
    }
    
    if (error) {
// ... (código existente sin cambios) ...
    }

    // Lógica de filtrado
    const solicitudesFiltradas = solicitudes.filter(solicitud => {
// ... (código existente sin cambios) ...
    });


    return (
        <Container className="mt-5">
            {/* Elemento 1: Título y Botones */}
            <div className="d-flex justify-content-between align-items-center mb-4">
// ... (código existente sin cambios) ...
            </div>

            {/* Fila de Buscador y Filtros */}
            <Row className="mb-4 p-3 bg-light rounded shadow-sm">
// ... (código existente sin cambios) ...
            </Row>


            {/* Elemento 2: La Tabla */}
            <Table striped bordered hover responsive className="shadow-sm">
                <thead>
                    <tr className="table-dark">
{/* ... (código existente sin cambios) ... */}
                    </tr>
                </thead>
                <tbody>
                    {/* MODIFICADO: Mapea sobre 'solicitudesFiltradas' */}
                    {solicitudesFiltradas.length > 0 ? (
                        solicitudesFiltradas.map((solicitud, index) => {
// ... (código existente sin cambios) ...
                                    
                                    {/* COLUMNA ACCIÓN (Botones) */}
                                    <td>
                                        {isEditing ? (
                                            // ---------------- MODO EDICIÓN ----------------
                                            <Stack direction="horizontal" gap={2}>
{/* ... (código existente sin cambios) ... */}
                                            </Stack>
                                        ) : (
                                            // ---------------- MODO LECTURA ----------------
                                            <Stack direction="horizontal" gap={2}>
                                                {/* ✅ NUEVO: Botón de Ver Detalles (Ojo) */}
                                                <Button 
                                                    variant="outline-info" 
                                                    size="sm" 
                                                    onClick={() => handleShowModal(solicitud)}
                                                    title="Ver Detalles Completos"
                                                >
                                                    <EyeFill />
                                                </Button>

                                                <Button 
                                                    variant="outline-primary" 
{/* ... (código existente sin cambios) ... */}
                                                </Button>
                                                
                                                <Button 
                                                    variant="outline-success" 
{/* ... (código existente sin cambios) ... */}
                                                >
                                                    $
                                                </Button>
                                            </Stack>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
// ... (código existente sin cambios) ...
                    )}
                </tbody>
            </Table>
            
            {/* Elemento 3: Alerta de Cero Solicitudes */}
{/* ... (código existente sin cambios) ... */}

            {/* ✅ NUEVO: Modal de Ver Detalles */}
            {selectedSolicitud && (
                <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Detalles de Solicitud: {selectedSolicitud.nombre_apellido}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>ID:</strong> {selectedSolicitud.id}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Cliente:</strong> {selectedSolicitud.nombre_apellido}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Teléfono:</strong> 
                                {/* Enlace de WhatsApp (limpia caracteres no numéricos) */}
                                <a href={`https://wa.me/${selectedSolicitud.telefono.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer">
                                    {selectedSolicitud.telefono}
                                </a>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Dirección:</strong> {selectedSolicitud.direccion}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Categoría:</strong> {selectedSolicitud.categoria_trabajo}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Estado:</strong> <span className={`fw-bold text-${getStatusVariant(selectedSolicitud.estado)}`}>{selectedSolicitud.estado}</span>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Urgencia:</strong> {selectedSolicitud.urgencia || 'No especificada'}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Ventanas Horarias:</strong> {selectedSolicitud.ventanas_horarias || 'No especificadas'}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong className="d-block">Descripción del Problema:</strong>
                                {/* 'pre-wrap' respeta los saltos de línea y espacios */}
                                <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px', marginTop: '5px' }}>
                                    {selectedSolicitud.descripcion_problema || 'No hay descripción.'}
                                </p>
                            </ListGroup.Item>
                        </ListGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

        </Container>
    );
};

export default Solicitudes;