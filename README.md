# Star Wars Characters API

Una API serverless construida con Node.js, Express, TypeORM y PostgreSQL que consume la API de Star Wars y permite gestionar datos de personajes con funcionalidades de exportación a CSV.

## 🚀 Características

- **API REST** con endpoints para gestión de datos
- **Consumo de API externa** (Star Wars API)
- **Base de datos PostgreSQL** con TypeORM
- **Generación de archivos CSV** descargables
- **Estadísticas** de datos almacenados

## 📋 Requisitos Previos

- Node.js 18.x o superior
- PostgreSQL 12.x o superior
- NPM 

## 📦 Instalación

1. **Clonar el repositorio**:
```bash
git clone <repository-url>
cd api-starwars-api-express
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DATABASE=starwars_db
NODE_ENV=development
PORT=3000
```

4. **Crear la base de datos**:
```bash
# Conectar a PostgreSQL y crear la base de datos
createdb starwars_db
```

## 🏃‍♂️ Ejecución

### Desarrollo Local

```bash
# Modo desarrollo con nodemon
npm run dev
```

La API estará disponible en `http://localhost:3000`
Swagger disponible en `http://localhost:3000/api-docs`

## 📚 Endpoints de la API

### Base URL
- **Local**: `http://localhost:3000`

### Endpoints Disponibles

#### 1. Health Check
```http
GET /api/health
```
Verifica el estado de la API y crea la tabla necesaria.

**Respuesta**:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

#### 2. Consumir API Externa
```http
POST /api/external-data
```
Consume la API de Star Wars y almacena los datos en la base de datos.

#### 3. Obtener Datos
```http
GET /api/data
```
Devuelve todos los personajes almacenados con estadísticas.

#### 4. Exportar CSV
```http
GET /api/export-csv
```
Genera y descarga un archivo CSV con todos los personajes.
