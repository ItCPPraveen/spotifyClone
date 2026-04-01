import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { QueueActions } from '@store/queue';
import * as PlaylistsActions from '@store/playlists/playlists.actions';

@Component({
  selector: 'app-youtube-playlist',
  templateUrl: './youtube-playlist.component.html',
  styles: []
})
export class YoutubePlaylistComponent implements OnInit {
  playlist: any = null;
  tracks: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private store: Store
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchPlaylistItems(id);
      }
    });
  }

  fetchPlaylistItems(id: string) {
    this.loading = true;
    this.http.get<{ playlist: any, tracks: any[] }>(`${environment.apiUrl}/playlists/youtube/${id}/items`)
      .subscribe({
        next: (res) => {
          this.playlist = res.playlist;
          this.tracks = res.tracks;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load playlist details.';
          this.loading = false;
        }
      });
  }

  playAll() {
    if (this.tracks?.length > 0) {
      this.playSong(0);
    }
  }

  importPlaylist() {
    if (this.playlist?.id) {
      const url = `https://youtube.com/playlist?list=${this.playlist.id}`;
      this.store.dispatch(PlaylistsActions.importPlaylist({ playlistUrl: url }));
      alert('Importing playlist! It will appear in your library shortly.');
    }
  }

  playSong(index: number) {
    const formattedSongs = this.tracks.map(t => ({
      _id: t.id,
      title: t.title,
      artist: t.channelTitle,
      duration_ms: t.durationMs,
      cover_url: t.thumbnails?.medium?.url || t.thumbnails?.default?.url,
      api_source: 'youtube',
      youtube_id: t.id
    }));

    this.store.dispatch(QueueActions.setTransientQueue({
      songs: formattedSongs,
      currentIndex: index
    }));
  }

  formatDuration(ms: number): string {
    if (!ms) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  get totalDuration() {
    if (!this.tracks) return 0;
    return this.tracks.reduce((acc, track) => acc + (track.durationMs || 0), 0);
  }
}
