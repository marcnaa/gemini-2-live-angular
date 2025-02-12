import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  MultimodalLiveAPIClientConnection,
  MultimodalLiveClient,
} from './ws-client';
import { Interrupted, LiveConfig, ModelTurn, ServerContent, StreamingLog, TurnComplete } from './types';
import { environment } from '../../src/environments/environment.development';

type ServerContentNullable = ModelTurn | TurnComplete | Interrupted | null;

@Injectable({
  providedIn: 'root',
})
export class MultimodalLiveService implements OnDestroy {
  private wsClient: MultimodalLiveClient;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  connected$ = this.connectedSubject.asObservable();
  private contentSubject = new BehaviorSubject<ServerContentNullable>(null);
  content$ = this.contentSubject.asObservable();
  public config: LiveConfig = {
    model: "models/gemini-2.0-flash-exp",
  };

  private destroy$ = new Subject<void>(); // For unsubscribing

  constructor() {
    const connectionParams: MultimodalLiveAPIClientConnection = {
      url: environment.WS_URL,
      apiKey: environment.API_KEY,
    };
    this.wsClient = new MultimodalLiveClient(connectionParams);
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect(); // Ensure disconnection on service destruction
  }

  private setupEventListeners(): void {
    this.wsClient
      .on('open', () => {
        console.log('WS connection opened');
      })

      .on('log', (log: StreamingLog) => {
        console.log(log);
      })
      .on('content', (data: ServerContent) => {
        this.contentSubject.next(data);
        console.log(data);
      })

      .on('close', (e: CloseEvent) => {
        console.log('WS connection closed', e);
        this.setConnected(false);
      });
  }

  async connect(config: LiveConfig): Promise<void> {
    if (!config) {
      throw new Error('Config has not been set');
    }
    this.wsClient.disconnect();
    try {
      await this.wsClient.connect(config);
      this.setConnected(true);
    } catch (error) {
      console.error('Connection error:', error);
      this.setConnected(false); // Ensure state is updated on error
      throw error; // Re-throw to allow component to handle
    }
  }

  disconnect(): void {
    this.wsClient.disconnect();
    this.setConnected(false);
  }

  private setConnected(connected: boolean): void {
    this.connectedSubject.next(connected);
  }

  async send(message: any): Promise<any> {
    this.wsClient.send(message);
  }
}