import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { playlistSelectors, PlaylistActions } from '@store/playlists';
import { QueueActions } from '@store/queue';

@Component({
  selector: 'app-playlist-detail',
  templateUrl: './playlist-detail.component.html',
  styles: []
})
export class PlaylistDetailComponent implements OnInit {
  playlist$!: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private store: Store
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.store.dispatch(PlaylistActions.loadPlaylist({ id }));
        this.playlist$ = this.store.select(playlistSelectors.selectSelectedPlaylist);
      }
    });
  }

  playAll(playlist: any) {
    if (!playlist.songs?.length) return;
    const songIds = playlist.songs.map((s: any) => s._id);
    this.store.dispatch(QueueActions.replaceQueue({ songIds }));
    this.showToast('▶️ Playing Playlist');
  }

  shufflePlay(playlist: any) {
    if (!playlist.songs?.length) return;
    const songIds = playlist.songs.map((s: any) => s._id);
    for (let i = songIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [songIds[i], songIds[j]] = [songIds[j], songIds[i]];
    }
    this.store.dispatch(QueueActions.replaceQueue({ songIds }));
    this.showToast('🔀 Shuffled Playlist');
  }

  addToQueue(playlist: any) {
    if (!playlist.songs?.length) return;
    const songIds = playlist.songs.map((s: any) => s._id);
    this.store.dispatch(QueueActions.addMultipleToQueue({ songIds }));
    this.showToast(`✅ Added ${songIds.length} songs to Queue`);
  }

  private showToast(message: string) {
    const toast = document.createElement('div');
    toast.className =
      'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse z-[9999]';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  playSong(song: any) {
    this.store.dispatch(QueueActions.addToQueue({ songId: song._id }));
    this.store.dispatch(QueueActions.playSong({ songId: song._id }));
  }

  removeSong(playlistId: string, songId: string) {
    this.store.dispatch(PlaylistActions.removeSongFromPlaylist({ playlistId, songId }));
  }

  formatDuration(ms: number): string {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
