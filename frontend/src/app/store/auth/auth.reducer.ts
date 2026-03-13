import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
    token: string | null;
    user: any | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

export const authInitialState: AuthState = {
    token: localStorage.getItem('access_token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('access_token'),
};

export const authReducer = createReducer(
    authInitialState,
    on(AuthActions.initiateLogin, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(AuthActions.loginSuccess, (state, { token, user }) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return {
            ...state,
            token,
            user,
            loading: false,
            isAuthenticated: true,
        };
    }),
    on(AuthActions.loginFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
        isAuthenticated: false,
    })),
    on(AuthActions.logout, () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        return {
            ...authInitialState,
            isAuthenticated: false,
        };
    }),
    on(AuthActions.refreshTokenSuccess, (state, { token }) => {
        localStorage.setItem('access_token', token);
        return {
            ...state,
            token,
        };
    }),
    on(AuthActions.getProfileSuccess, (state, { user }) => ({
        ...state,
        user,
    })),
);
