import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectToken = createSelector(
    selectAuthState,
    (state: AuthState) => state.token
);

export const selectUser = createSelector(
    selectAuthState,
    (state: AuthState) => state.user
);

export const selectLoading = createSelector(
    selectAuthState,
    (state: AuthState) => state.loading
);

export const selectError = createSelector(
    selectAuthState,
    (state: AuthState) => state.error
);

export const selectIsAuthenticated = createSelector(
    selectAuthState,
    (state: AuthState) => state.isAuthenticated
);
