import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HammerModule } from '@angular/platform-browser';
import 'hammerjs';

import { AppComponent } from './app.component';
import { environment } from '@environments/environment';
import { AuthInterceptor } from './services/auth.interceptor';
import { PlayerComponent } from './modules/player/player.component';
import { SongCardComponent } from './modules/player/song-card.component';
import { PlaylistImportComponent } from './modules/import/playlist-import.component';
import { SearchComponent } from './modules/home/search.component';

// Store imports
import { authReducer, AuthEffects, authInitialState } from '@store/auth';
import { songsReducer, SongsEffects } from '@store/songs';
import { queueReducer, QueueEffects } from '@store/queue';
import { playlistsReducer, PlaylistsEffects } from '@store/playlists';

const routes: Routes = [
    { path: '', component: SearchComponent },
    { path: 'search', component: SearchComponent },
    { path: 'import', component: PlaylistImportComponent },
];

@NgModule({
    declarations: [
        AppComponent,
        PlayerComponent,
        SongCardComponent,
        PlaylistImportComponent,
        SearchComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        RouterModule.forRoot(routes),
        HammerModule,
        StoreModule.forRoot({
            auth: authReducer,
            songs: songsReducer,
            queue: queueReducer,
            playlists: playlistsReducer,
        }),
        EffectsModule.forRoot([
            AuthEffects,
            SongsEffects,
            QueueEffects,
            PlaylistsEffects,
        ]),
        StoreDevtoolsModule.instrument({
            maxAge: 25,
            logOnly: environment.production,
        }),
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
