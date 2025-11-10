// src/components/Cotizacion.js
import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert, Spinner, Stack } from 'react-bootstrap';
import { XCircleFill } from 'react-bootstrap-icons';
import jsPDF from 'jspdf';
// ✅ 1. IMPORTACIÓN CORREGIDA
import autoTable from 'jspdf-autotable';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com'
    : 'http://localhost:3000';

const estadosValidos = [
    'NUEVO', 'COTIZADO', 'ACEPTADO', 'EN CURSO', 
    'FINALIZADO', 'CERRADO', 'CANCELADO', 'VISITA COTIZADA', 
    'VISITA AGENDADA', 'COTIZADO (PV)', 'PENDIENTE'
];

const Cotizacion = () => {
    useParams(); 
    const location = useLocation(); 
    const navigate = useNavigate();

    const [solicitud, setSolicitud] = useState(null);
    const [lineItems, setLineItems] = useState([{ descripcion: '', precio: 0 }]);
    const [costoManoDeObra, setCostoManoDeObra] = useState(0);
    const [costoMateriales, setCostoMateriales] = useState(0); 
    const [estadoActual, setEstadoActual] = useState('COTIZADO');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (location.state?.solicitud) {
            const data = location.state.solicitud;
            setSolicitud(data);
            setEstadoActual(data.estado || 'NUEVO');
            
            if (data.presupuesto) {
                try {
                    const parsedPresupuesto = JSON.parse(data.presupuesto);
                    if (parsedPresupuesto.items) {
                        setLineItems(parsedPresupuesto.items);
                    }
                    setCostoManoDeObra(parsedPresupuesto.manoDeObra || 0);
                } catch (e) {
                    console.warn("No se pudo parsear el presupuesto existente.");
                }
            }
            if (data.monto_cotizado) {
                 if (!data.presupuesto) {
                    setCostoMateriales(parseFloat(data.monto_cotizado) || 0);
                 }
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
    const calcularTotal = () => {
        const total = (parseFloat(costoMateriales) || 0) + (parseFloat(costoManoDeObra) || 0);
        return total;
    };

    // --- Lógica de Guardado (API) y PDF ---
    const handleSaveAndGeneratePDF = async (generarPDF = false) => {
        setLoading(true);
        setError(null);
        const totalFinal = calcularTotal();

        const presupuestoJSON = JSON.stringify({
            items: lineItems,
            manoDeObra: costoManoDeObra
        });

        const payload = {
            sheetRowIndex: solicitud.sheetRowIndex,
            newStatus: estadoActual,
            newMonto: totalFinal,
            newPresupuesto: presupuestoJSON 
        };

        try {
            await axios.patch(`${API_BASE_URL}/api/update-solicitud`, payload);
            console.log("Cotización guardada en Google Sheets.");

            if (generarPDF) {
                try {
                    generarPDFInterno(totalFinal);
                } catch (pdfError) {
                    console.error("¡Guardado exitoso, PERO falló el PDF!", pdfError);
                    setError(`Guardado en Sheets exitoso, pero falló la generación del PDF. Error: ${pdfError.message}`);
                    setLoading(false);
                    return; 
                }
            }
            navigate('/dashboard');

        } catch (apiError) {
            console.error("Error al guardar la cotización (API):", apiError);
            setError("Error al guardar en Google Sheets. Revisa los logs de Render para ver el error de la API.");
            setLoading(false); // Nos quedamos en la página si la API falla
        }
        // No ponemos 'finally' porque el 'setLoading(false)' se maneja dentro de los catch
    };

    const generarPDFInterno = (total) => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("COTIZACIÓN DE SERVICIO", 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text("UrbanFix - Lo Hacemos Real", 105, 30, { align: 'center' });
        doc.line(10, 35, 200, 35); 

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
        doc.line(10, 65, 200, 65);

        const tableColumn = ["Descripción", "Precio (Descriptivo)"];
        const tableRows = lineItems.map(item => [item.descripcion, `$${parseFloat(item.precio) || 0}`]);
        
        tableRows.push(["Costo Materiales", `$${parseFloat(costoMateriales) || 0}`]);
        tableRows.push(["Costo Mano de Obra", `$${parseFloat(costoManoDeObra) || 0}`]);

        let startY = 70;
        
        // ✅ 2. LLAMADA CORREGIDA
        if (autoTable) {
            autoTable(doc, { // El primer argumento es el 'doc'
                head: [tableColumn],
                body: tableRows,
                startY: startY
            });
            startY = doc.lastAutoTable.finalY; 
        } else {
            console.error("jsPDF autoTable plugin no está cargado.");
            doc.text("Error: No se pudo generar la tabla del PDF.", 10, startY);
            startY += 10; 
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text("TOTAL (Materiales + Mano de Obra):", 10, startY + 15);
        doc.text(`$${total.toFixed(2)}`, 190, startY + 15, { align: 'right' });
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
                                            <Form.Label className="fw-bold">Materiales ($)</Form.Label>
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
                                        onClick={() => handleSaveAndGeneratePDF(true)}
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
// Forzando el guardado
export default Cotizacion;