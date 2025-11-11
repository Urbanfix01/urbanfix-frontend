// src/components/Solicitudes.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Alert, Spinner, Stack, Row, Col, Modal, ListGroup, Card, Navbar, Nav } from 'react-bootstrap'; 
import { ArrowClockwise, PencilFill, CurrencyDollar, EyeFill, TrashFill, SaveFill, XCircleFill } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';
// 🌟 CORRECCIÓN DE RUTA: Volvemos a la ruta relativa estándar
import { useAuth } from '../AuthContext'; 
import { auth } from '../firebase'; 
import { signOut } from 'firebase/auth';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com' 
    : 'http://localhost:3000'; 

// --- Componente Navbar (Copiado de Dashboard) ---
const DashboardNavbar = ({ userEmail, onLogout }) => {
    return (
        <Navbar expand="lg" className="dashboard-navbar" data-bs-theme="dark">
            <Container fluid className="px-4">
                <Navbar.Brand href="/dashboard" className="fw-bold">
                    UrbanFix Admin
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


// --- Función Auxiliar de Estado ---
const getStatusVariant = (estado) => {
    const estadoNorm = estado?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || 'PENDIENTE';

    switch (estadoNorm) {
        case 'ACEPTADO':
        case 'FINALIZADO':
        case 'CERRADO':
            return 'success'; // Verdes
        
        // 🌟 CAMBIO DE DISEÑO: PENDIENTE ahora usa 'primary' (Naranja UrbanFix)
        case 'PENDIENTE':
        case 'EN CURSO':
        case 'NUEVO': 
            return 'primary'; // Naranja (antes 'warning')
        
        case 'CANCELADO':
            return 'danger'; // Rojo
        
        case 'VISITA COTIZADA':
        case 'VISITA AGENDADA':
            return 'info'; // Azules

        // 🌟 CAMBIO DE DISEÑO: COTIZADO usa 'secondary' (Gris)
        case 'PRESUPUESTADO':
        case 'COTIZADO': 
        case 'COTIZADO (PV)':
            return 'secondary'; // Gris (antes 'primary')
        default:
            return 'secondary';
    }
};

// --- Componente Principal Solicitudes ---
const Solicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    
    // Estados para la Navbar
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [editingRowId, setEditingRowId] = useState(null);
    const [originalRowData, setOriginalRowData] = useState(null);

    // Estados para el Buscador y Filtro
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Estados para el Modal de Detalles
    const [showModal, setShowModal] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);

    // Estados para el Modal de Eliminar
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [solicitudToDelete, setSolicitudToDelete] = useState(null);

    const estadosValidos = [
        'NUEVO', 'COTIZADO', 'ACEPTADO', 'EN CURSO', 'FINALIZADO', 
        'CERRADO', 'CANCELADO', 'VISITA COTIZADA', 'VISITA AGENDADA', 
        'COTIZADO (PV)', 'PENDIENTE' 
    ];

    // Lógica para obtener los datos
    const fetchSolicitudes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/solicitudes-sheet`);
            if (response.data.error) throw new Error(response.data.error);
            setSolicitudes(response.data.solicitudes || []); 
        } catch (err) {
            console.error("Error al obtener solicitudes:", err);
            setError('Fallo al cargar datos del Backend. Asegúrate que Render esté activo.');
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos al iniciar
    useEffect(() => {
        fetchSolicitudes();
    }, []); 

    // Handler para Logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login'); 
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // --- Lógica de Edición en Tabla ---
    const handleEstadoChange = (solicitudId, newStatus) => {
        setSolicitudes(currentSolicitudes =>
            currentSolicitudes.map(sol =>
                sol.id === solicitudId ? { ...sol, estado: newStatus } : sol
            )
        );
    };
    
    const handleMontoChange = (solicitudId, newMonto) => {
        setSolicitudes(currentSolicitudes =>
            currentSolicitudes.map(sol =>
                sol.id === solicitudId ? { ...sol, monto_cotizado: newMonto } : sol
            )
        );
    };

    const handleEditClick = (solicitud) => {
        setEditingRowId(solicitud.id);
        setOriginalRowData(solicitud); 
    };

    const handleCancelClick = (solicitudId) => {
        setSolicitudes(currentSolicitudes =>
            currentSolicitudes.map(sol =>
                sol.id === solicitudId ? originalRowData : sol
            )
        );
        setEditingRowId(null); 
        setOriginalRowData(null);
    };

    // --- Lógica de Guardado (API) ---
    const handleSaveClick = async (solicitud) => {
        const { sheetRowIndex, estado, monto_cotizado } = solicitud;
        try {
            await axios.patch(`${API_BASE_URL}/api/update-solicitud`, {
                sheetRowIndex: sheetRowIndex,
                newStatus: estado, 
                newMonto: monto_cotizado || '0',
                newPresupuesto: solicitud.presupuesto || '' 
            });
            setEditingRowId(null); 
            setOriginalRowData(null);
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            setError("Error al guardar en Google Sheets. La página se recargará.");
            setTimeout(() => window.location.reload(), 2000); 
        }
    };

    // --- Lógica de Navegación ---
    const handleCotizarClick = (solicitud) => {
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

    // --- Lógica del Modal de Eliminar ---
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
        setLoading(true); 
        setError(null);
        try {
            await axios.delete(`${API_BASE_URL}/api/eliminar-solicitud`, {
                data: { sheetRowIndex: solicitudToDelete.sheetRowIndex }
            });
            setSolicitudes(prevSolicitudes => 
                prevSolicitudes.filter(s => s.id !== solicitudToDelete.id)
            );
            handleCloseDeleteModal(); 
        } catch (err) {
            console.error("Error al eliminar la solicitud:", err);
            setError("Error al eliminar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    // --- Renderizado ---
    if (error) {
        return (
            <>
                <DashboardNavbar 
                    userEmail={currentUser ? currentUser.email : '...'}
                    onLogout={handleLogout}
                />
                <div className="dashboard-content">
                    <Container className="py-5">
                        <Alert variant="danger">{error}</Alert>
                    </Container>
                </div>
            </>
        );
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
        <>
            {/* 1. RENDERIZAMOS LA NAVBAR */}
            <DashboardNavbar 
                userEmail={currentUser ? currentUser.email : 'Usuario'}
                onLogout={handleLogout}
            />

            {/* 2. APLICAMOS EL FONDO GRIS DEL DASHBOARD */}
            <div className="dashboard-content">
                <Container className="py-5"> 
                    
                    {/* --- Título y Botones --- */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        {/* 3. APLICAMOS EL TÍTULO DEL DASHBOARD */}
                        <h3 className="dashboard-title">
                            Gestión de Solicitudes <span className="text-muted">({filteredSolicitudes.length} / {solicitudes.length})</span>
                        </h3>
                        <Stack direction="horizontal" gap={2}>
                            <Button 
                                variant="outline-primary" // Naranja outline (definido en CSS)
                                onClick={fetchSolicitudes} 
                                disabled={loading}
                                title="Refrescar Datos"
                            >
                                {loading ? <Spinner as="span" animation="border" size="sm" /> : <ArrowClockwise size={20} />}
                            </Button>
                            <Link to="/dashboard">
                                {/* 4. APLICAMOS EL BOTÓN NARANJA (ahora 'variant="primary"') */}
                                <Button variant="primary">
                                    Volver al Panel
                                </Button>
                            </Link>
                        </Stack>
                    </div>

                    {/* --- Controles de Búsqueda y Filtro --- */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Body className="p-4">
                            <Row>
                                <Col md={8}>
                                    <Form.Group controlId="searchTerm">
                                        {/* 5. APLICAMOS ESTILOS DE FORMULARIO */}
                                        <Form.Label className="form-label-custom">Buscar Cliente (Nombre, Teléfono o Dirección)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Buscar..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            size="lg" // Input grande
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="statusFilter">
                                        <Form.Label className="form-label-custom">Filtrar por Estado</Form.Label>
                                        <Form.Select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            size="lg" // Select grande
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
                        <Table striped bordered hover responsive className="shadow-sm align-middle bg-white">
                            {/* 6. APLICAMOS LA CABECERA DE TABLA GRIS */}
                            <thead className="uf-table-header">
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
                                                        // 7. APLICAMOS EL NUEVO VARIANT (primary = Naranja)
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
                                                            disabled={loading} 
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
                                                            variant="outline-primary" // Naranja outline
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
                                    <ListGroup.Item><strong>Cliente:</strong> {selectedSolicitud.nombre_apellido}</ListGroup.Item>
                                    <ListGroup.Item><strong>Teléfono:</strong> {selectedSolicitud.telefono}</ListGroup.Item>
                                    <ListGroup.Item><strong>Dirección:</strong> {selectedSolicitud.direccion}</ListGroup.Item>
                                    <ListGroup.Item><strong>Categoría:</strong> {selectedSolicitud.categoria_trabajo}</ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Descripción del Problema:</strong>
                                        <p className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{selectedSolicitud.descripcion_problema || 'N/A'}</p>
                                    </ListGroup.Item>
                                    <ListGroup.Item><strong>Urgencia:</strong> {selectedSolicitud.urgencia || 'N/A'}</ListGroup.Item>
                                    <ListGroup.Item><strong>Ventanas Horarias:</strong> {selectedSolicitud.ventanas_horarias || 'N/A'}</ListGroup.Item>
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

                    {/* --- MODAL DE CONFIRMACIÓN DE ELIMINAR --- */}
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
            </div>
        </>
    );
};

export default Solicitudes;