// src/components/solicitudes.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ✅ Modal, ListGroup, y más iconos añadidos
import { Container, Table, Button, Form, Alert, Spinner, Stack, Row, Col, Modal, ListGroup } from 'react-bootstrap'; 
// ✅ Iconos para Refrescar, Editar, Cotizar, Ver y Eliminar
import { ArrowClockwise, PencilFill, CurrencyDollar, EyeFill, TrashFill } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com' 
    : 'http://localhost:3000'; 

// Función auxiliar para asignar color (variant) de Bootstrap según el estado
const getStatusVariant = (estado) => {
// ... (código existente sin cambios) ...
    const estadoNorm = estado?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || 'PENDIENTE';

    switch (estadoNorm) {
        case 'ACEPTADO':
        case 'FINALIZADO':
        case 'CERRADO':
            return 'success'; // Verdes
        
        case 'PENDIENTE':
        case 'EN CURSO':
        case 'NUEVO': 
            return 'warning'; // Amarillos
        
        case 'CANCELADO':
            return 'danger'; // Rojo
        
        case 'VISITA COTIZADA':
        case 'VISITA AGENDADA':
            return 'info'; // Azules

        case 'PRESUPUESTADO':
        case 'COTIZADO': 
        case 'COTIZADO (PV)':
            return 'primary'; // Azules oscuros
        default:
            return 'secondary';
    }
};

const Solicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    
    const [editingRowId, setEditingRowId] = useState(null);
    const [originalRowData, setOriginalRowData] = useState(null);

    // ✅ Estados para el Buscador y Filtro
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // ✅ Estados para el Modal de Detalles
    const [showModal, setShowModal] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);

    // ✅ Estados para el Modal de Eliminar
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [solicitudToDelete, setSolicitudToDelete] = useState(null);

    const estadosValidos = [
        'NUEVO', 
        'COTIZADO', 
        'ACEPTADO', 
        'EN CURSO', 
        'FINALIZADO', 
        'CERRADO', 
        'CANCELADO', 
        'VISITA COTIZADA', 
        'VISITA AGENDADA', 
        'COTIZADO (PV)',
        'PENDIENTE' 
    ];

    const navigate = useNavigate();

    // Lógica para obtener los datos (ahora reutilizable)
    const fetchSolicitudes = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(`${API_BASE_URL}/api/solicitudes-sheet`);
            
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            setSolicitudes(response.data.solicitudes || []); 

        } catch (err) {
            console.error("Error al obtener solicitudes:", err);
            // ✅ Mensaje de error genérico mejorado
            setError('Fallo al cargar datos del Backend. Por favor, asegúrate que el servicio de Render esté activo y revisa la consola para más detalles.');
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos al iniciar
    useEffect(() => {
        fetchSolicitudes();
    }, []); 

    // --- Lógica de Edición en Tabla ---
    const handleEstadoChange = (solicitudId, newStatus) => {
// ... (código existente sin cambios) ...
    };
    const handleMontoChange = (solicitudId, newMonto) => {
// ... (código existente sin cambios) ...
    };
    const handleEditClick = (solicitud) => {
// ... (código existente sin cambios) ...
    };
    const handleCancelClick = (solicitudId) => {
// ... (código existente sin cambios) ...
    };

    // --- Lógica de Guardado (API) ---
    const handleSaveClick = async (solicitud) => {
// ... (código existente sin cambios) ...
        const { sheetRowIndex, estado, monto_cotizado } = solicitud;

        try {
            await axios.patch(`${API_BASE_URL}/api/update-solicitud`, {
                sheetRowIndex: sheetRowIndex,
                newStatus: estado, 
                newMonto: monto_cotizado || '0',
                // ✅ IMPORTANTE: El backend que usa este frontend DEBE soportar los 3 campos
                // Si el backend es el antiguo (que solo acepta 2), esto fallará.
                // Asumimos que el backend es el que SÍ soporta 'newPresupuesto'
                newPresupuesto: solicitud.presupuesto || '' 
            });
            
            setEditingRowId(null); 
            setOriginalRowData(null);
            
            // Opcional: Refrescar los datos después de guardar
            // fetchSolicitudes(); 
            
        } catch (error) {
// ... (código existente sin cambios) ...
            setError("Error al guardar el cambio en Google Sheets. La página se recargará para re-sincronizar.");
            setTimeout(() => window.location.reload(), 2000); 
        }
    };

    // --- Lógica de Navegación ---
    const handleCotizarClick = (solicitud) => {
        // Navega a la ruta de cotización y pasa el objeto 'solicitud'
        navigate(`/cotizar/${solicitud.id}`, { state: { solicitud } });
    };

    // --- Lógica del Modal de Detalles ---
    const handleShowModal = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSolicitud(null);
    };

    // ✅ --- Lógica del Modal de Eliminar ---
    const handleShowDeleteModal = (solicitud) => {
        setSolicitudToDelete(solicitud);
        setShowDeleteModal(true);
    };
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setSolicitudToDelete(null);
    };
    const handleConfirmDelete = async () => {
        if (!solicitudToDelete) return;

        setLoading(true); // Usamos el spinner global
        setError(null);

        try {
            // Llama a la nueva API de DELETE en el backend
            await axios.delete(`${API_BASE_URL}/api/eliminar-solicitud`, {
                // Axios 'delete' envía el body de forma diferente
                data: { sheetRowIndex: solicitudToDelete.sheetRowIndex }
            });

            // Si tiene éxito, quita la solicitud de la lista local (UI)
            setSolicitudes(prevSolicitudes => 
                prevSolicitudes.filter(s => s.id !== solicitudToDelete.id)
            );
            handleCloseDeleteModal(); // Cierra el modal

        } catch (err) {
            console.error("Error al eliminar la solicitud:", err);
            setError("Error al eliminar la solicitud. Revisa los logs de Render.");
        } finally {
            setLoading(false);
        }
    };

    // --- Renderizado ---
    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    // --- Lógica de Filtro ---
    const filteredSolicitudes = solicitudes.filter(sol => {
        const matchesSearch = sol.nombre_apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            sol.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            sol.telefono?.includes(searchTerm);
        
        const matchesStatus = statusFilter ? sol.estado === statusFilter : true;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <Container fluid className="mt-5 mb-5"> {/* 'fluid' para más espacio */}
            
            {/* --- Título y Botones --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 text-primary">
                    Gestión de Solicitudes <span className="text-muted">({filteredSolicitudes.length} / {solicitudes.length})</span>
                </h3>
                <Stack direction="horizontal" gap={2}>
                    <Button 
                        variant="outline-primary" 
                        onClick={fetchSolicitudes} 
                        disabled={loading}
                        title="Refrescar Datos"
                    >
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : <ArrowClockwise size={20} />}
                    </Button>
                    <Link to="/dashboard">
                        <Button variant="outline-secondary">
                            Volver al Panel
                        </Button>
                    </Link>
                </Stack>
            </div>

            {/* --- Controles de Búsqueda y Filtro --- */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row>
                        <Col md={8}>
                            <Form.Group controlId="searchTerm">
                                <Form.Label>Buscar Cliente (Nombre, Teléfono o Dirección)</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="statusFilter">
                                <Form.Label>Filtrar por Estado</Form.Label>
                                <Form.Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Todos los Estados</option>
                                    {estadosValidos.map(estado => (
                                        <option key={estado} value={estado}>{estado}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* --- Estado de Carga de la Tabla --- */}
            {loading && solicitudes.length === 0 && (
                <div className="text-center mt-5">
                    <Spinner animation="border" role="status" variant="primary" className="me-2" />
                    <span className="text-primary fs-5">Cargando solicitudes...</span>
                </div>
            )}

            {/* --- Tabla de Solicitudes --- */}
            {!loading && filteredSolicitudes.length === 0 && (
                 <Alert variant="info" className="text-center">
                    {solicitudes.length === 0 
                        ? "No hay solicitudes para mostrar." 
                        : "No se encontraron solicitudes que coincidan con la búsqueda."}
                </Alert>
            )}

            {filteredSolicitudes.length > 0 && (
                <Table striped bordered hover responsive className="shadow-sm align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th>Categoría</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSolicitudes.map((solicitud, index) => {
                            const isEditing = editingRowId === solicitud.id;
                            
                            return (
                                <tr key={solicitud.id}>
                                    <td>{index + 1}</td> 
                                    <td>{solicitud.marca_temporal || 'N/A'}</td> 
                                    <td>{solicitud.nombre_apellido || 'N/A'}</td>
                                    <td>{solicitud.telefono || 'N/A'}</td>
                                    <td>{solicitud.direccion || 'N/A'}</td>
                                    <td>{solicitud.categoria_trabajo || 'N/A'}</td>
                                    
                                    {/* COLUMNA MONTO (Editable) */}
                                    <td>
                                        {isEditing ? (
                                            <Form.Control
                                                type="text" 
                                                size="sm"
                                                value={solicitud.monto_cotizado || ''}
                                                onChange={(e) => handleMontoChange(solicitud.id, e.target.value)}
                                                autoComplete="off"
                                            />
                                        ) : (
                                            solicitud.monto_cotizado ? `$${solicitud.monto_cotizado}` : 'N/A'
                                        )}
                                    </td>

                                    {/* COLUMNA ESTADO (Editable) */}
                                    <td>
                                        {isEditing ? (
                                            <Form.Select
                                                size="sm"
                                                value={solicitud.estado || 'PENDIENTE'}
                                                onChange={(e) => handleEstadoChange(solicitud.id, e.target.value)} 
                                                autoComplete="off"
                                            >
                                                {estadosValidos.map(estado => (
                                                    <option key={estado} value={estado}>{estado}</option>
                                                ))}
                                            </Form.Select>
                                        ) : (
                                            <Button 
                                                variant={getStatusVariant(solicitud.estado)} 
                                                size="sm"
                                                className="fw-bold"
                                                style={{ minWidth: '110px' }}
                                                onClick={() => handleEditClick(solicitud)}
                                                title="Clic para editar"
                                            >
                                                {solicitud.estado || 'PENDIENTE'}
                                            </Button>
                                        )}
                                    </td>
                                    
                                    {/* COLUMNA ACCIÓN (Botones) */}
                                    <td>
                                        {isEditing ? (
                                            // --- MODO EDICIÓN ---
                                            <Stack direction="horizontal" gap={2}>
                                                <Button 
                                                    variant="success" 
                                                    size="sm" 
                                                    onClick={() => handleSaveClick(solicitud)}
                                                    title="Guardar"
                                                    disabled={loading} // Deshabilitar si se está guardando
                                                >
                                                    <SaveFill />
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm" 
                                                    onClick={() => handleCancelClick(solicitud.id)}
                                                    title="Cancelar"
                                                >
                                                    <XCircleFill />
                                                </Button>
                                            </Stack>
                                        ) : (
                                            // --- MODO LECTURA ---
                                            <Stack direction="horizontal" gap={2}>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    onClick={() => handleEditClick(solicitud)}
                                                    title="Editar Estado y Monto"
                                                >
                                                    <PencilFill />
                                                </Button>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => handleCotizarClick(solicitud)}
                                                    title="Cotizar / Ver Detalle PDF"
                                                >
                                                    <CurrencyDollar />
                                                </Button>
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => handleShowModal(solicitud)}
                                                    title="Ver Detalles Completos"
                                                >
                                                    <EyeFill />
                                                </Button>
                                                {/* ✅ BOTÓN ELIMINAR AÑADIDO */}
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleShowDeleteModal(solicitud)}
                                                    title="Eliminar Solicitud"
                                                >
                                                    <TrashFill />
                                                </Button>
                                            </Stack>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}

            {/* --- MODAL DE DETALLES --- */}
            {selectedSolicitud && (
                <Modal show={showModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Detalles de Solicitud</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>Cliente:</strong> {selectedSolicitud.nombre_apellido}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Teléfono:</strong> {selectedSolicitud.telefono}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Dirección:</strong> {selectedSolicitud.direccion}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Categoría:</strong> {selectedSolicitud.categoria_trabajo}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Descripción del Problema:</strong>
                                <p className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{selectedSolicitud.descripcion_problema || 'N/A'}</p>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Urgencia:</strong> {selectedSolicitud.urgencia || 'N/A'}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Ventanas Horarias:</strong> {selectedSolicitud.ventanas_horarias || 'N/A'}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Notas:</strong>
                                <p className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{selectedSolicitud.notas || 'N/A'}</p>
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

            {/* ✅ --- MODAL DE CONFIRMACIÓN DE ELIMINAR --- */}
            {solicitudToDelete && (
                <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="text-danger">Confirmar Eliminación</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>¿Estás seguro de que deseas eliminar permanentemente esta solicitud?</p>
                        <Alert variant="warning">
                            <strong>Cliente:</strong> {solicitudToDelete.nombre_apellido}<br/>
                            <strong>Dirección:</strong> {solicitudToDelete.direccion}<br/>
                            <strong>Fila de Sheet:</strong> {solicitudToDelete.sheetRowIndex}<br/>
                            <strong className="mt-2 d-block">Esta acción no se puede deshacer.</strong>
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={handleConfirmDelete} disabled={loading}>
                            {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Sí, Eliminar'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

        </Container>
    );
};

export default Solicitudes;