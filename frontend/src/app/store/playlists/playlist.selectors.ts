import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlaylistState, adapter } from './playlist.reducer';

export const selectPlaylistState = createFeatureSelector<PlaylistState>('playlists');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectPlaylistState);

export const selectAllPlaylists = selectAll;

export const selectSelectedPlaylistId = createSelector(
  selectPlaylistState,
  (state: PlaylistState) => state.selectedPlaylistId
);

export const selectSelectedPlaylist = createSelector(
  selectEntities,
  selectSelectedPlaylistId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);

export const selectPlaylistLoading = createSelector(
  selectPlaylistState,
  (state: PlaylistState) => state.loading
);
