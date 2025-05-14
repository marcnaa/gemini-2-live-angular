const geminiService = require('../services/gemini.service');
const { v4: uuidv4 } = require('uuid');

// Mapa para almacenar las sesiones activas y sus listeners
const activeSessions = new Map();

// Controlador para las rutas de Gemini
const geminiController = {
  // Iniciar una nueva sesión con Gemini
  async connect(req, res) {
    try {
      const sessionId = uuidv4(); // Genera un nuevo ID de sesión
      const config = req.body.config || undefined;
      
      const result = await geminiService.connect(sessionId, config);
      
      if (result.success) {
        // Almacena el ID de sesión para futuras referencias
        activeSessions.set(sessionId, { createdAt: new Date() });
        
        return res.status(200).json({
          success: true,
          sessionId,
          message: 'Conexión establecida'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'No se pudo establecer conexión',
          error: result.message
        });
      }
    } catch (error) {
      console.error('Error al conectar con Gemini:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al conectar con Gemini',
        error: error.message
      });
    }
  },

  // Desconectar una sesión de Gemini
  async disconnect(req, res) {
    try {
      const { sessionId } = req.params;
      
      if (!activeSessions.has(sessionId)) {
        return res.status(404).json({
          success: false,
          message: 'Sesión no encontrada'
        });
      }
      
      const result = await geminiService.disconnect(sessionId);
      
      if (result.success) {
        activeSessions.delete(sessionId);
        return res.status(200).json({
          success: true,
          message: 'Sesión desconectada correctamente'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Error al desconectar sesión',
          error: result.message
        });
      }
    } catch (error) {
      console.error('Error al desconectar sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al desconectar sesión',
        error: error.message
      });
    }
  },

  // Enviar un mensaje a Gemini
  async sendMessage(req, res) {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;
      
      if (!activeSessions.has(sessionId)) {
        return res.status(404).json({
          success: false,
          message: 'Sesión no encontrada'
        });
      }
      
      const result = await geminiService.sendMessage(sessionId, message);
      
      return res.status(200).json({
        success: true,
        message: 'Mensaje enviado correctamente'
      });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al enviar mensaje',
        error: error.message
      });
    }
  },

  // Enviar una respuesta de herramienta a Gemini
  async sendToolResponse(req, res) {
    try {
      const { sessionId } = req.params;
      const { response } = req.body;
      
      if (!activeSessions.has(sessionId)) {
        return res.status(404).json({
          success: false,
          message: 'Sesión no encontrada'
        });
      }
      
      const result = await geminiService.sendToolResponse(sessionId, response);
      
      return res.status(200).json({
        success: true,
        message: 'Respuesta de herramienta enviada correctamente'
      });
    } catch (error) {
      console.error('Error al enviar respuesta de herramienta:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al enviar respuesta de herramienta',
        error: error.message
      });
    }
  },

  // Establecer una conexión SSE para recibir eventos de Gemini
  async streamEvents(req, res) {
    try {
      const { sessionId } = req.params;
      
      if (!activeSessions.has(sessionId)) {
        return res.status(404).json({
          success: false,
          message: 'Sesión no encontrada'
        });
      }
      
      // Configurar cabeceras para SSE (Server-Sent Events)
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      
      // Función para enviar eventos al cliente
      const sendEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };
      
      // Enviar un evento inicial de conexión
      sendEvent('connected', { message: 'Conexión SSE establecida' });
      
      // Registrar el listener para eventos de WebSocket
      geminiService.registerListener(sessionId, (data) => {
        if (data.type === 'audio') {
          // Para datos binarios (audio), enviamos un evento con un indicador
          sendEvent('audio', { available: true, size: data.data.length });
        } else {
          // Para otros tipos de datos, enviamos el evento directamente
          sendEvent(data.type || 'message', data);
        }
      });
      
      // Manejar cierre de conexión
      req.on('close', () => {
        console.log(`Conexión SSE cerrada para sesión ${sessionId}`);
      });
    } catch (error) {
      console.error('Error al establecer stream de eventos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al establecer stream de eventos',
        error: error.message
      });
    }
  },

  // Obtener los datos de audio para una sesión
  async getAudio(req, res) {
    try {
      const { sessionId } = req.params;
      
      if (!activeSessions.has(sessionId)) {
        return res.status(404).json({
          success: false,
          message: 'Sesión no encontrada'
        });
      }
      
      const audioData = geminiService.audioData.get(sessionId);
      
      if (!audioData) {
        return res.status(404).json({
          success: false,
          message: 'No hay datos de audio disponibles'
        });
      }
      
      // Enviar los datos de audio como respuesta binaria
      res.setHeader('Content-Type', 'audio/wav');
      res.send(audioData);
      
      // Limpiar los datos de audio después de enviarlos
      geminiService.audioData.delete(sessionId);
    } catch (error) {
      console.error('Error al obtener datos de audio:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener datos de audio',
        error: error.message
      });
    }
  }
};

module.exports = geminiController; 