import { createReducer, on } from '@ngrx/store';
import * as PlaylistsActions from './playlists.actions';

export interface PlaylistsState {
    playlists: any[];
    loading: boolean;
    error: string | null;
}

const initialState: PlaylistsState = {
    playlists: [],
    loading: false,
    error: null,
};

export const playlistsReducer = createReducer(
    initialState,
    on(PlaylistsActions.getUserPlaylists, (state) => ({ ...state, loading: true })),
    on(PlaylistsActions.getPlaylistsSuccess, (state, { playlists }) => ({
        ...state,
        playlists,
        loading: false,
    })),
    on(PlaylistsActions.importPlaylist, (state) => ({ ...state, loading: true })),
    on(PlaylistsActions.importPlaylistSuccess, (state, { playlist }) => ({
        ...state,
        playlists: [...state.playlists, playlist],
        loading: false,
    })),
    on(PlaylistsActions.importPlaylistFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),
);
