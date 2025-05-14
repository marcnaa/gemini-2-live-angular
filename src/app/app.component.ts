import { Component, OnInit, OnDestroy, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subscription } from 'rxjs';
import { Part, SchemaType } from '@google/generative-ai';
import { FormControl, FormGroup } from '@angular/forms';
import { LiveConfig, ModelTurn, ToolCall, TurnComplete } from '../gemini/types';
import { ControlTrayComponent } from './control-tray/control-tray.component';
import { GeminiApiService } from './services/gemini-api.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

type ChatMessage = {
  role: string;
  text: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ControlTrayComponent]
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('myVideo') myVideoRef!: ElementRef<HTMLVideoElement>;

  title = 'gemini-2-live-angular';
  isConnected: boolean = false;
  volume: number = 0;
  streamedMessage: string = '';
  messages: ChatMessage[] = [];
  private connectedSubscription: Subscription | undefined;
  private contentSubscription: Subscription | undefined;
  private toolSubscription: Subscription | undefined;
  private audioSubscription: Subscription | undefined;

  chatForm = new FormGroup({
    message: new FormControl('Hola Sue!'),
  });
  isFormEmpty: boolean = this.chatForm.value?.message?.length === 0;

  constructor(private geminiApiService: GeminiApiService) { }

  ngOnInit(): void {
    this.connectedSubscription = this.geminiApiService.connected$.subscribe(
      (connected) => {
        console.log('Connected:', connected);
        this.isConnected = connected;
      },
    );
    
    this.contentSubscription = this.geminiApiService.content$.subscribe(
      (data) => {
        if (!data) return;
        let turn = data as ModelTurn;
        let turnComplete = (data as TurnComplete).turnComplete;
        if (turn) {
          if (this.streamedMessage.length > 0) {
            this.messages.pop();
          } 
          let incomingMessage = turn.modelTurn.parts?.[0]?.text as string;
          if (incomingMessage) {
            this.streamedMessage += incomingMessage;
            this.messages.push({
              role: 'model',
              text: this.streamedMessage
            });
          }
        }
        if (turnComplete) {
          this.messages.push({
            role: 'model',
            text: this.streamedMessage
          });
          this.streamedMessage = '';
        }
      },
    );
    
    this.toolSubscription = this.geminiApiService.tool$.subscribe(
      (data) => {
        // Executable function code.
        interface WeatherParams {
          location: string;
          unit: string;
        }
        const functions = {
          getCurrentWeather: ({ location, unit }: WeatherParams) => {
            // mock API response
            return {
              location,
              temperature: "25°" + (unit.toLowerCase() === "celsius" ? "C" : "F"),
            };
          }
        };

        if (!data) return;
        let toolCall = data as ToolCall;
        const call = toolCall.functionCalls?.[0];
        const id = toolCall.functionCalls?.[0].id;
        if (call) {
          // Call the actual function
          if (call.name === "getCurrentWeather") {
            const callResponse = functions[call.name](call.args as WeatherParams);
            // Send the API response back to the model
            this.geminiApiService.sendToolResponse({
              functionResponses: [{
                response: callResponse,
                id,
              }]
            });
          }
        }
      },
    );
  }

  ngOnDestroy(): void {
    if (this.connectedSubscription) {
      this.connectedSubscription.unsubscribe();
    }
    
    if (this.contentSubscription) {
      this.contentSubscription.unsubscribe();
    }
    
    if (this.toolSubscription) {
      this.toolSubscription.unsubscribe();
    }
    
    if (this.audioSubscription) {
      this.audioSubscription.unsubscribe();
    }
  }

  connect(): void {
    // Define la función para obtener el clima
    const getCurrentWeatherFunction = {
      name: "getCurrentWeather",
      description: "Obtiene el clima actual en una ubicación determinada",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          location: {
            type: SchemaType.STRING,
            description: "La ciudad y estado, por ejemplo: Barcelona, ES",
          },
          unit: {
            type: SchemaType.STRING,
            enum: ["celsius", "fahrenheit"],
            description: "La unidad de temperatura a usar. Inferir de la ubicación del usuario.",
          },
        },
        required: ["location", "unit"],
      },
    };
    
    let config : LiveConfig = {
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: 'Eres Sue, un asistente útil creado por Digital 13.',
          },
        ],
      },
      tools: [
        { googleSearch: {} }, 
        { codeExecution: {} },
        {
          functionDeclarations: [
            getCurrentWeatherFunction,
          ],
        },
      ],
    };

    this.geminiApiService.connect(config).catch(err => {
      console.error("Error al conectar:", err);
    });
  }

  disconnect(): void {
    this.geminiApiService.disconnect();
  }

  send(): void {
    this.streamedMessage = ''; // reinicia el mensaje en streaming
    let message = (this.chatForm.value?.message as string)?.trim();
    if (!message) return;
    let part: Part | Part[] = {
      text: message,
    };
    this.geminiApiService.send(part);
    this.messages.push({
      role: 'user',
      text: message
    });
    this.chatForm.reset();
  }

  reset(): void {
    this.chatForm.reset();
  }

  handleVideoStreamChange(event: any) {
    // Maneja el cambio de stream de video (p.ej., actualiza el elemento de video)
    if(this.myVideoRef){
      this.myVideoRef.nativeElement.srcObject = event;
    }
  }
}