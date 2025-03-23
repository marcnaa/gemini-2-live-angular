import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { environment } from '../../src/environments/environment.development';
import { createClient, ListenLiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";

interface TranscribeStreamResult {
  isStreaming: Observable<boolean>;
  start: () => Promise<String | null>;
  stop: () => void;
}

interface TranscriptionFragment {
  transcript: string;
  source: string; // user or model
}

@Injectable()
export class TranscribeService implements OnDestroy {
  private streamSubject = new BehaviorSubject<TranscriptionFragment | null>(null);
  stream$ = this.streamSubject.asObservable();
  private isStreamingSubject = new BehaviorSubject<boolean>(false);
  isStreaming$ = this.isStreamingSubject.asObservable();
  private ngUnsubscribe = new Subject<void>();

  _deepgram = createClient(environment.DEEPGRAM_API_KEY);
  socket: ListenLiveClient | null = null;
  //source: string = 'user';

  constructor(
    @Inject('sampleRate') private sampleRate: number,
    @Inject('source') private source: string,
  ) { 
    this.stream$.pipe(takeUntil(this.ngUnsubscribe)).subscribe();
  }

  ngOnDestroy(): void {
    this.stop(); // Ensure socket is closed
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get isStreaming() {
    return this.isStreamingSubject.value;
  }

  start(): Promise<null> { 
    this.socket = null;

    return new Promise((resolve, reject) => {
      this.socket = this._deepgram.listen.live({
        model: 'nova-3',
        language: 'en-US',
        encoding: 'linear16',
        sample_rate: this.sampleRate,
        endpointing: 800,
        smart_format: true,
      });
      console.info('Deepgram live socket initialized');

      this.socket.on(LiveTranscriptionEvents.Open, () => {
        console.log("Connected to Deepgram");

        this.socket?.on(LiveTranscriptionEvents.Transcript, (data) => {
          const transcript = data.channel.alternatives[0].transcript;
          //console.log(transcript);
          this.streamSubject.next({
            transcript: transcript, 
            source: this.source
          });
        });
        this.socket?.on(LiveTranscriptionEvents.Metadata, (data) => {
          console.log(data);
        });
        this.socket?.on(LiveTranscriptionEvents.Error, (err) => {
          console.error(err);
          this.stop();
        });
        this.socket?.on(LiveTranscriptionEvents.Close, () => {
          console.log("Connection to Deepgram closed.");
          this.stop();
        });

        this.isStreamingSubject.next(true);
        resolve(null);
      });
    });
  }

  stop(): void {
    if (this.socket?.isConnected()) {
      this.streamSubject.next(null);
      this.isStreamingSubject.next(false);
      console.log("Disconnected from Deepgram");
    }
  }

  async sendAudioData(data: ArrayBuffer): Promise<void> {
    if (!this.socket?.isConnected()) return;

    // if(this.socket?.isConnected()) {
    //   await this.start();
    // }
    this.socket?.send(data);
  }
}
