import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { QueueActions } from '@store/queue';
import { playlistSelectors, PlaylistActions } from '@store/playlists';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-song-card',
  templateUrl: './song-card.component.html',
  styles: []
})
export class SongCardComponent implements OnInit {
  @Input() song: any;
  
  playlists$!: Observable<any[]>;
  showPlaylistMenu = false;

  constructor(private store: Store) { }

  ngOnInit() {
    this.playlists$ = this.store.select(playlistSelectors.selectAllPlaylists);
  }

  onClickCard() {
    this.store.dispatch(QueueActions.clearQueue());
    // Give state a fraction of a second to clear before initiating the new play context
    setTimeout(() => {
        this.store.dispatch(QueueActions.playSong({ songId: this.song._id }));
    }, 100);
    this.showToast(`▶️ Playing "${this.song.title}"`);
  }

  onAddQueue(event: Event) {
    event.stopPropagation();
    this.showPlaylistMenu = false;
    this.store.dispatch(QueueActions.addToQueue({ songId: this.song._id }));
    this.showToast(`✅ "${this.song.title}" added to queue!`);
  }

  togglePlaylistMenu(event: Event) {
    event.stopPropagation();
    this.showPlaylistMenu = !this.showPlaylistMenu;
    if (this.showPlaylistMenu) {
      this.store.dispatch(PlaylistActions.loadPlaylists());
    }
  }

  addToPlaylist(event: Event, playlistId: string, playlistName: string) {
    event.stopPropagation();
    this.showPlaylistMenu = false;
    this.store.dispatch(PlaylistActions.addSongToPlaylist({ playlistId, songId: this.song._id }));
    this.showToast(`✅ Added to "${playlistName}"`);
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
}
