import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { songsSelectors, SongsActions } from '@store/songs';
import { QueueActions } from '@store/queue';
import { HttpClient } from '@angular/common/http';

interface ITunesResult {
  trackName: string;
  artistName: string;
}

@Component({
  selector: 'app-search',
  template: `
    <div>
      <h1 class="text-4xl font-bold mb-8">🎵 Search Songs</h1>

      <!-- Search Input -->
      <div class="mb-8 relative">
        <input
          type="text"
          placeholder="Search songs, artists..."
          (input)="onInput(searchInput.value)"
          (focus)="showSuggestions = true"
          (keyup.enter)="search(searchInput.value)"
          #searchInput
          class="w-full px-6 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <p class="text-gray-400 text-sm mt-2">
          Search across Spotify, Deezer, and local cache
        </p>

        <!-- Suggestions Dropdown -->
        <div *ngIf="showSuggestions && suggestions.length > 0" 
             class="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          <ul class="py-1">
            <li *ngFor="let suggestion of suggestions" 
                (mousedown)="selectSuggestion(suggestion, searchInput)"
                class="px-4 py-3 hover:bg-gray-700 cursor-pointer flex flex-col transition-colors">
              <span class="text-white font-medium">{{ suggestion.trackName }}</span>
              <span class="text-gray-400 text-sm">{{ suggestion.artistName }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="text-center py-12">
        <p class="text-gray-400">🔍 Searching across all sources...</p>
        <div class="flex justify-center gap-2 mt-4">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
          <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error$ | async as error" class="bg-red-900/30 border border-red-600 rounded p-4 mb-4">
        <p class="text-red-400">❌ Error: {{ error }}</p>
      </div>

      <!-- Sources Info -->
      <div *ngIf="(sources$ | async) as sources" class="mb-6 flex gap-2 flex-wrap">
        <span class="px-3 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
          🗄️ {{ sources.includes('mongodb_cache') ? 'Cache' : '' }}
        </span>
        <span
          *ngIf="sources.includes('spotify')"
          class="px-3 py-1 bg-green-900/50 text-green-300 text-xs rounded"
        >
          🎵 Spotify
        </span>
        <span
          *ngIf="sources.includes('deezer')"
          class="px-3 py-1 bg-orange-900/50 text-orange-300 text-xs rounded"
        >
          🎼 Deezer
        </span>
      </div>

      <!-- Songs Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-song-card
          *ngFor="let song of songs$ | async"
          [song]="song"
          (addedToQueue)="onSongAdded($event)"
        ></app-song-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="(songs$ | async)?.length === 0 && !(loading$ | async)" class="text-center py-12">
        <p class="text-gray-400 text-lg">Start searching to discover music!</p>
      </div>
    </div>
  `,
  styles: []
})
export class SearchComponent implements OnInit, OnDestroy {
  songs$: Observable<any[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  sources$: Observable<string[]>;

  suggestions: ITunesResult[] = [];
  showSuggestions = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private http: HttpClient,
    private eRef: ElementRef
  ) {
    this.songs$ = this.store.select(songsSelectors.selectSongs);
    this.loading$ = this.store.select(songsSelectors.selectLoading);
    this.error$ = this.store.select(songsSelectors.selectError);
    this.sources$ = this.store.select(songsSelectors.selectSources);
  }

  ngOnInit() {
    // Load recent songs initially
    this.store.dispatch(SongsActions.getRecentSongs());

    // Set up search debouncing for iTunes API
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.fetchSuggestions(query);
    });
  }

  @HostListener('document:mousedown', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showSuggestions = false;
    }
  }

  onInput(query: string) {
    this.searchSubject.next(query);
    this.showSuggestions = true;
  }

  fetchSuggestions(query: string) {
    if (!query.trim() || query.length < 2) {
      this.suggestions = [];
      return;
    }

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`;
    this.http.jsonp(url, 'callback').subscribe({
      next: (res: any) => {

        this.suggestions = (res.results || []).map((track: any) => ({
          trackName: track.trackName,
          artistName: track.artistName
        }));
      },
      error: (err) => console.error('iTunes search error:', err)
    });
  }

  selectSuggestion(suggestion: ITunesResult, inputElement: HTMLInputElement) {
    const query = `${suggestion.trackName}`;
    inputElement.value = query;
    this.showSuggestions = false;
    this.search(query);
  }

  search(query: string) {
    if (query.trim()) {
      this.store.dispatch(SongsActions.searchSongs({ query }));
    } else {
      // Restore recent songs if search is cleared
      this.store.dispatch(SongsActions.getRecentSongs());
    }
  }

  onSongAdded(songId: string) {
    this.store.dispatch(QueueActions.addToQueue({ songId }));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
