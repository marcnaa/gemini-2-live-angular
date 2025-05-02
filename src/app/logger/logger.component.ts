import { Component, Input, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { LoggerService } from '../logging/logger.service';
import {
  StreamingLog,
  isClientContentMessage,
  isServerContentMessage,
  isToolCallMessage,
  isToolResponseMessage,
  isToolCallCancellationMessage,
  isInterrupted,
  isTurnComplete,
  isModelTurn,
  LiveIncomingMessage,
  LiveOutgoingMessage,
  isTranscript,
} from '../../gemini/types';
import { Part } from '@google/genai';
import { UnescapePipe } from './unescape-code.pipe';

//export type LoggerFilterType = 'conversations' | 'tools' | 'none';

@Component({
  selector: 'app-logger',
  imports: [CommonModule, UnescapePipe],
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.css']
}) 
export class LoggerComponent {
isClientContentMessage(arg0: LiveOutgoingMessage|LiveIncomingMessage) {
throw new Error('Method not implemented.');
}
  @Input() filter: string = 'conversations';

  @ViewChild('plainTextMessage', { static: true })
  private plainTextMessage!: TemplateRef<any>;
  @ViewChild('clientContentLog', { static: true })
  private clientContentLog!: TemplateRef<any>;
  @ViewChild('toolCallLog', { static: true })
  private toolCallLog!: TemplateRef<any>;
  @ViewChild('toolCancellationLog', { static: true })
  private toolCancellationLog!: TemplateRef<any>;
  @ViewChild('toolResponseLog', { static: true })
  private toolResponseLog!: TemplateRef<any>;
  @ViewChild('modelTurnLog', { static: true })
  private modelTurnLog!: TemplateRef<any>;
  @ViewChild('anyMessage', { static: true })
  private anyMessage!: TemplateRef<any>;
  @ViewChild('renderPart', { static: true })
  private renderPart!: TemplateRef<any>;
  @ViewChild('plainText', { static: true })
  private plainText!: TemplateRef<any>;

  @ViewChild('clientTranscriptLog', { static: true })
  private clientTranscriptLog!: TemplateRef<any>;
  @ViewChild('modelTranscriptLog', { static: true })
  private modelTranscriptLog!: TemplateRef<any>;

  public stringify = JSON.stringify;

  private filters: Record<string, (log: StreamingLog) => boolean> = {
    tools: (log: StreamingLog) =>
      isToolCallMessage(log.message) ||
      isToolResponseMessage(log.message) ||
      isToolCallCancellationMessage(log.message),
    conversations: (log: StreamingLog) =>
      isTranscript(log) ||
      isClientContentMessage(log.message) ||
      isServerContentMessage(log.message),
    none: () => true
  };
  private filterFn(log: StreamingLog): boolean {
    return this.filters[this.filter](log);
  }

  filteredLogs$: Observable<StreamingLog[]>;
  text: string = '';


  constructor(private loggerService: LoggerService) {
    this.filteredLogs$ = this.loggerService.logs$.pipe(
      map((logs: StreamingLog[]) => logs.filter(this.filters[this.filter]))
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filter']) {
      this.filteredLogs$ = this.loggerService.logs$.pipe(
        map((logs: StreamingLog[]) => logs.filter(this.filters[this.filter]))
      );
    }
  }

  formatTime(d: Date): string {
    return d.toLocaleTimeString().slice(0, -3);
  }

  getLogClasses(log: StreamingLog): { [key: string]: boolean } {
    const type = log.type.slice(0, log.type.indexOf('.'));
    return {
      'plain-log': true,
      [`source-${type}`]: true,
      'receive': log.type.includes('receive'),
      'send': log.type.includes('send')
    };
  }

  logTemplate(log: StreamingLog) {
    if (log.type == 'user-transcript') {
      return this.clientTranscriptLog;
    }
    if (log.type == 'model-transcript') {
      return this.modelTranscriptLog;
    }

    if (typeof log.message === 'string') {
      return this.plainTextMessage;
    }
    if (isClientContentMessage(log.message)) {
      return this.clientContentLog;
    }
    if (isToolCallMessage(log.message)) {
      return this.toolCallLog;
    }
    if (isToolCallCancellationMessage(log.message)) {
      return this.toolCancellationLog;
    }
    if (isToolResponseMessage(log.message)) {
      return this.toolResponseLog;
    }
    if (isServerContentMessage(log.message)) {
      if (isInterrupted(log.message.serverContent)) {
        this.text = "interrupted";
        return this.plainText;
      }
      if (isTurnComplete(log.message.serverContent)) {
        this.text = "turnComplete";
        return this.plainText;
      }
      if (isModelTurn(log.message.serverContent)) {
        return this.modelTurnLog;
      }
    }
    return this.anyMessage;
  }

  tryParseCodeExecutionResult(output: string): string {
    try {
      return JSON.stringify(JSON.parse(output), null, 2);
    } catch {
      return output;
    }
  }

  filterParts(parts: Part[]): Part[] {
    return parts.filter(part => !(part.text && part.text === '\n'));
  }

  trackByFn(index: number, item: StreamingLog): string {
    return `${item.type}-${item.date.toISOString()}`;
  }
}

