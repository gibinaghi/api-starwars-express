const axios = require('axios');
const logger = require('../config/logger');

class ExternalAPIService {
    constructor() {
        this.baseURL = 'https://swapi.py4e.com/api';
    }

    async getAllCharacters() {
        try {
            const characters = [];
            let nextUrl = `${this.baseURL}/people/`;

            while (nextUrl) {
                const response = await axios.get(nextUrl);
                characters.push(...response.data.results);
                nextUrl = response.data.next;
                
                // Limitar a las primeras 2 páginas para evitar demasiadas llamadas
                if (characters.length >= 20) break;
            }

            return characters;
        } catch (error) {
            logger.error('Error llamando a la API:', error.message);
            throw new Error('Falla en la llamada a la API');
        }
    }

    async getCharacterById(id) {
        try {
            const response = await axios.get(`${this.baseURL}/people/${id}/`);
            return response.data;
        } catch (error) {
            logger.error('Error llamando a la API para el personaje:', error.message);
            throw new Error(`Falla en la llamada a la API para el personaje ${id}`);
        }
    }

    async getHomeworld(url) {
        try {
            const response = await axios.get(url);
            return response.data.name == 'unknown' ? null : response.data.name;
        } catch (error) {
            logger.error('Error llamando a la API para el planeta:', error.message);
            return null;
        }
    }

    async enrichCharacterData(character) {
        try {
            const homeworldName = await this.getHomeworld(character.homeworld);
            
            return {
                name: character.name,
                height: character.height == 'unknown' ? null : character.height,
                mass: character.mass == 'unknown' ? null : character.mass,
                hair_color: character.hair_color == 'unknown' ? null : character.hair_color,
                skin_color: character.skin_color == 'unknown' ? null : character.skin_color,
                eye_color: character.eye_color == 'unknown' ? null : character.eye_color,
                birth_year: character.birth_year == 'unknown' ? null : character.birth_year,
                gender: character.gender == 'unknown' ? null : character.gender,
                homeworld: homeworldName,
                url: character.url == 'unknown' ? null : character.url,
            };
        } catch (error) {
            logger.error('Error agregando datos adicionales al personaje:', error.message);
            return {
                name: character.name,
                height: character.height,
                mass: character.mass,
                hair_color: character.hair_color,
                skin_color: character.skin_color,
                eye_color: character.eye_color,
                birth_year: character.birth_year,
                gender: character.gender,
                homeworld: null,
                url: character.url
            };
        }
    }
}

module.exports = { ExternalAPIService };