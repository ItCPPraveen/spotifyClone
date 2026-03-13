import { createReducer, on } from '@ngrx/store';
import * as SongsActions from './songs.actions';

export interface SongsState {
    songs: any[];
    selectedSong: any | null;
    loading: boolean;
    error: string | null;
    sources: string[];
}

const initialState: SongsState = {
    songs: [],
    selectedSong: null,
    loading: false,
    error: null,
    sources: [],
};

export const songsReducer = createReducer(
    initialState,
    on(SongsActions.searchSongs, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(SongsActions.searchSongsSuccess, (state, { songs, sources }) => ({
        ...state,
        songs,
        sources,
        loading: false,
    })),
    on(SongsActions.searchSongsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),
    on(SongsActions.getSongByIdSuccess, (state, { song }) => ({
        ...state,
        selectedSong: song,
    })),
    on(SongsActions.getRecentSongsSuccess, (state, { songs }) => ({
        ...state,
        songs,
    })),
    on(SongsActions.clearSearchResults, (state) => ({
        ...state,
        songs: [],
        selectedSong: null,
    })),
);
