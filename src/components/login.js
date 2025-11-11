// src/components/Login.js
import React, { useRef, useState } from 'react';
// CORRECCIÓN FINAL DE RUTA: Intentamos la forma estándar sin extensión
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Stack } from 'react-bootstrap'; 
// Importamos el logo para usarlo en el header
import logo from '../assets/urbanfix-logo-placeholder.png'; // Asegúrate de que esta ruta sea correcta

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef(); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Función de inicio de sesión
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
      // Usamos el mensaje de error de Firebase para mayor claridad
      setError('Fallo al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  };

  return (
    <Container fluid className="login-page-container d-flex align-items-center justify-content-center">
      <Row className="justify-content-center w-100">
        <Col xs={11} sm={9} md={7} lg={5} xl={4} className="p-0">
          <Card className="login-card shadow-lg">
            
            {/* 1. PANEL SUPERIOR (NARANJA) - Estilo Welcome */}
            <div className="login-header-panel">
                <div className="text-center p-4 pt-5">
                    {/* Reemplazamos el H2 por el logo para branding */}
                    <img 
                        src='https://placehold.co/200x50/FF8A3D/FFFFFF?text=UrbanFix+Logo' 
                        alt="UrbanFix Logo" 
                        className="urbanfix-logo-invert d-block mx-auto mb-3"
                    />
                    <h1 className="welcome-text mb-2">¡Hola!</h1>
                    <p className="welcome-subtext mb-5">
                        Ingresa como administrador o solicita un presupuesto para comenzar tu proyecto.
                    </p>
                    
                    {/* Botón de acción secundaria (simula "Create Account" de la referencia) */}
                    {/* Aquí redirigimos directamente a Solicitar Presupuesto para mantener la función */}
                    <Link to="/solicitar">
                        <Button variant="outline-light" size="lg" className="action-button-header">
                            SOLICITAR PRESUPUESTO
                        </Button>
                    </Link>
                </div>
            </div>
            
            {/* 2. PANEL INFERIOR (FORMULARIO) - Estilo Login */}
            <div className="login-form-panel p-5">
                <h3 className="text-center mb-4 user-login-title">ACCESO ADMINISTRADOR</h3>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                      <Form.Label className="form-label-custom">Correo Electrónico</Form.Label>
                      <Form.Control 
                        type="email" 
                        ref={emailRef} 
                        placeholder="ejemplo@urbanfix.com" 
                        required 
                        size="lg"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formBasicPassword">
                      <Form.Label className="form-label-custom">Contraseña</Form.Label>
                      <Form.Control 
                        type="password" 
                        ref={passwordRef} 
                        placeholder="••••••••" 
                        required 
                        size="lg"
                      />
                    </Form.Group>
                    
                    {/* Utilizamos Stack para apilar los botones principales */}
                    <Stack gap={3}>
                        <Button variant="primary" type="submit" size="lg" className="w-100 login-button-uf">
                            INICIAR SESIÓN
                        </Button>
                        
                        {/* El botón secundario se convierte en texto de 'olvidé mi contraseña' */}
                        <div className="text-center">
                            <Link to="#" className="forgot-password-link">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </Stack>
                </Form>
            </div>
            
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;