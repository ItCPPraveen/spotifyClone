import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueueState } from './queue.reducer';

const selectQueueState = createFeatureSelector<QueueState>('queue');

export const selectQueueSongs = createSelector(selectQueueState, (s) => s.songs);
export const selectCurrentIndex = createSelector(selectQueueState, (s) => s.currentIndex);
export const selectCurrentSong = createSelector(selectQueueState, (s) =>
    s.songs[s.currentIndex]
);
export const selectSleepTimer = createSelector(selectQueueState, (s) => s.sleepTimer);
