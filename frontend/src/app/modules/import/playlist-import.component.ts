import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { playlistsSelectors, PlaylistsActions } from '@store/playlists';

@Component({
    selector: 'app-playlist-import',
    template: `
    <div>
      <h1 class="text-4xl font-bold mb-8">📋 Import Playlists</h1>

      <!-- Import Form -->
      <div class="bg-gray-800 rounded-lg p-8 mb-8 max-w-2xl">
        <p class="text-gray-300 mb-4">Paste a Spotify or Deezer playlist URL to import</p>
        
        <div class="flex gap-2">
          <input
            type="text"
            placeholder="https://open.spotify.com/playlist/..."
            (keyup.enter)="importPlaylist(urlInput.value)"
            #urlInput
            class="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            (click)="importPlaylist(urlInput.value)"
            [disabled]="loading$ | async"
            class="px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 rounded-lg font-semibold transition"
          >
            {{ (loading$ | async) ? '⏳ Importing...' : '📥 Import' }}
          </button>
        </div>

        <!-- Progress Bar -->
        <div *ngIf="loading$ | async" class="mt-4">
          <div class="w-full bg-gray-700 rounded-full h-2">
            <div class="bg-green-500 h-2 rounded-full animate-pulse w-1/3"></div>
          </div>
          <p class="text-sm text-gray-400 mt-2">Fetching songs from source...</p>
        </div>

        <!-- Error Message -->
        <div *ngIf="error$ | async as error" class="mt-4 p-4 bg-red-900/30 border border-red-600 rounded">
          <p class="text-red-400">❌ {{ error }}</p>
        </div>
      </div>

      <!-- Your Playlists -->
      <div>
        <h2 class="text-2xl font-bold mb-4">📚 Your Playlists</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let playlist of playlists$ | async"
            class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition cursor-pointer"
          >
            <img
              *ngIf="playlist.image_url"
              [src]="playlist.image_url"
              alt="{{ playlist.name }}"
              class="w-full h-40 object-cover rounded mb-3"
            />
            <div *ngIf="!playlist.image_url" class="w-full h-40 bg-gradient-to-br from-purple-600 to-blue-600 rounded mb-3 flex items-center justify-center">
              <span class="text-4xl">🎵</span>
            </div>
            <h3 class="font-semibold text-white truncate">{{ playlist.name }}</h3>
            <p class="text-gray-400 text-sm">{{ playlist.song_count }} songs • {{ formatDuration(playlist.total_duration_ms) }}</p>
            <div class="mt-3 flex gap-2">
              <span *ngIf="playlist.is_imported" class="px-2 py-1 bg-blue-600 text-xs rounded">Imported</span>
              <button
                (click)="deletePlaylist(playlist._id)"
                class="flex-1 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!(playlists$ | async)?.length" class="text-center py-12">
          <p class="text-gray-400">No playlists yet. Start importing!</p>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class PlaylistImportComponent implements OnInit {
    playlists$: Observable<any[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;

    constructor(private store: Store) {
        this.playlists$ = this.store.select(playlistsSelectors.selectPlaylists);
        this.loading$ = this.store.select(playlistsSelectors.selectLoading);
        this.error$ = this.store.select(playlistsSelectors.selectError);
    }

    ngOnInit() {
        this.store.dispatch(PlaylistsActions.getUserPlaylists());
    }

    importPlaylist(url: string) {
        if (url.trim()) {
            this.store.dispatch(PlaylistsActions.importPlaylist({ playlistUrl: url }));
        }
    }

    deletePlaylist(id: string) {
        if (confirm('Are you sure you want to delete this playlist?')) {
            this.store.dispatch(PlaylistsActions.deletePlaylist({ playlistId: id }));
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
