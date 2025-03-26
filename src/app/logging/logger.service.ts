import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { LoggerActions } from './logger-actions';
import { StreamingLog } from '../../gemini/types';
import { loggerFeature } from './logger-reducer';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  logs$: Observable<StreamingLog[]>; 
  maxLogs$: Observable<number>;

  constructor(private store: Store) {
    this.logs$ = store.select(loggerFeature.selectLogs);
    this.maxLogs$ = store.select(loggerFeature.selectMaxLogs);
  }

  log(log: StreamingLog) {
    this.store.dispatch(LoggerActions.logMessage({ log }));
  }

  clearLogs() {
    this.store.dispatch(LoggerActions.clearLogs());
  }

  setMaxLogs(maxLogs: number) {
    this.store.dispatch(LoggerActions.setMaxLogs({ maxLogs }));
  }
}