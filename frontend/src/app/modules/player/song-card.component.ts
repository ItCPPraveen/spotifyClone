import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { QueueActions } from '@store/queue';

@Component({
  selector: 'app-song-card',
  template: `
    <div
      class="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition transform hover:scale-105"
      (click)="onClickCard()"
    >
      <img
        [src]="song.cover_url"
        alt="{{ song.title }}"
        class="w-full h-40 object-cover rounded mb-4"
      />
      <h3 class="font-semibold text-white truncate">{{ song.title }}</h3>
      <p class="text-gray-400 text-sm truncate">{{ song.artist }}</p>
      <div class="mt-2 flex justify-between items-center">
        <span class="text-xs text-gray-500"
          >{{ (song.duration_ms / 1000 / 60) | number : '1.0-0' }}:00</span
        >
        <span
          class="px-2 py-1 bg-blue-600 text-xs rounded"
          *ngIf="song.api_source"
        >
          {{ song.api_source }}
        </span>
      </div>
      <div class="mt-3 text-sm text-gray-400">💡 Click to queue</div>
    </div>
  `,
  styles: []
})
export class SongCardComponent {
  @Input() song: any;
  @Output() addedToQueue = new EventEmitter<string>();

  constructor(private store: Store) { }

  onClickCard() {
    this.store.dispatch(QueueActions.addToQueue({ songId: this.song._id }));
    this.addedToQueue.emit(this.song._id);

    // Show toast notification
    this.showSuccessToast();
  }

  private showSuccessToast() {
    const toast = document.createElement('div');
    toast.className =
      'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse';
    toast.textContent = `✅ "${this.song.title}" added to queue!`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}
