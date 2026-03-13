import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as PlaylistsActions from './playlists.actions';
import { PlaylistsService } from '@services/playlists.service';

@Injectable()
export class PlaylistsEffects {
    getUserPlaylists$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PlaylistsActions.getUserPlaylists),
            switchMap(() =>
                this.playlistsService.getUserPlaylists().pipe(
                    map((playlists) => PlaylistsActions.getPlaylistsSuccess({ playlists })),
                    catchError((error) => of(PlaylistsActions.importPlaylistFailure({ error: error.message })))
                )
            )
        )
    );

    importPlaylist$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PlaylistsActions.importPlaylist),
            switchMap(({ playlistUrl }) =>
                this.playlistsService.importPlaylist(playlistUrl).pipe(
                    map(({ playlist, imported_count }) =>
                        PlaylistsActions.importPlaylistSuccess({ playlist, importedCount: imported_count })
                    ),
                    catchError((error) => of(PlaylistsActions.importPlaylistFailure({ error: error.message })))
                )
            )
        )
    );

    constructor(private actions$: Actions, private playlistsService: PlaylistsService) { }
}
