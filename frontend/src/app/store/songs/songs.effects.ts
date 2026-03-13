import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as SongsActions from './songs.actions';
import { SongsService } from '@services/songs.service';

@Injectable()
export class SongsEffects {
    searchSongs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SongsActions.searchSongs),
            switchMap(({ query }) =>
                this.songsService.searchSongs(query).pipe(
                    map(({ songs, sources }) =>
                        SongsActions.searchSongsSuccess({ songs, sources })
                    ),
                    catchError((error) =>
                        of(SongsActions.searchSongsFailure({ error: error.message }))
                    ),
                ),
            ),
        ),
    );

    getRecentSongs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SongsActions.getRecentSongs),
            switchMap(() =>
                this.songsService.getRecentSongs().pipe(
                    map((songs) => SongsActions.getRecentSongsSuccess({ songs })),
                    catchError((error) =>
                        of(SongsActions.searchSongsFailure({ error: error.message }))
                    ),
                ),
            ),
        ),
    );

    constructor(
        private actions$: Actions,
        private songsService: SongsService,
    ) { }
}
