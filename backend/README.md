# Backend para Gemini 2 Live

Este es el backend para la aplicación Gemini 2 Live, que proporciona una API REST para interactuar con Gemini 2 de Google.

## Estructura del proyecto

```
backend/
├── src/
│   ├── config/             # Configuración de la aplicación
│   ├── controllers/        # Controladores de las rutas
│   ├── models/             # Modelos de datos
│   ├── routes/             # Definición de rutas
│   ├── services/           # Servicios de la aplicación
│   ├── utils/              # Utilidades
│   └── index.js            # Punto de entrada de la aplicación
├── .env.example            # Ejemplo de variables de entorno
└── package.json           # Dependencias del proyecto
```

## Configuración

1. Copia el archivo `.env.example` a `.env` y configura las variables de entorno:
   - `PORT`: Puerto en el que se ejecutará el servidor (por defecto: 3000)
   - `API_KEY`: Clave de API para Gemini
   - `WS_URL`: URL del WebSocket de Gemini

## Instalación

```bash
npm install
```

## Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## API Endpoints

### Sesiones

- `POST /api/gemini/connect`: Inicia una nueva sesión con Gemini
- `DELETE /api/gemini/disconnect/:sessionId`: Finaliza una sesión existente

### Mensajes

- `POST /api/gemini/message/:sessionId`: Envía un mensaje a Gemini
- `POST /api/gemini/tool-response/:sessionId`: Envía una respuesta de herramienta a Gemini

### Eventos

- `GET /api/gemini/stream/:sessionId`: Establece una conexión SSE para recibir eventos
- `GET /api/gemini/audio/:sessionId`: Obtiene datos de audio de Gemini 