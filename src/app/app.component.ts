import { Component, OnInit, OnDestroy } from '@angular/core';
import { MultimodalLiveService } from '../gemini/gemini-client.service';
import { Subscription } from 'rxjs';
import { Part } from '@google/generative-ai';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LiveConfig, ModelTurn, TurnComplete } from '../gemini/types';

type ChatMessage = {
  role: string;
  text: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'gemini-2-live-angular';
  isConnected: boolean = false;
  volume: number = 0;
  streamedMessage: string = '';
  messages: ChatMessage[] = [];
  private connectedSubscription: Subscription | undefined;
  private contentSubscription: Subscription | undefined;


  chatForm = new FormGroup({
    message: new FormControl('Write a poem.'),
  });
  isFormEmpty: boolean = this.chatForm.value?.message?.length === 0;


  constructor(private multimodalLiveService: MultimodalLiveService) { }

  ngOnInit(): void {
    this.connectedSubscription = this.multimodalLiveService.connected$.subscribe(
      (connected) => {
        console.log('Connected:', connected);
        this.isConnected = connected;
      },
    );
    this.contentSubscription = this.multimodalLiveService.content$.subscribe(
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
  }

  ngOnDestroy(): void {
    if (this.connectedSubscription) {
      this.connectedSubscription.unsubscribe();
      console.log('Connected:', this.isConnected);
    }
  }

  connect(): void {
    let config : LiveConfig = {
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "text",
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
        //{ functionDeclarations: [declaration] },
      ],
    };

    this.multimodalLiveService.connect(config).catch(err => {
      console.error("Failed to connect:", err);
    });
  }

  disconnect(): void {
    this.multimodalLiveService.disconnect();
  }

  send(): void {
    this.streamedMessage = ''; // reset streamed message
    let message = (this.chatForm.value?.message as string)?.trim();
    if (!message) return;
    let part: Part | Part[] = {
      text: message,
    };
    this.multimodalLiveService.send(part);
    this.messages.push({
      role: 'user',
      text: message
    });
    this.chatForm.reset();
  }

  reset(): void {
    this.chatForm.reset();
  }
}