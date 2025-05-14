require('dotenv').config();
const express = require('express');
const cors = require('cors');
const geminiRoutes = require('./routes/gemini.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración CORS más detallada
const corsOptions = {
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging para debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/gemini', geminiRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Gemini 2 Live funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 