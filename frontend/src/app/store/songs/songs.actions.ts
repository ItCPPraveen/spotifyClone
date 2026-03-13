import { createAction, props } from '@ngrx/store';

export const searchSongs = createAction(
    '[Songs] Search Songs',
    props<{ query: string }>()
);

export const searchSongsSuccess = createAction(
    '[Songs] Search Songs Success',
    props<{ songs: any[]; sources: string[] }>()
);

export const searchSongsFailure = createAction(
    '[Songs] Search Songs Failure',
    props<{ error: string }>()
);

export const getSongById = createAction(
    '[Songs] Get Song By ID',
    props<{ id: string }>()
);

export const getSongByIdSuccess = createAction(
    '[Songs] Get Song By ID Success',
    props<{ song: any }>()
);

export const getRecentSongs = createAction(
    '[Songs] Get Recent Songs'
);

export const getRecentSongsSuccess = createAction(
    '[Songs] Get Recent Songs Success',
    props<{ songs: any[] }>()
);

export const clearSearchResults = createAction(
    '[Songs] Clear Search Results'
);
