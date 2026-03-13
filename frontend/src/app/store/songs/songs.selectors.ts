import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SongsState } from './songs.reducer';

const selectSongsState = createFeatureSelector<SongsState>('songs');

export const selectSongs = createSelector(
    selectSongsState,
    (state: SongsState) => state.songs
);

export const selectSelectedSong = createSelector(
    selectSongsState,
    (state: SongsState) => state.selectedSong
);

export const selectLoading = createSelector(
    selectSongsState,
    (state: SongsState) => state.loading
);

export const selectError = createSelector(
    selectSongsState,
    (state: SongsState) => state.error
);

export const selectSources = createSelector(
    selectSongsState,
    (state: SongsState) => state.sources
);
