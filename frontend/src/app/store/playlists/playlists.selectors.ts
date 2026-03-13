import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlaylistsState } from './playlists.reducer';

const selectPlaylistsState = createFeatureSelector<PlaylistsState>('playlists');

export const selectPlaylists = createSelector(selectPlaylistsState, (s) => s.playlists);
export const selectLoading = createSelector(selectPlaylistsState, (s) => s.loading);
export const selectError = createSelector(selectPlaylistsState, (s) => s.error);
