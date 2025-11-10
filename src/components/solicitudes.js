// src/components/solicitudes.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ✅ IMPORTACIONES AÑADIDAS: Row, Col, Form.Control, InputGroup
import { Container, Table, Button, Form, Alert, Spinner, Stack, Row, Col, InputGroup } from 'react-bootstrap'; 
// ✅ ICONOS AÑADIDOS: ArrowClockwise y Search
import { PencilFill, SaveFill, XCircleFill, ArrowClockwise, Search } from 'react-bootstrap-icons';
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

    // ✅ NUEVO: Estados para el buscador y el filtro
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('TODOS'); // Valor inicial "TODOS"

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
            // ✅ CORREGIDO: Mensaje de error genérico (no el de localhost)
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


    // NUEVO: Se activa al hacer clic en el lápiz ✏️
    const handleEditClick = (solicitud) => {
        setEditingRowId(solicitud.id);
        setOriginalRowData(solicitud); 
    };

    // NUEVO: Se activa al hacer clic en la X ❌
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
            
            // Refrescamos los datos para asegurar consistencia
            await fetchSolicitudes();
            
            // Navega al dashboard para forzar la actualización de estadísticas
            navigate('/dashboard');
        
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            setError("Error al guardar el cambio en Google Sheets. La página se recargará para re-sincronizar.");
            setTimeout(() => window.location.reload(), 2000); 
        }
    };

    // LÓGICA DE NAVEGACIÓN A COTIZACIÓN
    const handleCotizarClick = (solicitud) => {
        // Navega a la ruta de cotización, pasando TODOS los datos de la fila
        navigate(`/cotizar/${solicitud.id}`, { state: { solicitud } });
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

    // ✅ NUEVO: Lógica de filtrado
    const solicitudesFiltradas = solicitudes.filter(solicitud => {
        // 1. Filtrar por estado
        const filtroEstado = statusFilter === 'TODOS' ? true : solicitud.estado === statusFilter;
        
        // 2. Filtrar por término de búsqueda (en nombre_apellido)
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

            {/* ✅ NUEVO: Fila de Buscador y Filtros */}
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
                    {/* ✅ MODIFICADO: Mapea sobre 'solicitudesFiltradas' */}
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
                                    
                                    {/* COLUMNA MONTO (Ahora editable) */}
                                    <td>
                                        {isEditing ? (
                                            <Form.Control
                                                type="text" // Usamos 'text' para permitir '$' o números
                                                size="sm"
                                                value={solicitud.monto_cotizado || ''}
                                                onChange={(e) => handleMontoChange(solicitud.id, e.target.value)}
                                                autoComplete="off"
                                            />
                                        ) : (
                                            solicitud.monto_cotizado ? `$${solicitud.monto_cotizado}` : 'N/A'
                                        )}
                                    </td>

                                    {/* COLUMNA ESTADO (Ahora editable) */}
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
                                    
                                    {/* COLUMNA ACCIÓN (Botones) */}
                                    <td>
                                        {isEditing ? (
                                            // ---------------- MODO EDICIÓN ----------------
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
                                            // ---------------- MODO LECTURA ----------------
                                            <Stack direction="horizontal" gap={2}>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    onClick={() => handleEditClick(solicitud)}
                                                    title="Editar Estado y Monto"
                                                >
                                                    <PencilFill />
                                                </Button>
                                                
                                                {/* ✅ NUEVO: Botón de Cotizar */}
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
                        // ✅ NUEVO: Mensaje si no hay resultados de filtro
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
        </Container>
    );
};

export default Solicitudes;