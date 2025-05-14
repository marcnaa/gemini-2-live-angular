const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/gemini.controller');

// Ruta para conectar con Gemini
router.post('/connect', geminiController.connect);

// Ruta para desconectar una sesión
router.delete('/disconnect/:sessionId', geminiController.disconnect);

// Ruta para enviar un mensaje
router.post('/message/:sessionId', geminiController.sendMessage);

// Ruta para enviar respuesta de herramienta
router.post('/tool-response/:sessionId', geminiController.sendToolResponse);

// Ruta para establecer stream de eventos
router.get('/stream/:sessionId', geminiController.streamEvents);

// Ruta para obtener audio
router.get('/audio/:sessionId', geminiController.getAudio);

module.exports = router; 