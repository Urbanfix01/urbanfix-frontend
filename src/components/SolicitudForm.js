// src/components/SolicitudForm.js

import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Stack } from 'react-bootstrap'; 
import { Link } from 'react-router-dom';

// Usamos la misma lógica de URL (Producción o Local)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com' // <-- ¡Tu URL pública!
    : 'http://localhost:3000';

const SolicitudForm = () => {
    // 🌟 ESTADOS AMPLIADOS PARA INCLUIR URGENCIA Y VENTANAS
    const [formData, setFormData] = useState({
        nombre_apellido: '',
        telefono: '',
        direccion: '',
        categoria_trabajo: '',
        descripcion_problema: '',
        // Asignamos la primera opción como valor por defecto para el radio button
        urgencia: 'Normal: Es un arreglo, pero no hay apuro.', 
        ventanas_horarias: [] // Array para checkboxes
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Opciones del Formulario (Basado en tus capturas)
    const categorias = ['Plomería', 'Electricidad', 'Gas y termotanques (Calefones, estufas)', 'Aire Acondicionado (Instalación / Mantenimiento)', 'Cerrajería (Urgencias / Cambios)', 'Pintura', 'Albañilería (Arreglos menores, Durlock, etc.)', 'Carpintería / Herrería', 'Electrodomésticos (Lavarropas, heladeras, etc.)', 'Jardinería / Limpieza técnica', 'Otro'];
    
    const opcionesUrgencia = [
        'Normal: Es un arreglo, pero no hay apuro.', 
        'Moderado: Necesito resolverlo pronto. (Próximas 48hs)', 
        'Urgente: ¡Es una emergencia! (Necesito solución hoy. Entiendo que puede tener recargo)'
    ];

    const opcionesVentanas = [
        'Lunes a Viernes (Mañana 9-13hs)',
        'Lunes a Viernes (Tarde 14-18hs)',
        'Sábado (Mañana 9-13hs)',
        'A coordinar (Tengo horarios rotativos)',
        'Lo antes posible (Solo para urgencias)'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // 🌟 NUEVO: Manejador para Checkboxes de Ventanas Horarias
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prevData => {
            const currentVentanas = prevData.ventanas_horarias;
            if (checked) {
                // Añadir la opción si está marcada
                return { ...prevData, ventanas_horarias: [...currentVentanas, value] };
            } else {
                // Quitar la opción si está desmarcada
                return { ...prevData, ventanas_horarias: currentVentanas.filter(v => v !== value) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // 🌟 PREPARAR DATOS PARA LA API: Convertir el array de ventanas a un string CSV
        const dataToSend = {
            ...formData,
            ventanas_horarias: formData.ventanas_horarias.join(', ') // String separado por comas
        };

        try {
            // 1. Llamamos a la nueva ruta POST en el Backend
            const response = await axios.post(`${API_BASE_URL}/api/crear-solicitud`, dataToSend);

            if (response.data.success) {
                setSuccess('¡Solicitud enviada con éxito! Nos pondremos en contacto a la brevedad.');
                // 2. Limpiamos el formulario (restaurando los valores por defecto)
                setFormData({
                    nombre_apellido: '',
                    telefono: '',
                    direccion: '',
                    categoria_trabajo: '',
                    descripcion_problema: '',
                    urgencia: opcionesUrgencia[0],
                    ventanas_horarias: []
                });
            } else {
                throw new Error('Error al enviar la solicitud.');
            }
        
        } catch (err) {
            console.error("Error al crear la solicitud:", err);
            setError('Error al enviar la solicitud. Por favor, intente más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <Card className="shadow-lg p-4">
                        <Card.Body>
                            <h2 className="text-center mb-4 text-primary">Solicitar Presupuesto</h2>
                            <p className="text-center text-muted mb-4">
                                Complete el formulario y nos pondremos en contacto para coordinar una visita o enviarle una cotización.
                            </p>
                            
                            {/* Mensajes de Éxito o Error */}
                            {success && <Alert variant="success">{success}</Alert>}
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                {/* ----------------------- SECCIÓN DATOS DE CONTACTO ----------------------- */}
                                <h5 className="mb-3">Datos de Contacto</h5>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formNombre">
                                            <Form.Label>Nombre y Apellido</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="nombre_apellido"
                                                value={formData.nombre_apellido}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formTelefono">
                                            <Form.Label>Teléfono (WhatsApp)</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4" controlId="formDireccion">
                                    <Form.Label>Dirección / Localidad</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        placeholder="Ej: Av. Corrientes 1234, Almagro"
                                        required 
                                    />
                                </Form.Group>

                                {/* ----------------------- SECCIÓN PROBLEMA ----------------------- */}
                                <h5 className="mb-3">Detalles del Trabajo</h5>
                                
                                <Form.Group className="mb-3" controlId="formCategoria">
                                    <Form.Label>Categoría del Trabajo</Form.Label>
                                    <Form.Select
                                        name="categoria_trabajo"
                                        value={formData.categoria_trabajo}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione una categoría...</option>
                                        {categorias.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formDescripcion">
                                    <Form.Label>Descripción del Problema</Form.Label>
                                    <Form.Control 
                                        as="textarea"
                                        rows={4}
                                        name="descripcion_problema"
                                        value={formData.descripcion_problema}
                                        onChange={handleChange}
                                        placeholder="Lo más claro posible. Ej: La canilla pierde agua constantemente, necesito instalar 3 tomas de corriente en el living."
                                        required
                                    />
                                </Form.Group>
                                
                                {/* ----------------------- SECCIÓN URGENCIA (Radio Buttons) ----------------------- */}
                                <Form.Group className="mb-4" controlId="formUrgencia">
                                    <Form.Label className="fw-bold">¿QUÉ TAN URGENTE ES?</Form.Label>
                                    {opcionesUrgencia.map((opcion, index) => (
                                        <Form.Check
                                            key={index}
                                            type="radio"
                                            name="urgencia"
                                            id={`urgencia-${index}`}
                                            label={opcion}
                                            value={opcion}
                                            // El checked se basa en el estado actual
                                            checked={formData.urgencia === opcion}
                                            onChange={handleChange}
                                            className="ms-3"
                                        />
                                    ))}
                                </Form.Group>

                                {/* ----------------------- SECCIÓN HORARIOS (Checkboxes) ----------------------- */}
                                <Form.Group className="mb-4" controlId="formHorarios">
                                    <Form.Label className="fw-bold">VENTANAS HORARIAS</Form.Label>
                                    <p className="text-muted small mb-2">Seleccione todas las que apliquen:</p>
                                    {opcionesVentanas.map((opcion, index) => (
                                        <Form.Check
                                            key={index}
                                            type="checkbox"
                                            name="ventanas_horarias"
                                            id={`ventana-${index}`}
                                            label={opcion}
                                            value={opcion}
                                            // El checked se basa en si el valor está en el array del estado
                                            checked={formData.ventanas_horarias.includes(opcion)}
                                            onChange={handleCheckboxChange}
                                            className="ms-3"
                                        />
                                    ))}
                                </Form.Group>


                                <div className="d-grid gap-3 mt-4">
                                    <Button variant="primary" type="submit" size="lg" disabled={loading}>
                                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Enviar Solicitud'}
                                    </Button>
                                    <Link to="/login" className="text-center">
                                        <Button variant="outline-secondary" className="w-100">
                                            Volver al Login de Administrador
                                        </Button>
                                    </Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SolicitudForm;