import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { LiveConfig } from '../../gemini/types';
import { Part } from '@google/generative-ai';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  private apiUrl = environment.apiUrl + '/gemini';
  private sessionId: string | null = null;
  private eventSource: EventSource | null = null;
  
  // Subjects para los distintos eventos
  private connectedSubject = new BehaviorSubject<boolean>(false);
  connected$ = this.connectedSubject.asObservable();
  
  private contentSubject = new BehaviorSubject<any>(null);
  content$ = this.contentSubject.asObservable();
  
  private toolSubject = new BehaviorSubject<any>(null);
  tool$ = this.toolSubject.asObservable();
  
  private volumeSubject = new BehaviorSubject<number>(0);
  volume$ = this.volumeSubject.asObservable();
  
  private audioSubject = new Subject<ArrayBuffer>();
  audio$ = this.audioSubject.asObservable();
  
  constructor(private http: HttpClient) { }
  
  /**
   * Conecta con el backend y establece una sesión de Gemini
   */
  async connect(config?: LiveConfig): Promise<void> {
    // Si ya hay una conexión activa, desconectamos primero
    if (this.sessionId) {
      await this.disconnect();
    }
    
    console.log('Intentando conectar al backend:', `${this.apiUrl}/connect`);
    console.log('Config:', config);
    
    try {
      // Cambiamos .toPromise() porque está deprecado en rxjs reciente
      const response: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/connect`, { config })
      );
      
      console.log('Respuesta del backend:', response);
      
      if (response.success && response.sessionId) {
        this.sessionId = response.sessionId;
        this.connectedSubject.next(true);
        console.log('Conexión establecida, sessionId:', this.sessionId);
        
        // Establecer conexión SSE para recibir eventos
        this.setupEventSource();
      } else {
        throw new Error(response.message || 'Error al conectar');
      }
    } catch (error) {
      console.error('Error al conectar con el backend:', error);
      this.connectedSubject.next(false);
      throw error;
    }
  }
  
  /**
   * Desconecta la sesión actual de Gemini
   */
  async disconnect(): Promise<void> {
    if (!this.sessionId) {
      return;
    }
    
    try {
      // Cerrar la conexión SSE si existe
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/disconnect/${this.sessionId}`)
      );
      this.sessionId = null;
      this.connectedSubject.next(false);
    } catch (error) {
      console.error('Error al desconectar:', error);
      throw error;
    }
  }
  
  /**
   * Envía un mensaje a Gemini
   */
  async send(message: Part | Part[]): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No hay una sesión activa');
    }
    
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/message/${this.sessionId}`, { message })
      );
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }
  
  /**
   * Envía una respuesta de herramienta a Gemini
   */
  async sendToolResponse(response: any): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No hay una sesión activa');
    }
    
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/tool-response/${this.sessionId}`, { response })
      );
    } catch (error) {
      console.error('Error al enviar respuesta de herramienta:', error);
      throw error;
    }
  }
  
  /**
   * Configura la conexión SSE para recibir eventos del backend
   */
  private setupEventSource(): void {
    if (!this.sessionId) {
      return;
    }
    
    // Crear conexión SSE
    this.eventSource = new EventSource(`${this.apiUrl}/stream/${this.sessionId}`);
    
    // Configurar manejadores de eventos
    this.eventSource.addEventListener('connected', (event: any) => {
      console.log('Conexión SSE establecida:', JSON.parse(event.data));
    });
    
    this.eventSource.addEventListener('content', (event: any) => {
      const data = JSON.parse(event.data);
      this.contentSubject.next(data);
    });
    
    this.eventSource.addEventListener('toolcall', (event: any) => {
      const data = JSON.parse(event.data);
      this.toolSubject.next(data);
    });
    
    this.eventSource.addEventListener('audio', (event: any) => {
      const data = JSON.parse(event.data);
      if (data.available) {
        // Obtener los datos de audio mediante una petición HTTP
        this.fetchAudioData();
      }
    });
    
    // Manejo de errores
    this.eventSource.onerror = (error) => {
      console.error('Error en la conexión SSE:', error);
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      this.connectedSubject.next(false);
    };
  }
  
  /**
   * Obtiene los datos de audio del backend
   */
  private async fetchAudioData(): Promise<void> {
    if (!this.sessionId) {
      return;
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/audio/${this.sessionId}`);
      if (response.ok) {
        const audioData = await response.arrayBuffer();
        this.audioSubject.next(audioData);
      }
    } catch (error) {
      console.error('Error al obtener datos de audio:', error);
    }
  }
} 