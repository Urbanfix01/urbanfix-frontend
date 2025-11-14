// src/services/api.js

// Detecta si estamos en localhost o en prod
const BASE_URL = process.env.REACT_APP_API_URL;

// Función auxiliar para manejar errores comunes
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error ${response.status}`);
  }
  return await response.json();
};

// --- ENDPOINTS ---

// 1. Obtener todas las solicitudes (Para solicitudes.js)
export const getSolicitudes = async () => {
  const response = await fetch(`${BASE_URL}/api/solicitudes-sheet`);
  return handleResponse(response);
};

// 2. Obtener resumen (Para Dashboard.js)
export const getDashboardSummary = async () => {
  const response = await fetch(`${BASE_URL}/api/dashboard-summary`);
  return handleResponse(response);
};

// 3. Crear solicitud (Para SolicitudForm.js)
export const createSolicitud = async (data) => {
  const response = await fetch(`${BASE_URL}/api/crear-solicitud`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// 4. Actualizar solicitud (Posible uso futuro en Dashboard o lista)
export const updateSolicitud = async (id, data) => {
  const response = await fetch(`${BASE_URL}/api/update-solicitud`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, ...data }),
  });
  return handleResponse(response);
};

// 5. Eliminar solicitud
export const deleteSolicitud = async (id) => {
  const response = await fetch(`${BASE_URL}/api/eliminar-solicitud`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });
  return handleResponse(response);
};