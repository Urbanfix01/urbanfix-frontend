// src/components/Solicitudes.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Alert, Spinner, Stack, Row, Col, Modal, ListGroup, Card, Navbar, Nav } from 'react-bootstrap'; 
import { ArrowClockwise, PencilFill, CurrencyDollar, EyeFill, TrashFill, SaveFill, XCircleFill } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';
// 🌟 CORRECCIÓN DE RUTA: Volvemos a la ruta relativa con extensión
import { useAuth } from '../AuthContext.js'; 
import { auth } from '../firebase.js'; 
import { signOut } from 'firebase/auth';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
// ... (el resto del código es idéntico al anterior) ...
// --- Componente Navbar (Copiado de Dashboard) ---
const DashboardNavbar = ({ userEmail, onLogout }) => {
// ... (código existente sin cambios) ...
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
// ... (código existente sin cambios) ...
    const estadoNorm = estado?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || 'PENDIENTE';

    switch (estadoNorm) {
        case 'ACEPTADO':
        case 'FINALIZADO':
        case 'CERRADO':
// ... (código existente sin cambios) ...
            return 'success'; // Verdes
        
        // 🌟 CAMBIO DE DISEÑO: PENDIENTE ahora usa 'primary' (Naranja UrbanFix)
        case 'PENDIENTE':
        case 'EN CURSO':
        case 'NUEVO': 
// ... (código existente sin cambios) ...
            return 'primary'; // Naranja (antes 'warning')
        
        case 'CANCELADO':
            return 'danger'; // Rojo
        
        case 'VISITA COTIZADA':
// ... (código existente sin cambios) ...
        case 'VISITA AGENDADA':
            return 'info'; // Azules

        // 🌟 CAMBIO DE DISEÑO: COTIZADO usa 'secondary' (Gris)
        case 'PRESUPUESTADO':
        case 'COTIZADO': 
// ... (código existente sin cambios) ...
        case 'COTIZADO (PV)':
            return 'secondary'; // Gris (antes 'primary')
        default:
            return 'secondary';
    }
};

// --- Componente Principal Solicitudes ---
// ... (código existente sin cambios) ...
const Solicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    
    // Estados para la Navbar
// ... (código existente sin cambios) ...
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [editingRowId, setEditingRowId] = useState(null);
    const [originalRowData, setOriginalRowData] = useState(null);

    // Estados para el Buscador y Filtro
// ... (código existente sin cambios) ...
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Estados para el Modal de Detalles
    const [showModal, setShowModal] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
// ... (código existente sin cambios) ...

    // Estados para el Modal de Eliminar
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [solicitudToDelete, setSolicitudToDelete] = useState(null);

    const estadosValidos = [
// ... (código existente sin cambios) ...
        'NUEVO', 'COTIZADO', 'ACEPTADO', 'EN CURSO', 'FINALIZADO', 
        'CERRADO', 'CANCELADO', 'VISITA COTIZADA', 'VISITA AGENDADA', 
        'COTIZADO (PV)', 'PENDIENTE' 
    ];

    // Lógica para obtener los datos
// ... (código existente sin cambios) ...
    const fetchSolicitudes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/solicitudes-sheet`);
// ... (código existente sin cambios) ...
            if (response.data.error) throw new Error(response.data.error);
            setSolicitudes(response.data.solicitudes || []); 
        } catch (err) {
            console.error("Error al obtener solicitudes:", err);
            setError('Fallo al cargar datos del Backend. Asegúrate que Render esté activo.');
// ... (código existente sin cambios) ...
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos al iniciar
    useEffect(() => {
// ... (código existente sin cambios) ...
        fetchSolicitudes();
    }, []); 

    // Handler para Logout
    const handleLogout = async () => {
        try {
// ... (código existente sin cambios) ...
            await signOut(auth);
            navigate('/login'); 
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
// ... (código existente sin cambios) ...
    };

    // --- Lógica de Edición en Tabla ---
    const handleEstadoChange = (solicitudId, newStatus) => {
        setSolicitudes(currentSolicitudes =>
            currentSolicitudes.map(sol =>
                sol.id === solicitudId ? { ...sol, estado: newStatus } : sol
// ... (código existente sin cambios) ...
            )
        );
    };
    
    const handleMontoChange = (solicitudId, newMonto) => {
        setSolicitudes(currentSolicitudes =>
// ... (código existente sin cambios) ...
            currentSolicitudes.map(sol =>
                sol.id === solicitudId ? { ...sol, monto_cotizado: newMonto } : sol
            )
        );
    };

    const handleEditClick = (solicitud) => {
// ... (código existente sin cambios) ...
        setEditingRowId(solicitud.id);
        setOriginalRowData(solicitud); 
    };

    const handleCancelClick = (solicitudId) => {
        setSolicitudes(currentSolicitudes =>
            currentSolicitudes.map(sol =>
// ... (código existente sin cambios) ...
                sol.id === solicitudId ? originalRowData : sol
            )
        );
        setEditingRowId(null); 
        setOriginalRowData(null);
    };
// ... (código existente sin cambios) ...

    // --- Lógica de Guardado (API) ---
    const handleSaveClick = async (solicitud) => {
        const { sheetRowIndex, estado, monto_cotizado } = solicitud;
        try {
            await axios.patch(`${API_BASE_URL}/api/update-solicitud`, {
// ... (código existente sin cambios) ...
                sheetRowIndex: sheetRowIndex,
                newStatus: estado, 
                newMonto: monto_cotizado || '0',
                newPresupuesto: solicitud.presupuesto || '' 
            });
// ... (código existente sin cambios) ...
            setEditingRowId(null); 
            setOriginalRowData(null);
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            setError("Error al guardar en Google Sheets. La página se recargará.");
// ... (código existente sin cambios) ...
            setTimeout(() => window.location.reload(), 2000); 
        }
    };

    // --- Lógica de Navegación ---
    const handleCotizarClick = (solicitud) => {
        navigate(`/cotizar/${solicitud.id}`, { state: { solicitud } });
// ... (código existente sin cambios) ...
    };

    // --- Lógica del Modal de Detalles ---
    const handleShowModal = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setShowModal(true);
    };
// ... (código existente sin cambios) ...
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSolicitud(null);
    };

    // --- Lógica del Modal de Eliminar ---
    const handleShowDeleteModal = (solicitud) => {
// ... (código existente sin cambios) ...
        setSolicitudToDelete(solicitud);
        setShowDeleteModal(true);
    };
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setSolicitudToDelete(null);
// ... (código existente sin cambios) ...
    };
    const handleConfirmDelete = async () => {
        if (!solicitudToDelete) return;
        setLoading(true); 
        setError(null);
        try {
// ... (código existente sin cambios) ...
            await axios.delete(`${API_BASE_URL}/api/eliminar-solicitud`, {
                data: { sheetRowIndex: solicitudToDelete.sheetRowIndex }
            });
            setSolicitudes(prevSolicitudes => 
                prevSolicitudes.filter(s => s.id !== solicitudToDelete.id)
            );
// ... (código existente sin cambios) ...
            handleCloseDeleteModal(); 
        } catch (err) {
            console.error("Error al eliminar la solicitud:", err);
            setError("Error al eliminar la solicitud.");
        } finally {
// ... (código existente sin cambios) ...
            setLoading(false);
        }
    };

    // --- Renderizado ---
    if (error) {
        return (
// ... (código existente sin cambios) ...
            <>
                <DashboardNavbar 
                    userEmail={currentUser ? currentUser.email : '...'}
                    onLogout={handleLogout}
                />
                <div className="dashboard-content">
// ... (código existente sin cambios) ...
                    <Container className="py-5">
                        <Alert variant="danger">{error}</Alert>
                    </Container>
                </div>
            </>
// ... (código existente sin cambios) ...
        );
    }

    // --- Lógica de Filtro ---
    const filteredSolicitudes = solicitudes.filter(sol => {
        const matchesSearch = sol.nombre_apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            sol.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// ... (código existente sin cambios) ...
                            sol.telefono?.includes(searchTerm);
        const matchesStatus = statusFilter ? sol.estado === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    return (
        <>
// ... (código existente sin cambios) ...
            {/* 1. RENDERIZAMOS LA NAVBAR */}
            <DashboardNavbar 
                userEmail={currentUser ? currentUser.email : 'Usuario'}
                onLogout={handleLogout}
            />

            {/* 2. APLICAMOS EL FONDO GRIS DEL DASHBOARD */}
// ... (código existente sin cambios) ...
            <div className="dashboard-content">
                <Container className="py-5"> 
                    
                    {/* --- Título y Botones --- */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        {/* 3. APLICAMOS EL TÍTULO DEL DASHBOARD */}
// ... (código existente sin cambios) ...
                        <h3 className="dashboard-title">
                            Gestión de Solicitudes <span className="text-muted">({filteredSolicitudes.length} / {solicitudes.length})</span>
                        </h3>
                        <Stack direction="horizontal" gap={2}>
                            <Button 
                                variant="outline-primary" // Naranja outline (definido en CSS)
// ... (código existente sin cambios) ...
                                onClick={fetchSolicitudes} 
                                disabled={loading}
                                title="Refrescar Datos"
                            >
                                {loading ? <Spinner as="span" animation="border" size="sm" /> : <ArrowClockwise size={20} />}
// ... (código existente sin cambios) ...
                            </Button>
                            <Link to="/dashboard">
                                {/* 4. APLICAMOS EL BOTÓN NARANJA (ahora 'variant="primary"') */}
                                <Button variant="primary">
                                    Volver al Panel
// ... (código existente sin cambios) ...
                                </Button>
                            </Link>
                        </Stack>
                    </div>

                    {/* --- Controles de Búsqueda y Filtro --- */}
                    <Card className="mb-4 shadow-sm">
// ... (código existente sin cambios) ...
                        <Card.Body className="p-4">
                            <Row>
                                <Col md={8}>
                                    <Form.Group controlId="searchTerm">
                                        {/* 5. APLICAMOS ESTILOS DE FORMULARIO */}
                                        <Form.Label className="form-label-custom">Buscar Cliente (Nombre, Teléfono o Dirección)</Form.Label>
// ... (código existente sin cambios) ...
                                        <Form.Control
                                            type="text"
                                            placeholder="Buscar..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
// ... (código existente sin cambios) ...
                                            size="lg" // Input grande
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="statusFilter">
// ... (código existente sin cambios) ...
                                        <Form.Label className="form-label-custom">Filtrar por Estado</Form.Label>
                                        <Form.Select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            size="lg" // Select grande
// ... (código existente sin cambios) ...
                                        >
                                            <option value="">Todos los Estados</option>
                                            {estadosValidos.map(estado => (
                                                <option key={estado} value={estado}>{estado}</option>
                                            ))}
// ... (código existente sin cambios) ...
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
// ... (código existente sin cambios) ...
                    </Card>

                    {/* --- Estado de Carga de la Tabla --- */}
                    {loading && solicitudes.length === 0 && (
                        <div className="text-center mt-5">
                            <Spinner animation="border" role="status" variant="primary" className="me-2" />
// ... (código existente sin cambios) ...
                            <span className="text-primary fs-5">Cargando solicitudes...</span>
                        </div>
                    )}

                    {/* --- Tabla de Solicitudes --- */}
                    {!loading && filteredSolicitudes.length === 0 && (
                         <Alert variant="info" className="text-center">
// ... (código existente sin cambios) ...
                            {solicitudes.length === 0 
                                ? "No hay solicitudes para mostrar." 
                                : "No se encontraron solicitudes que coincidan con la búsqueda."}
                        </Alert>
                    )}

                    {filteredSolicitudes.length > 0 && (
// ... (código existente sin cambios) ...
                        <Table striped bordered hover responsive className="shadow-sm align-middle bg-white">
                            {/* 6. APLICAMOS LA CABECERA DE TABLA GRIS */}
                            <thead className="uf-table-header">
                                <tr>
                                    <th>#</th>
// ... (código existente sin cambios) ...
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Teléfono</th>
                                    <th>Dirección</th>
                                    <th>Categoría</th>
// ... (código existente sin cambios) ...
                                    <th>Monto</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
// ... (código existente sin cambios) ...
                            <tbody>
                                {filteredSolicitudes.map((solicitud, index) => {
                                    const isEditing = editingRowId === solicitud.id;
                                    
                                    return (
                                        <tr key={solicitud.id}>
// ... (código existente sin cambios) ...
                                            <td>{index + 1}</td> 
                                            <td>{solicitud.marca_temporal || 'N/A'}</td> 
                                            <td>{solicitud.nombre_apellido || 'N/A'}</td>
                                            <td>{solicitud.telefono || 'N/A'}</td>
                                            <td>{solicitud.direccion || 'N/A'}</td>
// ... (código existente sin cambios) ...
                                            <td>{solicitud.categoria_trabajo || 'N/A'}</td>
                                            
                                            {/* COLUMNA MONTO (Editable) */}
                                            <td>
                                                {isEditing ? (
                                                    <Form.Control
// ... (código existente sin cambios) ...
                                                        type="text" 
                                                        size="sm"
                                                        value={solicitud.monto_cotizado || ''}
                                                        onChange={(e) => handleMontoChange(solicitud.id, e.target.value)}
                                                        autoComplete="off"
                                                    />
// ... (código existente sin cambios) ...
                                                ) : (
                                                    solicitud.monto_cotizado ? `$${solicitud.monto_cotizado}` : 'N/A'
                                                )}
                                            </td>

                                            {/* COLUMNA ESTADO (Editable) */}
// ... (código existente sin cambios) ...
                                            <td>
                                                {isEditing ? (
                                                    <Form.Select
                                                        size="sm"
                                                        value={solicitud.estado || 'PENDIENTE'}
// ... (código existente sin cambios) ...
                                                        onChange={(e) => handleEstadoChange(solicitud.id, e.target.value)} 
                                                        autoComplete="off"
                                                    >
                                                        {estadosValidos.map(estado => (
                                                            <option key={estado} value={estado}>{estado}</option>
// ... (código existente sin cambios) ...
                                                        ))}
                                                    </Form.Select>
                                                ) : (
                                                    <Button 
                                                        // 7. APLICAMOS EL NUEVO VARIANT (primary = Naranja)
// ... (código existente sin cambios) ...
                                                        variant={getStatusVariant(solicitud.estado)} 
                                                        size="sm"
                                                        className="fw-bold"
                                                        style={{ minWidth: '110px' }}
                                                        onClick={() => handleEditClick(solicitud)}
// ... (código existente sin cambios) ...
                                                        title="Clic para editar"
                                                    >
                                                        {solicitud.estado || 'PENDIENTE'}
                                                    </Button>
                                                )}
                                            </td>
// ... (código existente sin cambios) ...
                                            
                                            {/* COLUMNA ACCIÓN (Botones) */}
                                            <td>
                                                {isEditing ? (
                                                    // --- MODO EDICIÓN ---
                                                    <Stack direction="horizontal" gap={2}>
                                                        <Button 
// ... (código existente sin cambios) ...
                                                            variant="success" 
                                                            size="sm" 
                                                            onClick={() => handleSaveClick(solicitud)}
                                                            title="Guardar"
                                                            disabled={loading} 
// ... (código existente sin cambios) ...
                                                        >
                                                            <SaveFill />
                                                        </Button>
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm" 
// ... (código existente sin cambios) ...
                                                            onClick={() => handleCancelClick(solicitud.id)}
                                                            title="Cancelar"
                                                        >
                                                            <XCircleFill />
                                                        </Button>
// ... (código existente sin cambios) ...
                                                    </Stack>
                                                ) : (
                                                    // --- MODO LECTURA ---
                                                    <Stack direction="horizontal" gap={2}>
                                                        <Button 
                                                            variant="outline-primary" // Naranja outline
// ... (código existente sin cambios) ...
                                                            size="sm" 
                                                            onClick={() => handleEditClick(solicitud)}
                                                            title="Editar Estado y Monto"
                                                        >
                                                            <PencilFill />
// ... (código existente sin cambios) ...
                                                        </Button>
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            onClick={() => handleCotizarClick(solicitud)}
// ... (código existente sin cambios) ...
                                                            title="Cotizar / Ver Detalle PDF"
                                                        >
                                                            <CurrencyDollar />
                                                        </Button>
                                                        <Button
                                                            variant="outline-info"
// ... (código existente sin cambios) ...
                                                            size="sm"
                                                            onClick={() => handleShowModal(solicitud)}
                                                            title="Ver Detalles Completos"
                                                        >
                                                            <EyeFill />
// ... (código existente sin cambios) ...
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleShowDeleteModal(solicitud)}
// ... (código existente sin cambios) ...
                                                            title="Eliminar Solicitud"
                                                        >
                                                            <TrashFill />
                                                        </Button>
                                                    </Stack>
// ... (código existente sin cambios) ...
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}

                    {/* --- MODAL DE DETALLES --- */}
// ... (código existente sin cambios) ...
                    {selectedSolicitud && (
                        <Modal show={showModal} onHide={handleCloseModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Detalles de Solicitud</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
// ... (código existente sin cambios) ...
                                <ListGroup variant="flush">
                                    <ListGroup.Item><strong>Cliente:</strong> {selectedSolicitud.nombre_apellido}</ListGroup.Item>
                                    <ListGroup.Item><strong>Teléfono:</strong> {selectedSolicitud.telefono}</ListGroup.Item>
                                    <ListGroup.Item><strong>Dirección:</strong> {selectedSolicitud.direccion}</ListGroup.Item>
                                    <ListGroup.Item><strong>Categoría:</strong> {selectedSolicitud.categoria_trabajo}</ListGroup.Item>
// ... (código existente sin cambios) ...
                                    <ListGroup.Item>
                                        <strong>Descripción del Problema:</strong>
                                        <p className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{selectedSolicitud.descripcion_problema || 'N/A'}</p>
                                    </ListGroup.Item>
                                    <ListGroup.Item><strong>Urgencia:</strong> {selectedSolicitud.urgencia || 'N/A'}</ListGroup.Item>
// ... (código existente sin cambios) ...
                                    <ListGroup.Item><strong>Ventanas Horarias:</strong> {selectedSolicitud.ventanas_horarias || 'N/A'}</ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Notas:</strong>
                                        <p className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{selectedSolicitud.notas || 'N/A'}</p>
                                    </ListGroup.Item>
// ... (código existente sin cambios) ...
                                </ListGroup>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseModal}>
                                    Cerrar
                                </Button>
// ... (código existente sin cambios) ...
                            </Modal.Footer>
                        </Modal>
                    )}

                    {/* --- MODAL DE CONFIRMACIÓN DE ELIMINAR --- */}
                    {solicitudToDelete && (
                        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
// ... (código existente sin cambios) ...
                            <Modal.Header closeButton>
                                <Modal.Title className="text-danger">Confirmar Eliminación</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>¿Estás seguro de que deseas eliminar permanentemente esta solicitud?</p>
                                <Alert variant="warning">
// ... (código existente sin cambios) ...
                                    <strong>Cliente:</strong> {solicitudToDelete.nombre_apellido}<br/>
                                    <strong>Dirección:</strong> {solicitudToDelete.direccion}<br/>
                                    <strong>Fila de Sheet:</strong> {solicitudToDelete.sheetRowIndex}<br/>
                                    <strong className="mt-2 d-block">Esta acción no se puede deshacer.</strong>
                                </Alert>
// ... (código existente sin cambios) ...
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={loading}>
                                    Cancelar
                                </Button>
                                <Button variant="danger" onClick={handleConfirmDelete} disabled={loading}>
// ... (código existente sin cambios) ...
                                    {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Sí, Eliminar'}
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    )}

                </Container>
// ... (código existente sin cambios) ...
            </div>
        </>
    );
};

export default Solicitudes;