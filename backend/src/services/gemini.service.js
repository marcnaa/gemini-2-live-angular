const WebSocket = require('ws');
const geminiConfig = require('../config/gemini.config');

class GeminiService {
  constructor() {
    this.wsConnections = new Map(); // Almacena las conexiones de WebSocket por sessionId
    this.audioData = new Map(); // Almacena los datos de audio por sessionId
    console.log('GeminiService inicializado con configuración:', {
      WS_URL: geminiConfig.WS_URL,
      API_KEY: geminiConfig.API_KEY ? 'CONFIGURADA' : 'NO CONFIGURADA',
    });
  }

  // Establece una conexión WebSocket con Gemini
  async connect(sessionId, config = geminiConfig.defaultConfig) {
    if (this.wsConnections.has(sessionId)) {
      await this.disconnect(sessionId);
    }

    console.log(`Intentando conectar a Gemini para sesión ${sessionId}...`);
    console.log('URL:', geminiConfig.WS_URL);
    console.log('Configuración:', JSON.stringify(config, null, 2));

    try {
      const ws = new WebSocket(geminiConfig.WS_URL, {
        headers: {
          'x-api-key': geminiConfig.API_KEY
        }
      });

      return new Promise((resolve, reject) => {
        ws.on('open', () => {
          console.log(`WebSocket conectado para sesión ${sessionId}`);
          // Envía la configuración inicial
          const initMessage = {
            type: 'open',
            data: config
          };
          console.log('Enviando mensaje de inicio:', JSON.stringify(initMessage, null, 2));
          ws.send(JSON.stringify(initMessage));
          
          this.wsConnections.set(sessionId, ws);
          resolve({ success: true, message: 'Conectado' });
        });

        ws.on('error', (err) => {
          console.error(`Error en WebSocket para sesión ${sessionId}:`, err);
          reject({ success: false, message: 'Error de conexión', error: err.message });
        });

        ws.on('close', (code, reason) => {
          console.log(`WebSocket cerrado para sesión ${sessionId}:`, code, reason);
          this.wsConnections.delete(sessionId);
        });

        // Recibir mensajes iniciales
        ws.on('message', (data) => {
          try {
            const parsedData = JSON.parse(data);
            console.log(`Mensaje recibido inicial para sesión ${sessionId}:`, parsedData);
          } catch (error) {
            // Podría ser binario
            console.log(`Datos binarios recibidos para sesión ${sessionId}, longitud:`, data.length);
          }
        });

        // Establecer un timeout en caso de que la conexión nunca se abra
        setTimeout(() => {
          if (!this.wsConnections.has(sessionId)) {
            console.error(`Timeout alcanzado para sesión ${sessionId}`);
            reject({ success: false, message: 'Timeout de conexión' });
          }
        }, 10000);
      });
    } catch (error) {
      console.error(`Error al conectar para sesión ${sessionId}:`, error);
      throw { success: false, message: 'Error de conexión', error: error.message };
    }
  }

  // Desconecta una sesión de WebSocket
  async disconnect(sessionId) {
    const ws = this.wsConnections.get(sessionId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(sessionId);
      return { success: true, message: 'Desconectado' };
    }
    return { success: false, message: 'No hay conexión activa' };
  }

  // Envía un mensaje a Gemini
  async sendMessage(sessionId, message) {
    const ws = this.wsConnections.get(sessionId);
    if (!ws) {
      throw { success: false, message: 'No hay conexión activa' };
    }

    try {
      ws.send(JSON.stringify({
        type: 'message',
        data: message
      }));
      return { success: true, message: 'Mensaje enviado' };
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw { success: false, message: 'Error al enviar mensaje', error: error.message };
    }
  }

  // Envía una respuesta a una llamada de herramienta
  async sendToolResponse(sessionId, response) {
    const ws = this.wsConnections.get(sessionId);
    if (!ws) {
      throw { success: false, message: 'No hay conexión activa' };
    }

    try {
      ws.send(JSON.stringify({
        type: 'toolResponse',
        data: response
      }));
      return { success: true, message: 'Respuesta de herramienta enviada' };
    } catch (error) {
      console.error('Error al enviar respuesta de herramienta:', error);
      throw { success: false, message: 'Error al enviar respuesta de herramienta', error: error.message };
    }
  }

  // Registra un listener para eventos de WebSocket
  registerListener(sessionId, eventCallback) {
    const ws = this.wsConnections.get(sessionId);
    if (!ws) {
      console.error(`No hay conexión activa para la sesión ${sessionId}`);
      throw { success: false, message: 'No hay conexión activa' };
    }

    console.log(`Registrando listener para sesión ${sessionId}`);
    
    ws.on('message', (data) => {
      try {
        const parsedData = JSON.parse(data);
        console.log(`Mensaje recibido para sesión ${sessionId}:`, parsedData.type || 'sin tipo');
        eventCallback(parsedData);
      } catch (error) {
        console.log(`Error al procesar mensaje para sesión ${sessionId}:`, error.message);
        // Podría ser un mensaje binario (audio)
        if (data instanceof Buffer) {
          console.log(`Recibidos datos de audio para sesión ${sessionId}, longitud:`, data.length);
          this.audioData.set(sessionId, data);
          eventCallback({ type: 'audio', data });
        }
      }
    });

    return { success: true, message: 'Listener registrado' };
  }
}

module.exports = new GeminiService(); 