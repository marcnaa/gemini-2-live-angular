import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StreamingLog } from '../../gemini/types';

export const LoggerActions = createActionGroup({
  source: 'Logger',
  events: {
    'Log Message': props<{ log: StreamingLog }>(),
    'Clear Logs': emptyProps(),
    'Set Max Logs': props<{ maxLogs: number }>()
  }
});