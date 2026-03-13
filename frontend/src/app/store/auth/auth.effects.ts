import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService } from '@services/auth.service';

@Injectable()
export class AuthEffects {
    initiateLogin$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.initiateLogin),
                switchMap(() =>
                    this.authService.getLoginUrl().pipe(
                        tap((response) => {
                            // Open Deezer login in new window
                            window.location.href = response.auth_url;
                        }),
                        catchError(() => of())
                    )
                ),
            ),
        { dispatch: false },
    );

    checkAuth$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.checkAuth),
            switchMap(() => {
                // Hardcode a fake token to bypass auth for now
                localStorage.setItem('access_token', 'dummy_token');
                const token = localStorage.getItem('access_token');
                
                if (token) {
                    return this.authService.getProfile().pipe(
                        map((user) => AuthActions.getProfileSuccess({ user })),
                        catchError(() => of(AuthActions.logout())),
                    );
                }
                return of(AuthActions.logout());
            }),
        ),
    );

    refreshToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.refreshToken),
            switchMap(() =>
                this.authService.refreshToken().pipe(
                    map(({ access_token }) =>
                        AuthActions.refreshTokenSuccess({ token: access_token }),
                    ),
                    catchError(({ error }) =>
                        of(AuthActions.refreshTokenFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    constructor(
        private actions$: Actions,
        private authService: AuthService,
    ) { }
}
