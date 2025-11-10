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
    const estadoNorm = estado?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || 'PENDIENTE';

    switch (estadoNorm) {
        case 'ACEPTADO':
        case 'FINALIZADO':
        case 'CERRADO':
            return 'success'; 
        
        // eslint-disable-next-line no-fallthrough
        case 'PENDIENTE':
        case 'EN CURSO':
        case 'NUEVO': 
            return 'warning'; 
        
        case 'CANCELADO':
            return 'danger'; 
        
        // eslint-disable-next-line no-fallthrough
        case 'VISITA COTIZADA':
        case 'VISITA AGENDADA':
            return 'info'; 

        // eslint-disable-next-line no-fallthrough
        case 'PRESUPUESTADO':
        case 'COTIZADO': 
        case 'COTIZADO (PV)':
            return 'primary'; 
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

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('TODOS'); 

    // ✅ NUEVO: Estados para el Modal de Detalles
    const [showModal, setShowModal] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);

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

    // Lógica para obtener los datos al cargar el componente
    const fetchSolicitudes = async () => { 
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(`${API_BASE_URL}/api/solicitudes-sheet`);
            
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            setSolicitudes(response.data.solicitudes); 

        } catch (err) {
            console.error("Error al obtener solicitudes:", err);
            setError('Fallo al cargar datos del Backend. Por favor, asegúrate que el servicio de Render esté activo y revisa la consola para más detalles.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchSolicitudes();
    }, []); 

    // LÓGICA DE ACTUALIZACIÓN (SOLO VISUAL)
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


    // Se activa al hacer clic en el lápiz ✏️
    const handleEditClick = (solicitud) => {
        setEditingRowId(solicitud.id);
        setOriginalRowData(solicitud); 
    };

    // Se activa al hacer clic en la X ❌
    const handleCancelClick = (solicitudId) => {
        setSolicitudes(currentSolicitudes =>
            currentSolicitudes.map(sol =>
                sol.id === solicitudId ? originalRowData : sol
            )
        );
        setEditingRowId(null); 
        setOriginalRowData(null);
    };

    // LÓGICA DE GUARDADO (LLAMADA A LA API)
    const handleSaveClick = async (solicitud) => {
        const { sheetRowIndex, estado, monto_cotizado } = solicitud;

        try {
            await axios.patch(`${API_BASE_URL}/api/update-solicitud`, {
                sheetRowIndex: sheetRowIndex,
                newStatus: estado, 
                newMonto: monto_cotizado || '0' 
            });
            
            setEditingRowId(null); 
            setOriginalRowData(null);
            
            await fetchSolicitudes();
            
            navigate('/dashboard');
        
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            setError("Error al guardar el cambio en Google Sheets. La página se recargará para re-sincronizar.");
            setTimeout(() => window.location.reload(), 2000); 
        }
    };

    // LÓGICA DE NAVEGACIÓN A COTIZACIÓN
    const handleCotizarClick = (solicitud) => {
        navigate(`/cotizar/${solicitud.id}`, { state: { solicitud } });
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
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" variant="primary" className="me-2" />
                <span className="text-primary">Cargando solicitudes...</span>
            </Container>
        );
    }
    
    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    // Lógica de filtrado
    const solicitudesFiltradas = solicitudes.filter(solicitud => {
        const filtroEstado = statusFilter === 'TODOS' ? true : solicitud.estado === statusFilter;
        
        const filtroBusqueda = solicitud.nombre_apellido
            ? solicitud.nombre_apellido.toLowerCase().includes(searchTerm.toLowerCase())
            : false;
            
        return filtroEstado && filtroBusqueda;
    });


    return (
        <Container className="mt-5">
            {/* Elemento 1: Título y Botones */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 text-primary">
                    Gestión de Solicitudes <span className="text-muted">({solicitudesFiltradas.length} encontradas)</span>
                </h3>
                
                <Stack direction="horizontal" gap={2}>
                    <Button 
                        variant="outline-primary" 
                        onClick={fetchSolicitudes} 
                        disabled={loading}
                        title="Recargar datos desde Google Sheets"
                    >
                        {loading 
                            ? <Spinner as="span" animation="border" size="sm" /> 
                            : <ArrowClockwise size={20} />
                        }
                    </Button>
                    <Link to="/dashboard">
                        <Button variant="outline-secondary">
                            Volver al Panel
                        </Button>
                    </Link>
                </Stack>
            </div>

            {/* Fila de Buscador y Filtros */}
            <Row className="mb-4 p-3 bg-light rounded shadow-sm">
                <Col md={7}>
                    <Form.Group controlId="filtroBusqueda">
                        <Form.Label>Buscar por Cliente</Form.Label>
                        <InputGroup>
                            <InputGroup.Text><Search /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Escriba el nombre del cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Form.Group>
                </Col>
                <Col md={5}>
                    <Form.Group controlId="filtroEstado">
                        <Form.Label>Filtrar por Estado</Form.Label>
                        <Form.Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="TODOS">-- Mostrar Todos los Estados --</option>
                            {estadosValidos.map(estado => (
                                <option key={estado} value={estado}>{estado}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>


            {/* Elemento 2: La Tabla */}
            <Table striped bordered hover responsive className="shadow-sm">
                <thead>
                    <tr className="table-dark">
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
                    {solicitudesFiltradas.length > 0 ? (
                        solicitudesFiltradas.map((solicitud, index) => {
                            const isEditing = editingRowId === solicitud.id;
                            
                            return (
                                <tr key={solicitud.id}>
                                    <td>{index + 1}</td> 
                                    <td>{solicitud.marca_temporal || 'N/A'}</td> 
                                    <td>{solicitud.nombre_apellido || 'N/A'}</td>
                                    <td>{solicitud.telefono || 'N/A'}</td>
                                    <td>{solicitud.direccion || 'N/A'}</td>
                                    <td>{solicitud.categoria_trabajo || 'N/A'}</td>
                                    
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
                                            >
                                                {solicitud.estado || 'PENDIENTE'}
                                            </Button>
                                        )}
                                    </td>
                                    
                                    <td>
                                        {isEditing ? (
                                            <Stack direction="horizontal" gap={2}>
                                                <Button 
                                                    variant="success" 
                                                    size="sm" 
                                                    onClick={() => handleSaveClick(solicitud)}
                                                    title="Guardar"
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
                                            <Stack direction="horizontal" gap={2}>
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
                                                    $
                                                </Button>
                                            </Stack>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="9" className="text-center text-muted">
                                No se encontraron solicitudes que coincidan con los filtros.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
            
            {/* Elemento 3: Alerta de Cero Solicitudes */}
            {solicitudes.length === 0 && !loading && <Alert variant="info" className="text-center">No hay solicitudes para mostrar.</Alert>}

            {/* ✅ CORRECCIÓN: Modal movido DENTRO del Container raíz */}
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