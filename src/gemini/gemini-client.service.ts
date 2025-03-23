import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  MultimodalLiveAPIClientConnection,
  MultimodalLiveClient,
} from './ws-client';
import { Interrupted, ModelTurn, ServerContent, StreamingLog, ToolCall, ToolCallCancellation, TurnComplete } from './types';
import { environment } from '../../src/environments/environment.development';

import { AudioStreamer } from './audio-streamer'; 
import VolMeterWorket from './worklet.vol-meter'; 
import { audioContext } from './utils'; 
import { Blob, LiveConnectConfig, Modality, Type } from '@google/genai';
import { TranscribeService } from './transcribe.service';

type ServerContentNullable = ModelTurn | TurnComplete | Interrupted | null;
type ToolCallNullable = ToolCall | null;

@Injectable({
  providedIn: 'root',
})
export class MultimodalLiveService implements OnDestroy {
  public wsClient: MultimodalLiveClient;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  connected$ = this.connectedSubject.asObservable();
  private contentSubject = new BehaviorSubject<ServerContentNullable>(null);
  content$ = this.contentSubject.asObservable();
  private toolSubject = new BehaviorSubject<ToolCallNullable>(null);
  tool$ = this.toolSubject.asObservable();

  // function calling setup
  // Define the function to be called.
  // Following the specificication at https://spec.openapis.org/oas/v3.0.3
  private getCurrentWeatherFunction = {
    name: "getCurrentWeather",
    description: "Get the current weather in a given location",
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: {
          type: Type.STRING,
          description: "The city and state, e.g. San Francisco, CA",
        },
        unit: {
          type: Type.STRING,
          enum: ["celsius", "fahrenheit"],
          description: "The temperature unit to use. Infer this from the users location.",
        },
      },
      required: ["location", "unit"],
    },
  };
    
  public config: LiveConnectConfig = {
    // responseModalities: [Modality.TEXT],
    responseModalities: [Modality.AUDIO], // note "audio" doesn't send a text response over
    // speechConfig: {
    //   voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
    // },
    generationConfig: {
      //maxOutputTokens: 100,
    },
    systemInstruction: {
      parts: [
        {
          text: 'You are a helpful assistant.',
        },
      ],
    },
    tools: [
      { googleSearch: {} },
      { codeExecution: {} },
      {
        functionDeclarations: [
          this.getCurrentWeatherFunction,
        ],
      },
    ],
  };
  private audioStreamer: AudioStreamer | null = null;
  private volumeSubject = new BehaviorSubject<number>(0);
  volume$ = this.volumeSubject.asObservable();
  private destroy$ = new Subject<void>(); // For unsubscribing
  //public microphoneTranscribeService: TranscribeService;
  public geminiTranscribeService: TranscribeService;

  constructor() {
    this.wsClient = new MultimodalLiveClient({
      apiKey: environment.API_KEY,
    });
    //this.microphoneTranscribeService = new TranscribeService(16000, 'user');
    this.geminiTranscribeService = new TranscribeService(24000, 'model');
    this.initializeAudioStreamer();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect(); // Ensure disconnection on service destruction
  }

  private async initializeAudioStreamer(): Promise<void> {
    try {
      const audioCtx = await audioContext({ id: 'audio-out' });
      this.audioStreamer = new AudioStreamer(audioCtx);
      await this.audioStreamer.addWorklet<any>(
        'vumeter-out',
        VolMeterWorket,
        (ev: any) => {
          this.volumeSubject.next(ev.data.volume);
        },
      );
    } catch (error) {
      console.error('Error initializing audio streamer:', error);
      // Handle error appropriately (e.g., disable audio features)
    }
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
      .on('toolcall', (data: ToolCallNullable) => {
        this.toolSubject.next(data);
        console.log(data);
      })

      .on('close', (e: CloseEvent) => {
        console.log('WS connection closed', e);
        this.setConnected(false);
      });
    
    // audio event listeners
    this.wsClient
      .on('interrupted', () => {
      this.stopAudioStreamer() })
      .on('audio', (data: ArrayBuffer) => {
      this.addAudioData(data);
    });
  }

  private stopAudioStreamer(): void {
    if (this.audioStreamer) {
      this.audioStreamer.stop();
    }
  }

  private async addAudioData(data: ArrayBuffer): Promise<void> {
    if (this.audioStreamer) {
      this.audioStreamer.addPCM16(new Uint8Array(data));
      if (this.geminiTranscribeService?.isStreaming) {
        this.geminiTranscribeService.sendAudioData(new Uint8Array(data));
      }
    }
  }
  
  async connect(): Promise<void> {
    this.wsClient.disconnect();
    this.geminiTranscribeService.stop();
    try {
      await this.wsClient.connect(this.config);
      this.geminiTranscribeService.start();
      this.setConnected(true);
    } catch (error) {
      console.error('Connection error:', error);
      this.setConnected(false); // Ensure state is updated on error
      throw error; // Re-throw to allow component to handle
    }
  }

  disconnect(): void {
    this.wsClient.disconnect();
    this.geminiTranscribeService.stop();
    this.stopAudioStreamer(); // Stop audio on disconnect
    //this.microphoneTranscribeService.stop();
    this.setConnected(false);
  }

  private setConnected(connected: boolean): void {
    this.connectedSubject.next(connected);
  }

  async send(message: any): Promise<any> {
    this.wsClient.send(message);
  }
  async sendToolResponse(message: any): Promise<any> {
    this.wsClient.sendToolResponse(message);
  }

  async sendRealtimeInput(chunks: Blob[]): Promise<any> {
    this.wsClient.sendRealtimeInput(chunks);
  }

}