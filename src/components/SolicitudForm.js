// urbanfix-backend/server.js

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
// Importa las credenciales de la cuenta de servicio (asegúrate que este archivo está lleno)
const credentials = require('./credentials.json'); 

const app = express();
// 🌟 Usar el puerto del hosting (Render) o 3000 si es local
const PORT = process.env.PORT || 3000; 

// 🚨 VARIABLES CRÍTICAS (SINCRONIZADAS) 🚨
const SPREADSHEET_ID = '1cWAvN_DOG5U1vr-jg2_5YD19W1Vrt6CJxYRvTHCmtOs'; 
// 🌟 SINCRONIZACIÓN 1: El rango ahora empieza en A4 (Encabezados) y va hasta la O (Pago Recibido)
const SHEET_RANGE = 'Respuestas de formulario 1!A4:O'; 

// 🌟 CAMBIO FINAL: Configuración de CORS para producción
const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:3001',
    'http://localhost:5173',
    // 🌟 AÑADIDA TU URL DE VERCEL (FRONTEND PÚBLICO)
    'https://urbanfix-frontend.vercel.app',
    'https://urbanfix-frontend-kfv4.vercel.app', // <-- Tu URL pública
    'https://urbanfix-frontend-p1dfdw0j4-urbanfix01s-projects.vercel.app' // <-- La URL "Deployment"
];

app.use(cors({
    origin: function (origin, callback) {
        // Permite apps sin origen (como Postman) O las que están en la lista
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS no permitido para este origen'));
        }
    }
})); 
app.use(express.json());

// ---------------------------------------------
// Configuración de Autenticación de Google Sheets
// ---------------------------------------------
const auth = new google.auth.GoogleAuth({
    credentials,
    // 🌟 PERMISO DE LECTURA Y ESCRITURA
    scopes: ['https://www.googleapis.com/auth/spreadsheets'], 
});
const sheets = google.sheets({ version: 'v4', auth });

// ---------------------------------------------
// RUTA API: Obtener Solicitudes de Google Sheets
// ---------------------------------------------
app.get('/api/solicitudes-sheet', async (req, res) => {
    try {
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_RANGE,
        });

        const sheetRows = response.data.values || [];
        
        if (sheetRows.length > 0) { 
             // Fila 4 (índice 0 de sheetRows) son los encabezados
             const headers = sheetRows[0].map(h => 
                h.toLowerCase()
                 .replace(/\s+/g, '_')
                 .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                 .replace(/[^a-z0-9_]/g, '')
             );
             
             // Fila 5 en adelante (índice 1+) son los datos
             const data = sheetRows.slice(1).map((row, rowIndex) => {
                 let obj = {
                     id: `sheet-${rowIndex + 1}`,
                     // 🌟 SINCRONIZACIÓN 2: El índice real de la fila en Sheets es (rowIndex + 5)
                     // (rowIndex 0 es la Fila 5, rowIndex 1 es la Fila 6)
                     sheetRowIndex: rowIndex + 5, 
                 };
                 headers.forEach((header, index) => {
                     obj[header] = row[index] !== undefined ? row[index] : ''; 
                 });
                 return obj;
             });

             return res.status(200).json({ solicitudes: data });
        }

        return res.status(200).json({ solicitudes: [] });

    } catch (error) {
        console.error('--- ERROR DETECTADO (Solicitudes Sheet) ---');
        console.error(error); 
        console.error('-----------------------');
        return res.status(500).json({ error: 'Fallo de conexión o permisos: Revisa si compartiste la Hoja y que el nombre de la pestaña sea correcto.' });
    }
});

// ---------------------------------------------
// RUTA API: Resumen para el Dashboard
// ---------------------------------------------
app.get('/api/dashboard-summary', async (req, res) => {
    try {
        // 1. Obtener los datos (misma lógica que la ruta de solicitudes)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_RANGE, // Usa el mismo rango A4:O
        });
        const sheetRows = response.data.values || [];
        let solicitudesData = []; 

        if (sheetRows.length > 1) {
             const headers = sheetRows[0].map(h => 
                 h.toLowerCase()
                 .replace(/\s+/g, '_')
                 .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                 .replace(/[^a-z0-9_]/g, '')
             );
             
             solicitudesData = sheetRows.slice(1).map((row) => {
                 let obj = {};
                 headers.forEach((header, index) => {
                     obj[header] = row[index] !== undefined ? row[index] : ''; 
                 });
                 return obj;
             });
        

            // 2. Calcular las estadísticas
            const normalizeState = (estado) => (estado?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || 'PENDIENTE');
            
            let total = solicitudesData.length;
            let pendientes = 0;
            let finalizadas = 0;

            solicitudesData.forEach(solicitud => {
                const estado = normalizeState(solicitud.estado); 
                
                if (estado === 'PENDIENTE' || estado === 'NUEVO' || estado === 'COTIZADO' || estado === 'EN PROCESO' || estado === 'ACEPTADO' || estado === 'VISITA COTIZADA' || estado === 'VISITA AGENDADA' || estado === 'COTIZADO (PV)') {
                    pendientes++;
                } else if (estado === 'FINALIZADO' || estado === 'CERRADO') { 
                    finalizadas++;
                }
            });

            // 3. Devolver el resumen
            return res.status(200).json({
                total: total,
                pendientes: pendientes,
                finalizadas: finalizadas
            });
        
        } else {
             return res.status(200).json({ total: 0, pendientes: 0, finalizadas: 0 });
        }

    } catch (error) {
        console.error('--- ERROR DETECTADO (Dashboard Summary) ---');
        console.error(error); 
        console.error('-----------------------');
        return res.status(500).json({ error: 'Fallo al calcular el resumen.' });
    }
});

// ---------------------------------------------
// RUTA 'PATCH': Actualizar Estado y Monto (Sincronizada)
// ---------------------------------------------
app.patch('/api/update-solicitud', async (req, res) => {
    // 1. Obtenemos los 3 valores del Frontend
    const { sheetRowIndex, newStatus, newMonto } = req.body;

    // 🌟 2. Definimos las columnas (basado en image_a1e304.png)
    const ESTADO_COLUMN = 'J';  // <--- ¡CORREGIDO! (Estado es J)
    const MONTO_COLUMN = 'L'; // 'MONTO_COTIZADO'
    const SHEET_NAME = 'Respuestas de formulario 1';

    console.log(`Intentando actualizar Fila: ${sheetRowIndex}. Estado (Col J): ${newStatus}, Monto (Col L): ${newMonto}`);

    try {
        // 3. Usamos batchUpdate para múltiples celdas
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                valueInputOption: 'USER_ENTERED',
                data: [
                    {
                        // Paquete 1: Actualizar el ESTADO
                        range: `${SHEET_NAME}!${ESTADO_COLUMN}${sheetRowIndex}`,
                        values: [[newStatus]],
                    },
                    {
                        // Paquete 2: Actualizar el MONTO
                        range: `${SHEET_NAME}!${MONTO_COLUMN}${sheetRowIndex}`,
                        values: [[newMonto]],
                    }
                ]
            }
        });
        
        res.status(200).json({ success: true, message: `Fila ${sheetRowIndex} actualizada.` });
    
    } catch (error) {
        console.error('--- ERROR DETECTADO (Update Solicitud) ---');
        console.error(error);
        console.error('-----------------------');
        res.status(500).json({ error: 'No se pudo actualizar la Hoja de Google. ¿Tienes permisos de "Editor"?' });
    }
});

// ---------------------------------------------
// NUEVA RUTA 'POST': Crear Nueva Solicitud (Implementada)
// ---------------------------------------------
app.post('/api/crear-solicitud', async (req, res) => {
    // 1. Obtenemos los datos del formulario (del req.body)
    const { nombre_apellido, telefono, direccion, categoria_trabajo, descripcion_problema, urgencia, ventanas_horarias } = req.body;

    // 2. Definimos la hoja y creamos la marca temporal
    const SHEET_NAME = 'Respuestas de formulario 1';
    const marcaTemporal = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }); // Formato local
    const estadoInicial = 'NUEVO'; 
    const linkFotos = ''; 

    // 3. Preparamos la fila en el orden exacto de tu Google Sheet (A hasta O)
    // (Basado en image_a1e304.png)
    const newRow = [
        marcaTemporal,                  // A: MARCA_TEMPORAL
        nombre_apellido || '',          // B: NOMBRE_APELLIDO
        telefono || '',                 // C: TELEFONO
        direccion || '',                // D: DIRECCIÓN
        categoria_trabajo || '',        // E: CATEGORIA_TRABAJO
        descripcion_problema || '',     // F: DESCRIPCIÓN_PROBLEMA
        linkFotos,                      // G: FOTOS_VIDEOS
        urgencia || '',                 // H: URGENCIA
        ventanas_horarias || '',        // I: VENTANAS_HORARIAS (Viene como string CSV)
        estadoInicial,                  // J: ESTADO
        '',                             // K: PRESUPUESTO
        '',                             // L: MONTO_COTIZADO
        '',                             // M: LINK_PAGO
        '',                             // N: NOTAS
        ''                              // O: PAGO_RECIBIDO
    ];

    try {
        // 4. Usamos 'append' para añadir la fila al final de la hoja
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:O`, 
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [newRow],
            },
        });
        
        res.status(201).json({ success: true, message: 'Solicitud creada exitosamente.' });
    
    } catch (error) {
        console.error('--- ERROR DETECTADO (Crear Solicitud) ---');
        console.error(error);
        console.error('-----------------------');
        res.status(500).json({ error: 'No se pudo crear la solicitud en Google Sheets.' });
    }
});


// --- Ruta de Prueba ---
app.get('/', (req, res) => {
    res.send('Servidor de UrbanFix Backend en funcionamiento.');
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
});