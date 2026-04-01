import { createReducer, on } from '@ngrx/store';
import * as QueueActions from './queue.actions';

export interface QueueState {
    songs: any[];
    currentIndex: number;
    currentPlayingId: string | null;
    loading: boolean;
    sleepTimer: { expiresAt: Date | null };
}

const initialState: QueueState = {
    songs: [],
    currentIndex: 0,
    currentPlayingId: null,
    loading: false,
    sleepTimer: { expiresAt: null },
};

export const queueReducer = createReducer(
    initialState,
    on(QueueActions.getQueue, (state) => ({ ...state, loading: true })),
    on(QueueActions.getQueueSuccess, (state, { queue }) => ({
        ...state,
        songs: queue.songs,
        currentIndex: queue.current_index,
        currentPlayingId: queue.current_playing_id,
        loading: false,
    })),
    on(QueueActions.addToQueue, (state) => ({ ...state, loading: true })),
    on(QueueActions.addToQueueSuccess, (state, { queue }) => ({
        ...state,
        songs: queue.songs,
        currentIndex: queue.current_index,
        currentPlayingId: queue.current_playing_id || (queue.current_playing_id?.['_id']) || null,
        loading: false,
    })),
    on(QueueActions.playNext, (state) => {
        if (!state.songs.length) return state;
        const nextIndex = (state.currentIndex + 1) % state.songs.length;
        return { ...state, currentIndex: nextIndex, currentPlayingId: state.songs[nextIndex]?._id ?? null };
    }),
    on(QueueActions.playPrevious, (state) => {
        if (!state.songs.length) return state;
        const prevIndex = (state.currentIndex - 1 + state.songs.length) % state.songs.length;
        return { ...state, currentIndex: prevIndex, currentPlayingId: state.songs[prevIndex]?._id ?? null };
    }),
    on(QueueActions.reorderQueue, (state, { previousIndex, currentIndex }) => {
        const songs = [...state.songs];
        const [moved] = songs.splice(previousIndex, 1);
        songs.splice(currentIndex, 0, moved);
        // Keep currentIndex pointing at the same song after the move
        let newCurrentIndex = state.currentIndex;
        if (state.currentIndex === previousIndex) {
            newCurrentIndex = currentIndex;
        } else if (previousIndex < state.currentIndex && currentIndex >= state.currentIndex) {
            newCurrentIndex = state.currentIndex - 1;
        } else if (previousIndex > state.currentIndex && currentIndex <= state.currentIndex) {
            newCurrentIndex = state.currentIndex + 1;
        }
        return { ...state, songs, currentIndex: newCurrentIndex };
    }),
    on(QueueActions.removeFromQueue, (state, { songId }) => {
        const idx = state.songs.findIndex((s: any) => s._id === songId);
        if (idx === -1) return state;
        const songs = state.songs.filter((_: any, i: number) => i !== idx);
        let currentIndex = state.currentIndex;
        if (idx < currentIndex) currentIndex = Math.max(0, currentIndex - 1);
        if (currentIndex >= songs.length) currentIndex = Math.max(0, songs.length - 1);
        return { ...state, songs, currentIndex, currentPlayingId: songs[currentIndex]?._id ?? null };
    }),
    on(QueueActions.clearQueue, (state) => ({
        ...state, songs: [], currentIndex: 0, currentPlayingId: null,
    })),
    on(QueueActions.setSleepTimerSuccess, (state, { expiresAt }) => ({
        ...state,
        sleepTimer: { expiresAt },
    })),
    on(QueueActions.setTransientQueue, (state, { songs, currentIndex }) => ({
        ...state,
        songs,
        currentIndex,
        currentPlayingId: songs[currentIndex]?._id || null,
        loading: false,
    }))
);
