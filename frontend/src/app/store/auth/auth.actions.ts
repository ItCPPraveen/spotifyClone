import { createAction, props } from '@ngrx/store';

export const checkAuth = createAction(
    '[Auth] Check Auth'
);

export const initiateLogin = createAction(
    '[Auth] Initiate Login'
);

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<{ token: string; user: any }>()
);

export const loginFailure = createAction(
    '[Auth] Login Failure',
    props<{ error: string }>()
);

export const logout = createAction(
    '[Auth] Logout'
);

export const refreshToken = createAction(
    '[Auth] Refresh Token'
);

export const refreshTokenSuccess = createAction(
    '[Auth] Refresh Token Success',
    props<{ token: string }>()
);

export const refreshTokenFailure = createAction(
    '[Auth] Refresh Token Failure',
    props<{ error: string }>()
);

export const getProfile = createAction(
    '[Auth] Get Profile'
);

export const getProfileSuccess = createAction(
    '[Auth] Get Profile Success',
    props<{ user: any }>()
);

export const getProfileFailure = createAction(
    '[Auth] Get Profile Failure',
    props<{ error: string }>()
);
