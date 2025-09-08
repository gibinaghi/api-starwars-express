const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Star Wars Characters API',
            version: '1.0.0',
            description: 'API para gestionar personajes de Star Wars obtenidos desde SWAPI',
            contact: {
                name: 'API Support',
                email: 'support@starwarsapi.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desarrollo'
            }
        ],
        components: {
            schemas: {
                Character: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Luke Skywalker' },
                        height: { type: 'string', example: '172' },
                        mass: { type: 'string', example: '77' },
                        hair_color: { type: 'string', example: 'blond' },
                        skin_color: { type: 'string', example: 'fair' },
                        eye_color: { type: 'string', example: 'blue' },
                        birth_year: { type: 'string', example: '19BBY' },
                        gender: { type: 'string', example: 'male' },
                        homeworld: { type: 'string', example: 'Tatooine' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string'},
                        data: { type: 'object' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        error: { type: 'string' }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js', './src/app.js']
};

const specs = swaggerJSDoc(options);

module.exports = {
    swaggerUi,
    specs
};