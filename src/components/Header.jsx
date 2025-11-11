// src/components/Header.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { useAuth } from '../AuthContext'; 
import { auth } from '../firebase'; 

function AdminHeader() {
    const { currentUser } = useAuth(); 
    const navigate = useNavigate();
    
    // Función de Cerrar Sesión (MIGRADA desde Dashboard)
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login'); 
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // Si el usuario no está logueado, no renderiza nada (ya que App.js lo llamará condicionalmente)
    if (!currentUser) {
        return null;
    }

    return (
        // Usamos la clase de la barra naranja que ya tenías
        <Navbar expand="lg" className="dashboard-navbar" data-bs-theme="dark" style={{ backgroundColor: '#ff7f41' }}>
            <Container fluid className="px-4">
                
                {/* 1. Logo y Título de Marca */}
                <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
                    <img 
                        src="/logo.png" 
                        alt="Urbanfix Logo" 
                        style={{ height: '35px', marginRight: '10px' }} 
                    />
                    {/* Texto Admin (Opcional, si quieres que se vea) */}
                    <span className="fw-bold text-light">Admin</span> 
                </Navbar.Brand>

                {/* 2. Enlaces de Navegación (Dashboard y Solicitudes) */}
                <Navbar.Toggle aria-controls="admin-navbar-nav" />
                <Navbar.Collapse id="admin-navbar-nav">
                    <Nav className="me-auto"> {/* 'me-auto' mueve los enlaces a la izquierda */}
                        <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/solicitudes">Solicitudes</Nav.Link>
                    </Nav>
                    
                    {/* 3. Información de Sesión y Logout */}
                    <Nav className="d-flex align-items-center">
                        <Nav.Item className="text-light me-3">
                            <small>Conectado como:</small> <strong>{currentUser.email}</strong>
                        </Nav.Item>
                        <Button 
                            variant="outline-light" 
                            onClick={handleLogout}
                            size="sm"
                            className="logout-button-uf"
                        >
                            Cerrar Sesión
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default AdminHeader;