// src/components/Login.js

import React, { useRef, useState } from 'react';
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
// 🌟 Importaciones de React-Bootstrap para el diseño
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap'; 

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(
        auth,
        emailRef.current.value,
        passwordRef.current.value
      );
      // Redirigir al dashboard tras el login exitoso
      navigate('/dashboard'); 
    } catch (err) {
      // Mostrar el error de Firebase con el estado 'error'
      setError('Fallo al iniciar sesión. Por favor, verifica tus credenciales.');
      console.error(err.message);
    }
  };

  return (
    // 1. Usar Container, Row, Col para centrar el contenido
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={5}>
          {/* 2. Usar Card para darle un contenedor con estilo */}
          <Card className="shadow-lg p-5">
            <Card.Body>
              <h2 className="text-center mb-4 text-primary">🔐 UrbanFix CRM Login</h2>
              
              {/* 3. Mostrar errores con el componente Alert de Bootstrap */}
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                
                {/* 4. Campo de Email (usando Form.Group y Form.Control) */}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control 
                    type="email" 
                    ref={emailRef} 
                    placeholder="ejemplo@urbanfix.com" 
                    required 
                  />
                </Form.Group>

                {/* 5. Campo de Contraseña */}
                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control 
                    type="password" 
                    ref={passwordRef} 
                    placeholder="••••••••" 
                    required 
                  />
                </Form.Group>
                
                {/* 6. Botón de Acceso (usando el componente Button) */}
                <div className="d-grid">
                  <Button variant="primary" type="submit" size="lg">
                    Iniciar Sesión
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;