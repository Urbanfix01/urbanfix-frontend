// src/components/login.js

import React, { useRef, useState } from 'react';
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
// 🌟 Link añadido
import { useNavigate, Link } from 'react-router-dom';
// 🌟 Importaciones de React-Bootstrap (Image eliminada)
// 🌟 Stack añadido
import { Container, Row, Col, Form, Button, Card, Alert, Stack } from 'react-bootstrap'; 

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
      navigate('/dashboard'); 
    } catch (err) {
      setError('Fallo al iniciar sesión: ' + err.message);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="shadow-lg p-5">
            <Card.Body>
              
              <h2 className="text-center mb-4 text-primary">🔐 Acceso UrbanFix</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control 
                    type="email" 
                    ref={emailRef} 
                    placeholder="ejemplo@urbanfix.com" 
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control 
                    type="password" 
                    ref={passwordRef} 
                    placeholder="••••••••" 
                    required 
                  />
                </Form.Group>
                
                {/* 🌟 BOTONES APILADOS 🌟 */}
                <Stack gap={3}>
                    <Button variant="primary" type="submit" size="lg">
                        Iniciar Sesión (Admin)
                    </Button>
                    
                    <Link to="/solicitar">
                        <Button variant="outline-success" size="lg" className="w-100">
                            Solicitar Presupuesto
                        </Button>
                    </Link>
                </Stack>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;