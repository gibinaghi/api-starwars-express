const app = require('./src/app');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        app.listen(PORT, () => {
            logger.info('='.repeat(50));
            logger.info('Star Wars API Server iniciado');
            logger.info('='.repeat(50));
            logger.info(`URL: http://localhost:${PORT}`);
            logger.info(`Swagger UI: http://localhost:${PORT}/api-docs`);
            logger.info(`API Info: http://localhost:${PORT}/api`);
            logger.info(`Health: http://localhost:${PORT}/api/health`);
            logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
            logger.info('='.repeat(50));
        });
    } catch (error) {
        logger.error('Error iniciando el servidor:', error);
        process.exit(1);
    }
};

// Manejo de shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT recibido, cerrando servidor...');
    process.exit(0);
});

startServer();