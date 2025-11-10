// src/components/solicitudes.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Stack, Spinner, y Iconos añadidos
import { Container, Table, Button, Form, Alert, Spinner, Stack } from 'react-bootstrap'; 
import { PencilFill, SaveFill, XCircleFill } from 'react-bootstrap-icons';
// useNavigate añadido
import { Link, useNavigate } from 'react-router-dom';

// CAMBIO 2: URL de API actualizada
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com' // <--- ¡Tu URL pública!
    : 'http://localhost:3000'; 

// Función auxiliar para asignar color (variant) de Bootstrap según el estado
const getStatusVariant = (estado) => {
    const estadoNorm = estado?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || 'PENDIENTE';

    // SINCRONIZACIÓN 4: Actualizado para coincidir con tu lista de estados
    switch (estadoNorm) {
        case 'ACEPTADO':
        case 'FINALIZADO':
        case 'CERRADO':
            return 'success'; // Verdes
        
        // eslint-disable-next-line no-fallthrough
        case 'PENDIENTE':
        case 'EN CURSO':
        case 'NUEVO': 
            return 'warning'; // Amarillos
        
        case 'CANCELADO':
            return 'danger'; // Rojo
        
        // eslint-disable-next-line no-fallthrough
        case 'VISITA COTIZADA':
        case 'VISITA AGENDADA':
            return 'info'; // Azules

        // eslint-disable-next-line no-fallthrough
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
    
    // NUEVO: Estado para rastrear qué fila estamos editando
    const [editingRowId, setEditingRowId] = useState(null);
    // NUEVO: Estado para guardar el valor original al cancelar
    const [originalRowData, setOriginalRowData] = useState(null);

    // SINCRONIZACIÓN 5: Lista de estados disponibles (basada en tu planilla)
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
        'PENDIENTE' // Asegurándonos que PENDIENTE esté
    ];

    // Hook useNavigate
    const navigate = useNavigate();

    // Lógica para obtener los datos al cargar el componente
    const fetchSolicitudes = async () => { // Hacemos esta función accesible fuera de useEffect
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(`${API_BASE_URL}/api/solicitudes-sheet`);
            
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            // Ya no necesitamos 'isDirty', el 'editingRowId' maneja esto
            setSolicitudes(response.data.solicitudes); 

        } catch (err) {
            console.error("Error al obtener solicitudes:", err);
            // ✅ CORRECCIÓN DE ERROR: Mensaje genérico para la nube
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
    
    // NUEVA FUNCIÓN: Actualización visual del Monto
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
        // Guardamos la fila completa original
        setOriginalRowData(solicitud); 
    };

    // NUEVO: Se activa al hacer clic en la X ❌
    const handleCancelClick = (solicitudId) => {
        // Revierte el estado visual al original
        setSolicitudes(currentSolicitudes =>
            currentSolicitudes.map(sol =>
                sol.id === solicitudId ? originalRowData : sol
            )
        );
        setEditingRowId(null); // Sale del modo edición
        setOriginalRowData(null);
    };

    // LÓGICA DE GUARDADO (LLAMADA A LA API)
    const handleSaveClick = async (solicitud) => {
        const { sheetRowIndex, estado, monto_cotizado } = solicitud;

        try {
            // LLAMADA A LA NUEVA RUTA DE API
            await axios.patch(`${API_BASE_URL}/api/update-solicitud`, {
                sheetRowIndex: sheetRowIndex,
                newStatus: estado, 
                newMonto: monto_cotizado || '0' // Enviamos el nuevo monto (o 0 si está vacío)
            });
            
            setEditingRowId(null); // Sale del modo edición
            setOriginalRowData(null);

            // ✅ CORRECCIÓN: Volvemos a cargar la tabla al guardar
            await fetchSolicitudes();
            
            // Navega al dashboard para forzar la actualización de estadísticas
            navigate('/dashboard'); 
        
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            setError("Error al guardar el cambio. Intente de nuevo.");
            
            // Revertimos la fila y salimos del modo edición en caso de error
            handleCancelClick(solicitud.id);
        }
    };

    // LÓGICA DE NAVEGACIÓN A COTIZACIÓN
    const handleCotizarClick = (solicitud) => {
        // Navega a la nueva ruta y pasa la data de la solicitud
        navigate(`/cotizar/${solicitud.id}`, { state: { solicitud } });
    }


    if (loading) {
        // CORRECCIÓN: Spinner re-añadido
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

    // CORRECCIÓN: Envuelto en un <Container> raíz
    return (
        <Container className="mt-5">
            {/* Elemento 1: Título y Botón Volver */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 text-primary">
                    Gestión de Solicitudes <span className="text-muted">({solicitudes.length} encontradas)</span>
                </h3>
                <Link to="/dashboard">
                    <Button variant="outline-secondary">
                        Volver al Panel
                    </Button>
                </Link>
            </div>

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
                    {solicitudes.map((solicitud, index) => {
                        // Variable para saber si ESTA fila está en modo edición
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
                                            {/* ✅ NUEVO BOTÓN: COTIZAR (Navega a la nueva ruta) */}
                                            <Button 
                                                variant="info" 
                                                size="sm" 
                                                onClick={() => handleCotizarClick(solicitud)}
                                                title="Cotizar (Abre formulario de presupuesto)"
                                            >
                                                $
                                            </Button>
                                        </Stack>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
            
            {/* Elemento 3: Alerta de Cero Solicitudes */}
            {solicitudes.length === 0 && !loading && <Alert variant="info" className="text-center">No hay solicitudes para mostrar.</Alert>}
        </Container>
    );
};

export default Solicitudes;