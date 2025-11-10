// src/components/Cotizacion.js
// Esta es la nueva "pestaña" para crear y editar cotizaciones.

import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
// ✅ 1. 'Stack' FUE AÑADIDO AL FINAL DE ESTA LÍNEA
import { Container, Row, Col, Card, Form, Button, InputGroup, Table, Alert, Spinner, Stack } from 'react-bootstrap';
// ✅ 2. ESTA LÍNEA FUE AÑADIDA
import { XCircleFill } from 'react-bootstrap-icons';

// Importamos la librería de PDF
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Importamos el logo (asumiendo que SÍ lo tienes en src/logo.svg)
// Si no lo tienes, puedes comentar la línea del logo en el PDF.
import logo from '../logo.svg'; 

// URL del Backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com'
    : 'http://localhost:3000';

// Estados válidos para el dropdown de estado
const estadosValidos = [
    'NUEVO', 'COTIZADO', 'ACEPTADO', 'EN CURSO', 
    'FINALIZADO', 'CERRADO', 'CANCELADO', 'VISITA COTIZADA', 
    'VISITA AGENDADA', 'COTIZADO (PV)', 'PENDIENTE'
];

const Cotizacion = () => {
    const { id } = useParams(); // Obtiene el 'sheet-1' de la URL
    const location = useLocation(); // Para recibir los datos del cliente
    const navigate = useNavigate();

    // Estados del formulario
    const [solicitud, setSolicitud] = useState(null);
    const [lineItems, setLineItems] = useState([{ descripcion: '', precio: 0 }]);
    const [costoManoDeObra, setCostoManoDeObra] = useState(0);
    const [costoMateriales, setCostoMateriales] = useState(0); // Este es el 'monto_cotizado'
    const [estadoActual, setEstadoActual] = useState('COTIZADO');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar los datos de la solicitud al iniciar
    useEffect(() => {
        if (location.state?.solicitud) {
            const data = location.state.solicitud;
            setSolicitud(data);
            setEstadoActual(data.estado || 'NUEVO');
            
            // Si ya existe un presupuesto (Col K) y un monto (Col L), los cargamos
            if (data.presupuesto) {
                try {
                    // Intentamos parsear el JSON de la Col K
                    const parsedPresupuesto = JSON.parse(data.presupuesto);
                    if (parsedPresupuesto.items) {
                        setLineItems(parsedPresupuesto.items);
                    }
                    setCostoManoDeObra(parsedPresupuesto.manoDeObra || 0);
                } catch (e) {
                    console.warn("No se pudo parsear el presupuesto existente, empezando de cero.");
                }
            }
            if (data.monto_cotizado) {
                setCostoMateriales(parseFloat(data.monto_cotizado) || 0);
            }
        }
    }, [location.state]);

    // --- Lógica del Formulario Dinámico ---

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...lineItems];
        updatedItems[index][field] = value;
        setLineItems(updatedItems);
    };

    const handleAddItem = () => {
        setLineItems([...lineItems, { descripcion: '', precio: 0 }]);
    };

    const handleRemoveItem = (index) => {
        const updatedItems = lineItems.filter((_, i) => i !== index);
        setLineItems(updatedItems);
    };

    // --- Cálculos de Totales ---
    const calcularSubtotal = () => {
        return lineItems.reduce((total, item) => total + (parseFloat(item.precio) || 0), 0);
    };

    const calcularTotal = () => {
        const subtotal = calcularSubtotal();
        const manoDeObra = parseFloat(costoManoDeObra) || 0;
        const materiales = parseFloat(costoMateriales) || 0;
        // El total es la suma de los ítems + mano de obra + materiales.
        // PERO, si el usuario quiere que el "monto cotizado" (materiales) sea el total, 
        // ajustamos la fórmula.
        
        // Asumamos que el Total es:
        // Total = (Suma de Ítems) + Mano de Obra.
        // Y el "Monto Cotizado" (Col L) es solo para materiales o un total aparte.
        
        // Vamos a seguir tu petición:
        // Total (del PDF) = (Mano de Obra) + (Materiales)
        // Y los 'lineItems' son solo descriptivos.
        
        // NUEVA LÓGICA (basada en tu descripción):
        // Monto Materiales (Col L)
        // Monto Mano de Obra (se guarda en el JSON de Col K)
        // Ítems (se guarda en el JSON de Col K)
        const total = (parseFloat(costoMateriales) || 0) + (parseFloat(costoManoDeObra) || 0);
        return total;
    };

    // --- Lógica de Guardado (API) y PDF ---

    const handleSaveAndGeneratePDF = async (generarPDF = false) => {
        setLoading(true);
        setError(null);

        const totalFinal = calcularTotal();

        // 1. Preparamos el payload para el Backend (para Google Sheets)
        const presupuestoJSON = JSON.stringify({
            items: lineItems,
            manoDeObra: costoManoDeObra
        });

        const payload = {
            sheetRowIndex: solicitud.sheetRowIndex,
            newStatus: estadoActual,
            newMonto: costoMateriales, // Guardamos Materiales en Col L (Monto Cotizado)
            newPresupuesto: presupuestoJSON // Guardamos el JSON de ítems/mano de obra en Col K (Presupuesto)
        };

        try {
            // 2. Guardamos en Google Sheets
            await axios.patch(`${API_BASE_URL}/api/update-solicitud`, payload);
            console.log("Cotización guardada en Google Sheets.");

            // 3. Generar PDF (si se solicitó)
            if (generarPDF) {
                generarPDFInterno(totalFinal);
            }

            // 4. Volver al dashboard
            navigate('/dashboard');

        } catch (err) {
            console.error("Error al guardar la cotización:", err);
            setError("Error al guardar la cotización. Revisa los permisos de 'Editor' en Google Sheets.");
        } finally {
            setLoading(false);
        }
    };

    const generarPDFInterno = (total) => {
        const doc = new jsPDF();
        
        // --- Cabecera del PDF ---
        // (Si no tienes logo.svg, comenta esta línea)
        try {
            // Intenta añadir el logo. Requiere que 'logo.svg' esté en src/
            // Si falla (porque es un SVG), lo omitirá.
            // doc.addImage(logo, 'SVG', 10, 10, 50, 20); 
        } catch (e) {
            console.warn("No se pudo cargar el logo SVG. Omitiendo.");
        }
        
        doc.setFontSize(20);
        doc.text("COTIZACIÓN DE SERVICIO", 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text("UrbanFix - Lo Hacemos Real", 105, 30, { align: 'center' });
        
        doc.line(10, 35, 200, 35); // Línea divisoria

        // --- Datos del Cliente y Presupuesto ---
        doc.setFontSize(12);
        doc.text("Cliente:", 10, 45);
        doc.text(solicitud?.nombre_apellido || 'N/A', 40, 45);
        
        doc.text("Dirección:", 10, 52);
        doc.text(solicitud?.direccion || 'N/A', 40, 52);

        doc.text("Teléfono:", 10, 59);
        doc.text(solicitud?.telefono || 'N/A', 40, 59);

        doc.text("N° Presupuesto:", 150, 45);
        doc.text(solicitud?.id || 'N/A', 180, 45);

        doc.text("Fecha:", 150, 52);
        doc.text(new Date().toLocaleDateString('es-AR'), 180, 52);

        doc.line(10, 65, 200, 65); // Línea divisoria

        // --- Detalle (Tabla de Ítems) ---
        const tableColumn = ["Descripción", "Precio"];
        const tableRows = lineItems.map(item => [item.descripcion, `$${parseFloat(item.precio) || 0}`]);

        // Añadimos Mano de Obra y Materiales a la tabla
        tableRows.push(["Costo Materiales (Monto Cotizado)", `$${parseFloat(costoMateriales) || 0}`]);
        tableRows.push(["Costo Mano de Obra", `$${parseFloat(costoManoDeObra) || 0}`]);

        doc.autoTable(tableColumn, tableRows, { startY: 70 });

        // --- Total ---
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text("TOTAL (Materiales + Mano de Obra):", 10, doc.autoTable.previous.finalY + 15);
        doc.text(`$${total.toFixed(2)}`, 190, doc.autoTable.previous.finalY + 15, { align: 'right' });

        // --- Guardar PDF ---
        doc.save(`Presupuesto_UrbanFix_${solicitud?.id}.pdf`);
    };

    if (!solicitud) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p>Cargando datos de la solicitud...</p>
                <Link to="/solicitudes">
                    <Button variant="outline-secondary">Volver</Button>
                </Link>
            </Container>
        );
    }

    // --- Renderizado del Formulario ---
    return (
        <Container className="mt-5 mb-5">
            <Row className="justify-content-center">
                <Col md={10} lg={9}>
                    <Card className="shadow-lg p-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2 className="text-primary">Cotizar Solicitud</h2>
                                <Link to="/solicitudes">
                                    <Button variant="outline-secondary">Volver</Button>
                                </Link>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}

                            {/* Datos del Cliente (Solo Lectura) */}
                            <Card className="mb-4 bg-light">
                                <Card.Body>
                                    <h5 className="mb-3">Datos del Cliente</h5>
                                    <p className="mb-1"><strong>Cliente:</strong> {solicitud.nombre_apellido}</p>
                                    <p className="mb-1"><strong>Teléfono:</strong> {solicitud.telefono}</p>
                                    <p className="mb-1"><strong>Dirección:</strong> {solicitud.direccion}</p>
                                    <p className="mb-0"><strong>Categoría:</strong> {solicitud.categoria_trabajo}</p>
                                </Card.Body>
                            </Card>

                            <Form>
                                {/* --- Formulario Dinámico de Ítems --- */}
                                <h5 className="mb-3">Detalle de Cotización (Ítems descriptivos)</h5>
                                {lineItems.map((item, index) => (
                                    <Row key={index} className="mb-2 align-items-center">
                                        <Col md={8}>
                                            <Form.Control
                                                type="text"
                                                placeholder={`Ítem ${index + 1}`}
                                                value={item.descripcion}
                                                onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                                            />
                                        </Col>
                                        <Col md={3}>
                                            <InputGroup>
                                                <InputGroup.Text>$</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="Precio"
                                                    value={item.precio}
                                                    onChange={(e) => handleItemChange(index, 'precio', e.target.value)}
                                                />
                                            </InputGroup>
                                        </Col>
                                        <Col md={1}>
                                            <Button variant="danger" size="sm" onClick={() => handleRemoveItem(index)}>
                                                <XCircleFill />
                                            </Button>
                                        </Col>
                                    </Row>
                                ))}
                                <Button variant="outline-primary" size="sm" onClick={handleAddItem} className="mt-2">
                                    + Agregar Ítem
                                </Button>

                                <hr className="my-4" />

                                {/* --- Sección de Totales y Estado --- */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formManoDeObra">
                                            <Form.Label className="fw-bold">Mano de Obra ($)</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>$</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    value={costoManoDeObra}
                                                    onChange={(e) => setCostoManoDeObra(e.target.value)}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formMateriales">
                                            <Form.Label className="fw-bold">Materiales (Monto Cotizado) ($)</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>$</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    value={costoMateriales}
                                                    onChange={(e) => setCostoMateriales(e.target.value)}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formEstado">
                                            <Form.Label className="fw-bold">Cambiar Estado</Form.Label>
                                            <Form.Select
                                                value={estadoActual}
                                                onChange={(e) => setEstadoActual(e.target.value)}
                                            >
                                                {estadosValidos.map(estado => (
                                                    <option key={estado} value={estado}>{estado}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="d-flex align-items-end">
                                        <div className="mb-3">
                                            <h4 className="text-success">Total: ${calcularTotal().toFixed(2)}</h4>
                                        </div>
                                    </Col>
                                </Row>
                                
                                {/* --- Botones de Acción --- */}
                                <Stack direction="horizontal" gap={3} className="mt-4 justify-content-end">
                                    <Button 
                                        variant="outline-primary" 
                                        onClick={() => handleSaveAndGeneratePDF(false)}
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner size="sm" animation="border" /> : "Guardar Cambios"}
                                    </Button>
                                    <Button 
                                        variant="success"
                                        onClick={() => handleSaveAndGeneratePDF(true)} // Guardar Y Generar PDF
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner size="sm" animation="border" /> : "Guardar y Generar PDF"}
                                    </Button>
                                </Stack>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Cotizacion;