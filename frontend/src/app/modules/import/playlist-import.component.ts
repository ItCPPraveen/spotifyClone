import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { playlistSelectors, PlaylistActions } from '@store/playlists';

@Component({
    selector: 'app-playlist-import',
    templateUrl: './playlist-import.component.html',
    styles: []
})
export class PlaylistImportComponent implements OnInit {
    playlists$: Observable<any[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;

    constructor(private store: Store) {
        this.playlists$ = this.store.select(playlistSelectors.selectAllPlaylists);
        this.loading$ = this.store.select(playlistSelectors.selectPlaylistLoading);
        // Error handling omitted as new state doesn't export strong error selector currently
        this.error$ = new Observable<null>(sub => sub.next(null));
    }

    ngOnInit() {
        this.store.dispatch(PlaylistActions.loadPlaylists());
    }

    createPlaylist(name: string, description: string) {
        if (name.trim()) {
            this.store.dispatch(PlaylistActions.createPlaylist({ name, description }));
        }
    }

    importPlaylist(url: string) {
        if (url.trim()) {
            this.store.dispatch(PlaylistActions.importPlaylist({ url }));
        }
    }

    deletePlaylist(id: string) {
        if (confirm('Are you sure you want to delete this playlist?')) {
            this.store.dispatch(PlaylistActions.deletePlaylist({ id }));
        }
    }

    formatDuration(ms: number): string {
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
    }
}
