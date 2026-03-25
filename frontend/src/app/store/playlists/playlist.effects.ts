import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PlaylistService } from '../../services/playlist.service';
import * as PlaylistActions from './playlist.actions';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class PlaylistEffects {
  constructor(
    private actions$: Actions,
    private playlistService: PlaylistService,
    private router: Router
  ) {}

  loadPlaylists$ = createEffect(() => this.actions$.pipe(
    ofType(PlaylistActions.loadPlaylists),
    mergeMap(() => this.playlistService.getUserPlaylists()
      .pipe(
        map(playlists => PlaylistActions.loadPlaylistsSuccess({ playlists })),
        catchError(error => of(PlaylistActions.loadPlaylistsFailure({ error })))
      )
    )
  ));

  loadPlaylist$ = createEffect(() => this.actions$.pipe(
    ofType(PlaylistActions.loadPlaylist),
    mergeMap(({ id }) => this.playlistService.getPlaylist(id)
      .pipe(
        map(playlist => PlaylistActions.loadPlaylistSuccess({ playlist })),
        catchError(error => of(PlaylistActions.loadPlaylistFailure({ error })))
      )
    )
  ));

  createPlaylist$ = createEffect(() => this.actions$.pipe(
    ofType(PlaylistActions.createPlaylist),
    mergeMap(({ name, description }) => this.playlistService.createPlaylist(name, description)
      .pipe(
        map(playlist => PlaylistActions.createPlaylistSuccess({ playlist })),
        catchError(error => of(PlaylistActions.createPlaylistFailure({ error })))
      )
    )
  ));

  importPlaylist$ = createEffect(() => this.actions$.pipe(
    ofType(PlaylistActions.importPlaylist),
    mergeMap(({ url }) => this.playlistService.importPlaylist(url)
      .pipe(
        map(data => PlaylistActions.importPlaylistSuccess({ data })),
        catchError(error => of(PlaylistActions.importPlaylistFailure({ error })))
      )
    )
  ));

  addSongToPlaylist$ = createEffect(() => this.actions$.pipe(
    ofType(PlaylistActions.addSongToPlaylist),
    mergeMap(({ playlistId, songId }) => this.playlistService.addSongToPlaylist(playlistId, songId)
      .pipe(
        map(playlist => PlaylistActions.addSongToPlaylistSuccess({ playlist })),
        catchError(error => of(PlaylistActions.addSongToPlaylistFailure({ error })))
      )
    )
  ));

  removeSongFromPlaylist$ = createEffect(() => this.actions$.pipe(
    ofType(PlaylistActions.removeSongFromPlaylist),
    mergeMap(({ playlistId, songId }) => this.playlistService.removeSongFromPlaylist(playlistId, songId)
      .pipe(
        map(playlist => PlaylistActions.removeSongFromPlaylistSuccess({ playlist })),
        catchError(error => of(PlaylistActions.removeSongFromPlaylistFailure({ error })))
      )
    )
  ));

  deletePlaylist$ = createEffect(() => this.actions$.pipe(
    ofType(PlaylistActions.deletePlaylist),
    mergeMap(({ id }) => this.playlistService.deletePlaylist(id)
      .pipe(
        map(() => PlaylistActions.deletePlaylistSuccess({ id })),
        tap(() => this.router.navigate(['/'])),
        catchError(error => of(PlaylistActions.deletePlaylistFailure({ error })))
      )
    )
  ));
}
