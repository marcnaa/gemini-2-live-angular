import { createFeature, createReducer, on } from '@ngrx/store';
import { LoggerActions } from './logger-actions';
import { StreamingLog } from '../../gemini/types';

import { mockLogs } from "./mock-logs";


export interface LoggerState {
  maxLogs: number;
  logs: StreamingLog[];
}

export const initialState: LoggerState = {
  maxLogs: 500,
  logs: [], //mockLogs,
};

export const loggerFeature = createFeature({
  name: 'logger',
  reducer: createReducer(
    initialState,
    on(LoggerActions.logMessage, (state, { log }) => {
      const prevLog = state.logs.at(-1);

      if (prevLog &&
        prevLog.type === log.type &&
        prevLog.message === log.message) {
        return {
          ...state,
          logs: [
            ...state.logs.slice(0, -1),
            {
              ...log,
              count: (prevLog.count || 0) + 1
            }
          ].slice(-state.maxLogs)
        };
      }

      return {
        ...state,
        logs: [
          ...state.logs.slice(-(state.maxLogs - 1)),
          log
        ]
      };
    }),
    on(LoggerActions.clearLogs, (state) => ({
      ...state,
      logs: []
    })),
    on(LoggerActions.setMaxLogs, (state, { maxLogs }) => ({
      ...state,
      maxLogs
    }))
  )
});