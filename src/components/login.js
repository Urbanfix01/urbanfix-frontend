import React, { useRef, useState } from 'react';
// RUTA CORREGIDA: Eliminamos la extensión .js para que el bundler lo resuelva correctamente.
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
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
      setError('Fallo al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <Container fluid className="login-page-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={12} sm={10} md={7} lg={5} xl={4}>
          <Card className="shadow-2xl login-card">
            <Card.Body className="p-5">
              
              {/* === LOGO URBANFIX === */}
              {/* Asegúrate de que esta ruta sea correcta después de guardar el logo en /public */}
              <div className="text-center mb-5">
                <img 
                  src="https://placehold.co/200x60/FF8A3D/3A3B3C?text=UrbanFix" 
                  alt="Logo UrbanFix - Lo hacemos real" 
                  className="urbanfix-logo" 
                  // Si tienes la imagen en public/logo-urbanfix.png usa:
                  // src="/logo-urbanfix.png" 
                />
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                
                <Form.Group className="mb-4" controlId="formBasicEmail">
                  <Form.Label className="fw-semibold">Correo Electrónico</Form.Label>
                  <Form.Control 
                    type="email" 
                    ref={emailRef} 
                    placeholder="Tu correo electrónico" 
                    size="lg"
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-5" controlId="formBasicPassword">
                  <Form.Label className="fw-semibold">Contraseña</Form.Label>
                  <Form.Control 
                    type="password" 
                    ref={passwordRef} 
                    placeholder="••••••••" 
                    size="lg"
                    required 
                  />
                </Form.Group>
                
                {/* BOTONES APILADOS */}
                <Stack gap={3}>
                  <Button variant="primary" type="submit" size="lg" className="login-button fw-bold">
                    Iniciar Sesión (Admin)
                  </Button>
                  
                  <Link to="/solicitar" className="text-decoration-none">
                    <Button variant="outline-primary" size="lg" className="w-100 request-button">
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