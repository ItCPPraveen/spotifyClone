import { createAction, props } from '@ngrx/store';
import { Playlist } from '../../services/playlist.service';

// Load all playlists
export const loadPlaylists = createAction('[Playlist] Load Playlists');
export const loadPlaylistsSuccess = createAction('[Playlist] Load Playlists Success', props<{ playlists: Playlist[] }>());
export const loadPlaylistsFailure = createAction('[Playlist] Load Playlists Failure', props<{ error: any }>());

// Load a single playlist
export const loadPlaylist = createAction('[Playlist] Load Playlist', props<{ id: string }>());
export const loadPlaylistSuccess = createAction('[Playlist] Load Playlist Success', props<{ playlist: Playlist }>());
export const loadPlaylistFailure = createAction('[Playlist] Load Playlist Failure', props<{ error: any }>());

// Create Playlist
export const createPlaylist = createAction('[Playlist] Create Playlist', props<{ name: string; description: string }>());
export const createPlaylistSuccess = createAction('[Playlist] Create Playlist Success', props<{ playlist: Playlist }>());
export const createPlaylistFailure = createAction('[Playlist] Create Playlist Failure', props<{ error: any }>());

// Import Playlist
export const importPlaylist = createAction('[Playlist] Import Playlist', props<{ url: string }>());
export const importPlaylistSuccess = createAction('[Playlist] Import Playlist Success', props<{ data: any }>());
export const importPlaylistFailure = createAction('[Playlist] Import Playlist Failure', props<{ error: any }>());

// Add song to playlist
export const addSongToPlaylist = createAction('[Playlist] Add Song', props<{ playlistId: string; songId: string }>());
export const addSongToPlaylistSuccess = createAction('[Playlist] Add Song Success', props<{ playlist: Playlist }>());
export const addSongToPlaylistFailure = createAction('[Playlist] Add Song Failure', props<{ error: any }>());

// Remove song from playlist
export const removeSongFromPlaylist = createAction('[Playlist] Remove Song', props<{ playlistId: string; songId: string }>());
export const removeSongFromPlaylistSuccess = createAction('[Playlist] Remove Song Success', props<{ playlist: Playlist }>());
export const removeSongFromPlaylistFailure = createAction('[Playlist] Remove Song Failure', props<{ error: any }>());

// Delete Playlist
export const deletePlaylist = createAction('[Playlist] Delete Playlist', props<{ id: string }>());
export const deletePlaylistSuccess = createAction('[Playlist] Delete Playlist Success', props<{ id: string }>());
export const deletePlaylistFailure = createAction('[Playlist] Delete Playlist Failure', props<{ error: any }>());
