import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, QueryList, SimpleChanges, ViewChildren } from '@angular/core';

const lineCount = 3;

@Component({
  selector: 'app-audio-pulse',
  templateUrl: './audio-pulse.component.html',
  styleUrl: './audio-pulse.component.css'
})
export class AudioPulseComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() active: boolean = false;
  @Input() volume: number = 0;
  @Input() hover: boolean = false;

  @ViewChildren('lineElement') lineElements!: QueryList<ElementRef>;

  lines: any[] = Array(lineCount).fill(null); // Used for ngFor

  private timeout: number | null = null;

  ngAfterViewInit(): void {
    this.updateLines();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['volume'] && !changes['volume'].firstChange) {
      this.updateLines();
    }
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }

  getAnimationDelay(index: number): string {
    return `${index * 133}ms`;
  }

  private updateLines(): void {
    this.clearTimeout(); // Clear any previous timeouts

    const update = () => {
      if (this.lineElements) {
        this.lineElements.forEach((lineElement, i) => {
          const height = Math.min(24, 4 + this.volume * (i === 1 ? 400 : 60));
          lineElement.nativeElement.style.height = `${height}px`;
        });
      }
      this.timeout = window.setTimeout(update, 100);
    };

    update();
  }

  private clearTimeout(): void {
    if (this.timeout !== null) {
      window.clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
