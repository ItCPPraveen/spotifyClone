import { createAction, props } from '@ngrx/store';

export const getUserPlaylists = createAction('[Playlists] Get User Playlists');
export const getPlaylistsSuccess = createAction('[Playlists] Get Playlists Success',
    props<{ playlists: any[] }>());
export const importPlaylist = createAction('[Playlists] Import Playlist',
    props<{ playlistUrl: string }>());
export const importPlaylistSuccess = createAction('[Playlists] Import Playlist Success',
    props<{ playlist: any; importedCount: number }>());
export const importPlaylistFailure = createAction('[Playlists] Import Playlist Failure',
    props<{ error: string }>());
export const createPlaylist = createAction('[Playlists] Create Playlist',
    props<{ name: string; description: string }>());
export const addToPlaylist = createAction('[Playlists] Add to Playlist',
    props<{ playlistId: string; songId: string }>());
export const deletePlaylist = createAction('[Playlists] Delete Playlist',
    props<{ playlistId: string }>());
