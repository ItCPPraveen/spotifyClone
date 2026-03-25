import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Playlist } from '../../services/playlist.service';
import * as PlaylistActions from './playlist.actions';

export interface PlaylistState extends EntityState<Playlist> {
  selectedPlaylistId: string | null;
  loading: boolean;
  error: any | null;
}

export const adapter: EntityAdapter<Playlist> = createEntityAdapter<Playlist>({
  selectId: (playlist: Playlist) => playlist._id,
  sortComparer: (a: Playlist, b: Playlist) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
});

export const initialState: PlaylistState = adapter.getInitialState({
  selectedPlaylistId: null,
  loading: false,
  error: null,
});

export const playlistReducer = createReducer(
  initialState,

  // Load All
  on(PlaylistActions.loadPlaylists, state => ({ ...state, loading: true, error: null })),
  on(PlaylistActions.loadPlaylistsSuccess, (state, { playlists }) => adapter.setAll(playlists, { ...state, loading: false })),
  on(PlaylistActions.loadPlaylistsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load Single
  on(PlaylistActions.loadPlaylist, (state, { id }) => ({ ...state, selectedPlaylistId: id, loading: true, error: null })),
  on(PlaylistActions.loadPlaylistSuccess, (state, { playlist }) => adapter.upsertOne(playlist, { ...state, loading: false })),
  on(PlaylistActions.loadPlaylistFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Create
  on(PlaylistActions.createPlaylistSuccess, (state, { playlist }) => adapter.addOne(playlist, { ...state })),
  
  // Import
  on(PlaylistActions.importPlaylistSuccess, (state, { data }) => adapter.addOne(data.playlist, { ...state })),

  // Add / Remove Song
  on(PlaylistActions.addSongToPlaylistSuccess, (state, { playlist }) => adapter.updateOne({ id: playlist._id, changes: playlist }, state)),
  on(PlaylistActions.removeSongFromPlaylistSuccess, (state, { playlist }) => adapter.updateOne({ id: playlist._id, changes: playlist }, state)),

  // Delete
  on(PlaylistActions.deletePlaylistSuccess, (state, { id }) => adapter.removeOne(id, state)),
);
