const express = require('express');
const { DataController } = require('../controllers/dataController');

const router = express.Router();
const dataController = new DataController();

// Middleware para logging
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Chequea el estado de la API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * @swagger
 * /api/external-data:
 *   post:
 *     summary: Obtiene personajes de SWAPI y los almacena en la base de datos
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: Characters fetched and saved successfully
 */
router.post('/external-data', async (req, res) => {
    await dataController.fetchExternalData(req, res);
});

/**
 * @swagger
 * /api/data:
 *   get:
 *     summary: Obtiene información de los personajes almacenados (paginado)
 *     tags: [Characters]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number to retrieve
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         description: Number of characters per page
 *     responses:
 *       200:
 *         description: List of characters and statistics
 */
router.get('/data', async (req, res) => {
    await dataController.getData(req, res);
});

/**
 * @swagger
 * /api/export-csv:
 *   get:
 *     summary: Exporta todos los personajes almacenados en un archivo CSV
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: CSV file download
 */
router.get('/export-csv', async (req, res) => {
    await dataController.exportCSV(req, res);
});

// Ruta para obtener información de la API
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Star Wars Characters API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /api/health',
            fetchData: 'POST /api/external-data',
            getData: 'GET /api/data',
            exportCSV: 'GET /api/export-csv'
        },
        documentation: {
            'POST /api/external-data': 'Fetches characters from SWAPI and stores them in the database',
            'GET /api/data': 'Returns stored characters with statistics',
            'GET /api/export-csv': 'Downloads a CSV file with all stored characters'
        }
    });
});

// Manejo de rutas no encontradas
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: [
            'GET /api/health',
            'POST /api/external-data',
            'GET /api/data',
            'GET /api/export-csv'
        ]
    });
});

module.exports = router;