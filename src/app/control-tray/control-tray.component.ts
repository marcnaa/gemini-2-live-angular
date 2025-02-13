import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AudioPulseComponent } from '../audio-pulse/audio-pulse.component';
import { AudioRecorder } from '../../gemini/audio-recorder';
import { MultimodalLiveService } from '../../gemini/gemini-client.service';
import { CommonModule } from '@angular/common';
import { WebcamService } from '../../gemini/webcam.service';
import { ScreenCaptureService } from '../../gemini/screen-capture.service';

//Interface for the result of your stream hooks
interface UseMediaStreamResult {
  isStreaming: Observable<boolean>;
  start: () => Promise<MediaStream | null>;
  stop: () => void;
}

@Component({
  selector: 'app-control-tray',
  imports: [CommonModule, AudioPulseComponent],
  templateUrl: './control-tray.component.html',
  styleUrls: ['./control-tray.component.css'],
})
export class ControlTrayComponent
  implements OnInit, AfterViewInit, OnDestroy {
    
  @Input() videoRef!: HTMLVideoElement; // Make sure to pass the video element!
  @Input() supportsVideo: boolean = false;
  @Output() onVideoStreamChange = new EventEmitter<MediaStream | null>();

  @ViewChild('renderCanvas') renderCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('connectButton') connectButtonRef!: ElementRef<HTMLButtonElement>;

  webcamStream: UseMediaStreamResult = this.createWebcamStream();
  screenCaptureStream: UseMediaStreamResult = this.createScreenCaptureStream(); 

  activeVideoStream: MediaStream | null = null;
  inVolume: number = 0;
  audioRecorder: AudioRecorder = new AudioRecorder();

  muted: boolean = false;

  // Access the service's observables directly:
  connected$: Observable<boolean>;
  volume$: Observable<number>;
  isConnected: boolean = false;

  private ngUnsubscribe = new Subject<void>(); // Used to unsubscribe from observables

  @Input()
  get volume(): number { return this.inVolume; }
  set volume(number: number) {
    this.inVolume = number;
    document.documentElement.style.setProperty(
      '--volume',
      `${Math.max(5, Math.min(this.inVolume * 200, 8))}px`,
    );
  }

  constructor(
    private multimodalLiveService: MultimodalLiveService,
    private webcamService: WebcamService,
    private screenCaptureService: ScreenCaptureService,
    private cdr: ChangeDetectorRef,
  ) {
    this.connected$ = multimodalLiveService.connected$;
    this.volume$ = multimodalLiveService.volume$;
  }

  ngOnInit(): void {
    this.connected$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((connected) => {
        this.isConnected = connected;
        if (!connected && this.connectButtonRef?.nativeElement) {
          this.connectButtonRef.nativeElement.focus();
          this.cdr.detectChanges(); // Trigger change detection after focus
        }
      });
    this.setupEventListeners();
  }

  ngAfterViewInit(): void {
    this.initVideoStream();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(); // Unsubscribe from all subscriptions
    this.ngUnsubscribe.complete(); // Complete the Subject
    this.audioRecorder.stop();
  }

  setupEventListeners() {
    const onData = (base64: string) => {
      this.multimodalLiveService.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };
    this.audioRecorder.stop(); // prevent race conditions and free resources.
    if (this.isConnected && !this.muted && this.audioRecorder) {
      this.audioRecorder
        .on("data", onData)
        .on("volume", (volume) => {
          this.volume = volume;
        })
        .start();
    }
  }

  createWebcamStream(): UseMediaStreamResult {
    return {
      isStreaming: this.webcamService?.isStreaming$,
      start: () => this.webcamService.start(),
      stop: () => this.webcamService.stop()
    };
  }

  createScreenCaptureStream(): UseMediaStreamResult {
    return {
      isStreaming: this.screenCaptureService?.isStreaming$,
      start: () => this.screenCaptureService.start(),
      stop: () => this.screenCaptureService.stop()
    };
  }

  // Initial video stream setup
  private initVideoStream(): void {
    this.startVideoFrameSending();
  }

  toggleMute(): void {
    this.muted = !this.muted;
  }

  //handler for swapping from one video-stream to the next
  changeStreams(next?: UseMediaStreamResult) {
    return async () => {
      if (next) {
        let mediaStream: MediaStream | null;

        if (next === this.webcamStream) {
          mediaStream = await this.webcamService.start();
        } else {
          mediaStream = await this.screenCaptureService.start();
        }

        this.activeVideoStream = mediaStream;
        this.onVideoStreamChange.emit(mediaStream);
      } else {
        this.activeVideoStream = null;
        this.onVideoStreamChange.emit(null);
      }

      [this.webcamStream, this.screenCaptureStream]
        .filter((msr) => msr !== next)
        .forEach((msr) => msr.stop());
      this.startVideoFrameSending();
    };
  }

  connectToggle(): void {
    if (this.isConnected) {
      this.multimodalLiveService.disconnect();
    } else {
      this.multimodalLiveService.connect();
    }
    this.setupEventListeners();
  }

  private startVideoFrameSending(): void {
    // Clear any existing intervals
    this.sendVideoFrame();
  }

  private sendVideoFrame = () => {
    const video = this.videoRef;
    const canvas = this.renderCanvasRef?.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!video || !canvas || !ctx) return;

    canvas.width = video.videoWidth * 0.25;
    canvas.height = video.videoHeight * 0.25;

    if (canvas.width + canvas.height > 0) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 1.0);
      const data = base64.slice(base64.indexOf(',') + 1, Infinity);
      this.multimodalLiveService.sendRealtimeInput([{ mimeType: 'image/jpeg', data }]);
    }
    if (this.isConnected) {
      setTimeout(this.sendVideoFrame, 1000 / 0.5); // Schedule the next frame
    }
  };
}