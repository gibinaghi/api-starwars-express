require('reflect-metadata');
require('dotenv').config();

const express = require('express');
const { AppDataSource } = require('./config/data-source');
const apiRoutes = require('./routes/api');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

const logger = require('./config/logger');

// Middleware básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Middleware de logging
app.use((req, res, next) => {
    logger.info(`${new Date().toISOString()} - ${req.method} ${req.url}`)
    next();
});

// Inicializar conexión a la base de datos
let dbInitialized = false;

const initializeDatabase = async () => {
    if (!dbInitialized) {
        try {
            if (!AppDataSource.isInitialized) {
                logger.info('Inicializando conexión a la base de datos...');
                await AppDataSource.initialize();
                logger.info('Conexión a la base de datos inicializada correctamente');
            }
            dbInitialized = true;
        } catch (error) {
            logger.error('Error inicializando la base de datos:', error.message);
        }
    }
};

// Middleware para inicializar DB
app.use(async (req, res, next) => {
    try {
        await initializeDatabase();
        next();
    } catch (error) {
        logger.error('Error inicializando la base de datos:', error.message);
        next();
    }
});

// Middleware para estado de DB
app.use((req, res, next) => {
    req.dbStatus = {
        isInitialized: AppDataSource.isInitialized,
        isConnected: AppDataSource.isInitialized && AppDataSource.manager ? true : false
    };
    next();
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Star Wars API Documentation'
}));

// Rutas
app.use('/api', apiRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Star Wars Characters API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
            status: req.dbStatus.isConnected ? 'connected' : 'disconnected',
            type: 'PostgreSQL',
            host: process.env.DB_HOST || 'not configured'
        },
        endpoints: {
            documentation: '/api-docs',
            apiInfo: '/api',
            health: '/api/health',
            fetchExternalData: 'POST /api/external-data',
            getData: 'GET /api/data',
            exportCSV: 'GET /api/export-csv'
        }
    });
});

// Manejo de errores global
app.use((error, req, res, next) => {
    logger.error('Global error handler:', error);
   
    if (error.name === 'QueryFailedError') {
        return res.status(500).json({
            success: false,
            message: 'Database query failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
        });
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(503).json({
            success: false,
            message: 'Database connection failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
        });
    }
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? {
            message: error.message,
            stack: error.stack
        } : 'Something went wrong'
    });
});

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        availableRoutes: [
            'GET /',
            'GET /api-docs',
            'GET /api',
            'GET /api/health', 
            'POST /api/external-data',
            'GET /api/data',
            'GET /api/export-csv'
        ],
        timestamp: new Date().toISOString()
    });
});

module.exports = app;