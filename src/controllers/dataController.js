const { AppDataSource } = require('../config/data-source');
const { Character } = require('../models/Character');
const { ExternalAPIService } = require('../services/externalAPI');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

class DataController {
    constructor() {
        this.externalAPI = new ExternalAPIService();
    }

    async fetchExternalData(req, res) {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }

            const characterRepository = AppDataSource.getRepository(Character);
            
            // Obtener datos de la API externa
            const characters = await this.externalAPI.getAllCharacters();
            
            // Procesar los datos
            const enrichedCharacters = [];
            for (const character of characters) {
                const enrichedData = await this.externalAPI.enrichCharacterData(character);
                enrichedCharacters.push(enrichedData);
            }

            // Guardar en la base de datos
            const savedCharacters = [];
            for (const characterData of enrichedCharacters) {
                // Verificar si el personaje ya existe
                const existingCharacter = await characterRepository.findOne({
                    where: { name: characterData.name }
                });

                if (!existingCharacter) {
                    const character = characterRepository.create(characterData);
                    const savedCharacter = await characterRepository.save(character);
                    savedCharacters.push(savedCharacter);
                }
            }

            res.status(200).json({
                success: true,
                message: `Llamado a la API externa exitoso. Se guardaron ${savedCharacters.length} personajes`,
                data: {
                    totalFetched: enrichedCharacters.length,
                    newCharacters: savedCharacters.length,
                    characters: savedCharacters
                }
            });

        } catch (error) {
            logger.error('Error llamando a la API externa:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error al lamar a la API externa',
                error: error.message
            });
        }
    }

    async getData(req, res) {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }

            const characterRepository = AppDataSource.getRepository(Character);
            
            // Leer parámetros de paginación de la query
            const page = parseInt(req.query.page) || 1;  // página actual, por defecto 1
            const limit = parseInt(req.query.limit) || 10; // cantidad de registros por página, por defecto 10
            const offset = (page - 1) * limit;

            // Contar total de personajes en la BD
            const totalCharacters = await characterRepository.count();

            // Obtener personajes de la página actual
            const characters = await characterRepository.find({
                order: { created_at: 'DESC' },
                skip: offset,
                take: limit
            });

            // Calcular estadísticas sobre la página actual
            const stats = {
                totalInPage: characters.length,
                genderDistribution: this.calculateGenderDistribution(characters),
                homeworldDistribution: this.calculateHomeworldDistribution(characters),
                averageHeight: this.calculateAverageHeight(characters)
            };

            res.status(200).json({
                success: true,
                message: 'Datos recuperados exitosamente',
                data: {
                    characters,
                    statistics: stats
                }
            });

        } catch (error) {
            logger.error('Error recuperando los datos:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error recuperando los datos',
                error: error.message
            });
        }
    }

    async exportCSV(req, res) {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }

            const characterRepository = AppDataSource.getRepository(Character);
            const characters = await characterRepository.find({
                order: { created_at: 'DESC' }
            });

            if (characters.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No hay datos disponibles para exportar'
                });
            }

            // Crear archivo CSV temporal
            const fileName = `characters_${Date.now()}.csv`;
            const filePath = path.join('/tmp', fileName);

            const csvWriter = createCsvWriter({
                path: filePath,
                header: [
                    { id: 'id', title: 'ID' },
                    { id: 'name', title: 'Name' },
                    { id: 'height', title: 'Height' },
                    { id: 'mass', title: 'Mass' },
                    { id: 'hair_color', title: 'Hair Color' },
                    { id: 'skin_color', title: 'Skin Color' },
                    { id: 'eye_color', title: 'Eye Color' },
                    { id: 'birth_year', title: 'Birth Year' },
                    { id: 'gender', title: 'Gender' },
                    { id: 'homeworld', title: 'Homeworld' },
                    { id: 'created_at', title: 'Created At' }
                ]
            });

            await csvWriter.writeRecords(characters);

            // Configurar headers para descarga
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

            // Enviar archivo
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);

            // Eliminar archivo temporal después de enviarlo
            fileStream.on('end', () => {
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error eliminando el archivo CSV:', err);
                });
            });

        } catch (error) {
            logger.error('Error exportando los datos:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error exportando los datos',
                error: error.message
            });
        }
    }

    // Calcula cantidad de personajes por genero
    calculateGenderDistribution(characters) {
        const distribution = {};
        characters.forEach(character => {
            const gender = character.gender || null;
            distribution[gender] = (distribution[gender] || 0) + 1;
        });
        return distribution;
    }

    // Calcula cantidad de personajes por planeta
    calculateHomeworldDistribution(characters) {
        const distribution = {};
        characters.forEach(character => {
            const homeworld = character.homeworld || null;
            distribution[homeworld] = (distribution[homeworld] || 0) + 1;
        });
        return distribution;
    }

    // Calcula la altura media
    calculateAverageHeight(characters) {
        const validHeights = characters
            .map(c => parseInt(c.height))
            .filter(h => !isNaN(h));
        
        if (validHeights.length === 0) return 0;
        
        const sum = validHeights.reduce((a, b) => a + b, 0);
        return Math.round(sum / validHeights.length);
    }
}

module.exports = { DataController };