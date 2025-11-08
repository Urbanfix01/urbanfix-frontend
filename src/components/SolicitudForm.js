// src/components/SolicitudForm.js

import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap'; 
import { Link } from 'react-router-dom';

// Usamos la misma lógica de URL (Producción o Local)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://urbanfix-backend-4sfg.onrender.com' // <-- ¡Tu URL pública!
    : 'http://localhost:3000';

const SolicitudForm = () => {
    // Estados para el formulario
    const [formData, setFormData] = useState({
        nombre_apellido: '',
        telefono: '',
        direccion: '',
        categoria_trabajo: '',
        descripcion_problema: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Lista de categorías (simplificada, puedes expandirla)
    const categorias = ['Plomería', 'Electricidad', 'Gas y termotanques', 'Otro'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // 1. Llamamos a la nueva ruta POST en el Backend
            const response = await axios.post(`${API_BASE_URL}/api/crear-solicitud`, formData);

            if (response.data.success) {
                setSuccess('¡Solicitud enviada con éxito! Nos pondremos en contacto a la brevedad.');
                // 2. Limpiamos el formulario
                setFormData({
                    nombre_apellido: '',
                    telefono: '',
                    direccion: '',
                    categoria_trabajo: '',
                    descripcion_problema: ''
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

                                <Form.Group className="mb-3" controlId="formDireccion">
                                    <Form.Label>Dirección</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        required 
                                    />
                                </Form.Group>

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
                                        placeholder="Describa brevemente el trabajo a realizar..."
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid gap-3">
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