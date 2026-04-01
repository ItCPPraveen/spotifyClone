import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SongsActions, songsSelectors } from '@store/songs';
import { QueueActions } from '@store/queue';
import * as PlaylistsActions from '@store/playlists/playlists.actions';
import { selectPlaylists } from '@store/playlists/playlists.selectors';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

interface ITunesResult {
  trackName: string;
  artistName: string;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styles: []
})
export class SearchComponent implements OnInit, OnDestroy {
  songs$: Observable<any[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  sources$: Observable<string[]>;

  playlists$: Observable<any[]>;
  ytPlaylists: any[] = [];
  ytPlaylistsLoading = false;

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
    this.playlists$ = this.store.select(selectPlaylists);
  }

  ngOnInit() {
    // Load recent songs initially
    this.store.dispatch(SongsActions.getRecentSongs());
    this.store.dispatch(PlaylistsActions.getUserPlaylists());

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
      
      // Fetch YouTube Playlists
      this.ytPlaylistsLoading = true;
      this.http.get<any[]>(`${environment.apiUrl}/playlists/search/youtube?q=${encodeURIComponent(query)}`).subscribe({
        next: (res) => {
          this.ytPlaylists = res;
          this.ytPlaylistsLoading = false;
        },
        error: () => this.ytPlaylistsLoading = false
      });
    } else {
      // Restore recent songs if search is cleared
      this.store.dispatch(SongsActions.getRecentSongs());
      this.ytPlaylists = [];
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
