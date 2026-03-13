import { createAction, props } from '@ngrx/store';

export const getQueue = createAction('[Queue] Get Queue');
export const getQueueSuccess = createAction('[Queue] Get Queue Success', props<{ queue: any }>());
export const getQueueFailure = createAction('[Queue] Get Queue Failure', props<{ error: string }>());

export const addToQueue = createAction('[Queue] Add To Queue', props<{ songId: string }>());
export const addToQueueSuccess = createAction('[Queue] Add To Queue Success', props<{ queue: any }>());
export const removeFromQueue = createAction('[Queue] Remove From Queue', props<{ songId: string }>());
export const clearQueue = createAction('[Queue] Clear Queue');
export const playNext = createAction('[Queue] Play Next');
export const playPrevious = createAction('[Queue] Play Previous');
export const setSleepTimer = createAction('[Queue] Set Sleep Timer', props<{ durationMinutes: number }>());
export const setSleepTimerSuccess = createAction('[Queue] Set Sleep Timer Success', props<{ expiresAt: Date }>());
export const reorderQueue = createAction('[Queue] Reorder Queue', props<{ previousIndex: number; currentIndex: number }>());
