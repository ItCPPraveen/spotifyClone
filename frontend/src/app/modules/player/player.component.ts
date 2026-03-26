import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { queueSelectors, QueueActions } from '@store/queue';
import { ElementRef, ViewChild, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SongsService } from '@services/songs.service';

@Component({
  selector: 'app-player',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <!-- ══════════════════════════════════════════════════════════
         FIXED PLAYER BAR
    ══════════════════════════════════════════════════════════ -->
    <div class="fixed bottom-0 left-0 right-0 z-[200] bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-gray-800 pb-[env(safe-area-inset-bottom)]">
      <!-- ── Main player row ─────────────────────────────────── -->
      <div class="flex flex-col md:grid md:grid-cols-3 items-center px-4 py-2 md:py-3 gap-2 md:gap-4 max-w-screen-2xl mx-auto">
        
        <!-- LEFT: Song info -->
        <div class="flex items-center justify-between md:justify-start w-full min-w-0 col-span-1">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Album art / placeholder -->
            <div class="w-12 h-12 rounded bg-gray-800 shrink-0 overflow-hidden border border-gray-700">
              <img *ngIf="currentSong?.cover_url" [src]="currentSong.cover_url" class="w-full h-full object-cover" alt="cover"/>
              <div *ngIf="!currentSong?.cover_url" class="w-full h-full flex items-center justify-center text-xl">🎵</div>
            </div>
            <div class="min-w-0 pr-2">
              <p class="text-sm font-semibold text-white truncate">{{ currentSong?.title || 'Nothing playing' }}</p>
              <p class="text-xs text-gray-400 truncate">{{ currentSong?.artist || '—' }}</p>
            </div>
          </div>

          <!-- Mobile Only Controls (Visible only < md) -->
          <div class="flex md:hidden items-center gap-2 sm:gap-3 shrink-0">
            <button (click)="previous()" class="p-1 sm:p-2 text-gray-400 hover:text-white">⏮</button>
            <button (click)="togglePlay()" class="p-1 sm:p-2 text-white text-xl">{{ isPlaying ? '⏸' : '▶' }}</button>
            <button (click)="next()" class="p-1 sm:p-2 text-gray-400 hover:text-white">⏭</button>
            <button (click)="toggleQueue()" class="p-1 sm:p-2 text-gray-400 hover:text-white ml-1 sm:ml-2" [class.text-green-500]="showQueue">🎶</button>
          </div>
        </div>

        <!-- CENTER: Playback Controls (Visible only >= md) -->
        <div class="hidden md:flex w-full md:w-auto flex-col items-center justify-center col-span-1">
          <div class="flex items-center gap-6">
            <button (click)="previous()" title="Previous" class="text-gray-400 hover:text-white transition-colors text-lg">⏮</button>
            
            <button (click)="togglePlay()" title="Play/Pause" class="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform text-xl">
              {{ isPlaying ? '⏸' : '▶' }}
            </button>
            
            <button (click)="next()" title="Next" class="text-gray-400 hover:text-white transition-colors text-lg">⏭</button>
          </div>
          
          <div class="flex items-center gap-2 mt-1 w-full max-w-md text-xs text-gray-400 tabular-nums">
            <span>{{ currentTimeStr }}</span>
            <div class="flex-1 relative flex items-center group">
              <input type="range" 
                     class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 hover:h-1.5 transition-all outline-none"
                     [min]="0" 
                     [max]="100" 
                     [value]="progressPercent" 
                     (input)="onSeekScrub($event)">
            </div>
            <span>{{ durationStr }}</span>
          </div>
        </div>

        <!-- RIGHT: Extra Controls (Visible only >= md) -->
        <div class="hidden md:flex w-full md:w-auto items-center justify-end gap-4 col-span-1">
          <span *ngIf="sleepTimerExpiry" class="text-xs text-green-500 flex items-center gap-1">
            <span>⏱</span>{{ getRemainingTime() }}
          </span>

          <div class="flex gap-1.5">
            <button *ngFor="let opt of timerOptions" (click)="setSleepTimer(opt)" title="Sleep timer: {{opt}}m" class="px-2 py-0.5 text-[10px] font-medium rounded border border-gray-600 text-gray-300 hover:border-white hover:text-white transition-colors">
              {{opt}}m
            </button>
          </div>

          <button (click)="toggleQueue()" title="Queue" class="p-2 text-gray-400 hover:text-white transition-colors relative" [class.text-green-500]="showQueue">
            <span class="text-lg">🎶</span>
            <span class="absolute -top-1 -right-1 bg-green-500 text-black text-[9px] font-bold px-1 rounded-full">{{ queueLength }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         QUEUE PANEL (slide-up drawer)
    ══════════════════════════════════════════════════════════ -->
    <div *ngIf="showQueue" 
      class="fixed z-[199] flex flex-col overflow-hidden shadow-2xl bg-[#121212] border border-gray-800 animate-slideUp
             bottom-[68px] md:bottom-[88px] right-0 md:right-4 w-full md:w-[360px] h-[60vh] md:max-h-[480px] rounded-t-xl md:rounded-xl">
      <!-- Panel header -->
      <div class="flex justify-between items-center px-4 py-3 border-b border-gray-800 bg-[#181818]">
        <span class="font-bold text-white text-sm">Up Next</span>
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-400">{{ queueLength }} songs</span>
          <button (click)="clearQueue()" class="text-[11px] text-green-500 hover:text-green-400 transition-colors" *ngIf="queueLength > 0">Clear all</button>
          <button (click)="toggleQueue()" class="text-gray-400 hover:text-white text-lg leading-none ml-1">&times;</button>
        </div>
      </div>

      <!-- Queue list with drag-to-reorder -->
      <div class="overflow-y-auto flex-1 bg-[#121212]" id="queueList">
        <div
          *ngFor="let song of queueSongs; let i = index"
          class="flex items-center gap-3 px-4 py-2 cursor-grab transition-colors border-b border-white/5 relative group"
          [draggable]="true"
          (dragstart)="onDragStart(i, $event)"
          (dragover)="onDragOver(i, $event)"
          (drop)="onDrop(i)"
          (dragend)="onDragEnd()"
          [ngClass]="i === currentIndex ? 'bg-green-900/10' : (dragOverIndex === i ? 'bg-gray-800' : 'hover:bg-gray-800')"
        >
          <!-- Drag handle -->
          <span class="text-gray-600 text-sm shrink-0 cursor-grab group-hover:text-gray-400">⠿</span>

          <!-- Position / playing indicator -->
          <span class="w-5 text-center text-xs shrink-0" [ngClass]="i === currentIndex ? 'text-green-500 font-bold' : 'text-gray-500'">
            {{ i === currentIndex ? '♪' : (i + 1) }}
          </span>

          <!-- Cover -->
          <div class="w-10 h-10 rounded shrink-0 overflow-hidden bg-gray-800">
            <img *ngIf="song.cover_url" [src]="song.cover_url" class="w-full h-full object-cover" alt="">
            <div *ngIf="!song.cover_url" class="w-full h-full flex items-center justify-center text-sm">🎵</div>
          </div>

          <!-- Title + Artist -->
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-medium truncate" [ngClass]="i === currentIndex ? 'text-green-500' : 'text-white'">{{ song.title }}</p>
            <p class="text-[11px] text-gray-400 truncate">{{ song.artist }}</p>
          </div>

          <!-- Duration -->
          <span class="text-[11px] text-gray-500 shrink-0 hidden sm:block">{{ formatDuration(song.duration_ms) }}</span>

          <!-- Play / Remove buttons -->
          <div class="flex gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button (click)="playAt(i)" title="Play this song" class="w-7 h-7 flex items-center justify-center rounded-full bg-gray-700 text-white hover:bg-green-500 text-xs transition-colors">
              ▶
            </button>
            <button (click)="removeFromQueue(song._id)" title="Remove" class="w-7 h-7 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-red-500 hover:text-white transition-colors">
              ✕
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="queueLength === 0" class="py-10 px-5 text-center text-gray-500">
          <p class="text-3xl mb-3">🎵</p>
          <p class="text-sm font-medium text-gray-400">Queue is empty</p>
          <p class="text-xs mt-1.5">Search for songs and add them to your queue</p>
        </div>
      </div>
    </div>

    <!-- ── Hidden YouTube container ─────────────────────────────────── -->
    <div style="position:absolute; left:-9999px; top:-9999px; width:1px; height:1px;">
      <div id="youtube-player-container"></div>
    </div>

    <!-- ── Hidden audio element ──────────────────────────────────── -->
    <audio #audioElement
      (timeupdate)="onTimeUpdate($event)"
      (ended)="next()"
      (durationchange)="onDurationChange($event)"
      (play)="onAudioPlay()"
      (pause)="onAudioPause()"
      style="display:none">
    </audio>
  `,
  styles: []
})
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild('audioElement') audioRef!: ElementRef<HTMLAudioElement>;

  // ── State
  currentSong: any = null;
  currentIndex = 0;
  queueSongs: any[] = [];
  queueLength = 0;
  isPlaying = false;
  showQueue = false;
  sleepTimerExpiry: Date | null = null;
  timerOptions = [5, 15, 30, 60];

  // ── Progress
  progressPercent = 0;
  currentTimeSec = 0;
  durationSec = 0;
  get currentTimeStr() { return this.secToStr(this.currentTimeSec); }
  get durationStr()    { return this.secToStr(this.durationSec); }

  // ── Drag state
  dragFromIndex = -1;
  dragOverIndex = -1;

  // ── YouTube API
  private ytPlayer: any = null;
  private isYtApiReady = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private songsService: SongsService,
  ) {}

  ngOnInit() {
    this.store.dispatch(QueueActions.getQueue());

    // Initialize YouTube IFrame API
    this.initYouTubeAPI();

    // Track queue songs
    this.store.select(queueSelectors.selectQueueSongs)
      .pipe(takeUntil(this.destroy$))
      .subscribe(songs => {
        this.queueSongs = songs;
        this.queueLength = songs.length;
        this.cdRef.markForCheck();
      });

    // Track current index
    this.store.select(queueSelectors.selectCurrentIndex)
      .pipe(takeUntil(this.destroy$))
      .subscribe(idx => {
        this.currentIndex = idx;
        this.cdRef.markForCheck();
      });

    // Track current song → trigger playback change
    this.store.select(queueSelectors.selectCurrentSong)
      .pipe(takeUntil(this.destroy$))
      .subscribe(song => {
        const prev = this.currentSong;
        this.currentSong = song;
        if (song && (!prev || prev._id !== song._id)) {
          this.playSong(song);
        } else if (!song) {
          this.pauseAudio();
        }
        
        // If playSong was blocked by autoplay policy, the listeners will correct this,
        // but we assume it's true until notified otherwise.
        this.cdRef.markForCheck();
      });

    // Track sleep timer
    this.store.select(queueSelectors.selectSleepTimer)
      .pipe(takeUntil(this.destroy$))
      .subscribe(t => {
        this.sleepTimerExpiry = t?.expiresAt ? new Date(t.expiresAt) : null;
        this.cdRef.markForCheck();
      });

    // Ticker for YouTube progress & sleep timer
    this.ngZone.runOutsideAngular(() => {
      interval(500).pipe(takeUntil(this.destroy$)).subscribe(() => {
        // Sleep timer check
        if (this.sleepTimerExpiry && new Date() >= this.sleepTimerExpiry) {
          this.ngZone.run(() => {
            this.sleepTimerExpiry = null;
            this.pauseAudio();
          });
        }
        
        // YouTube progress check
        if (this.isPlaying && this.isYouTubeSong() && this.ytPlayer && this.ytPlayer.getCurrentTime) {
          this.ngZone.run(() => {
            const current = this.ytPlayer.getCurrentTime();
            const duration = this.ytPlayer.getDuration();
            this.currentTimeSec = current || 0;
            this.durationSec = duration || 0;
            if (this.durationSec > 0) {
              this.progressPercent = (this.currentTimeSec / this.durationSec) * 100;
            }
            this.cdRef.markForCheck();
          });
        }
      });
    });
  }

  // ── YouTube Initializer ────────────────────────────────────────

  private initYouTubeAPI() {
    if ((window as any).YT) {
      this.isYtApiReady = true;
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    (window as any).onYouTubeIframeAPIReady = () => {
      this.ngZone.run(() => {
        this.isYtApiReady = true;
        // If we already tried to play a song before API loaded, play it now
        if (this.isYouTubeSong() && this.currentSong?.youtube_id) {
          this.playYouTube(this.currentSong.youtube_id);
        }
      });
    };
  }

  // ── Playback ───────────────────────────────────────────────────

  togglePlay() {
    if (this.isPlaying) {
      this.pauseAudio();
    } else {
      if (this.isYouTubeSong() && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
        this.ytPlayer.playVideo();
        this.isPlaying = true;
      } else if (this.currentSong && !this.isYouTubeSong() && this.audioRef) {
        this.audioRef.nativeElement.play().then(() => {
           this.isPlaying = true;
           this.cdRef.markForCheck();
        }).catch(e => {
           console.warn('Autoplay prevented or play failed', e);
           this.isPlaying = false;
           this.cdRef.markForCheck();
        });
      }
    }
  }

  private playSong(song: any) {
    if (song.api_source === 'spotify' && !song.youtube_id) {
       this.songsService.getSongById(song._id).subscribe({
         next: (resolved) => {
           this.playResolvedSong(resolved);
         },
         error: () => this.playResolvedSong(song)
       });
       return;
    }
    this.playResolvedSong(song);
  }

  private playResolvedSong(song: any) {
    this.isPlaying = true;
    this.progressPercent = 0;
    this.currentTimeSec = 0;
    this.durationSec = 0;

    // Pause whichever is currently playing
    this.audioRef?.nativeElement.pause();
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      this.ytPlayer.pauseVideo();
    }

    if (song.api_source === 'spotify' && song.youtube_id) {
      // It has been resolved to youtube!
      if (this.isYtApiReady) {
        this.playYouTube(song.youtube_id);
      }
    } else if (song.api_source === 'youtube' && song.youtube_id) {
      if (this.isYtApiReady) {
        this.playYouTube(song.youtube_id);
      }
    } else if (song.preview_url) {
      const audio = this.audioRef?.nativeElement;
      if (audio) {
        if (audio.src !== song.preview_url) audio.src = song.preview_url;
        audio.play().catch(e => console.error('Audio failed', e));
      }
    }
    this.cdRef.markForCheck();
  }

  private playYouTube(videoId: string) {
    if (this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
      this.ytPlayer.loadVideoById(videoId);
    } else {
      this.ytPlayer = new (window as any).YT.Player('youtube-player-container', {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: { 'autoplay': 1, 'controls': 0, 'enablejsapi': 1 },
        events: {
          'onReady': (event: any) => {
            event.target.playVideo();
          },
          'onStateChange': (event: any) => {
            this.ngZone.run(() => {
              if (event.data === (window as any).YT.PlayerState.ENDED) {
                this.next();
              } else if (event.data === (window as any).YT.PlayerState.PLAYING) {
                this.isPlaying = true;
                this.cdRef.markForCheck();
              } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
                this.isPlaying = false;
                this.cdRef.markForCheck();
              }
            });
          }
        }
      });
    }
  }

  private pauseAudio() {
    this.isPlaying = false;
    this.audioRef?.nativeElement.pause();
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      this.ytPlayer.pauseVideo();
    }
  }

  isYouTubeSong(): boolean {
    return !!this.currentSong && !!this.currentSong.youtube_id;
  }

  // ── Progress ───────────────────────────────────────────────────

  onTimeUpdate(e: Event) {
    const audio = e.target as HTMLAudioElement;
    this.currentTimeSec = audio.currentTime;
    if (audio.duration) {
      this.progressPercent = (audio.currentTime / audio.duration) * 100;
    }
  }

  onDurationChange(e: Event) {
    this.durationSec = (e.target as HTMLAudioElement).duration || 0;
  }

  onAudioPlay() {
    this.isPlaying = true;
    this.cdRef.markForCheck();
  }

  onAudioPause() {
    this.isPlaying = false;
    this.cdRef.markForCheck();
  }

  onSeekScrub(event: any) {
    const val = parseFloat(event.target.value);
    
    if (this.isYouTubeSong() && this.ytPlayer && typeof this.ytPlayer.seekTo === 'function') {
      const dur = this.ytPlayer.getDuration() || 0;
      if (dur > 0) {
        const targetTime = (val / 100) * dur;
        this.ytPlayer.seekTo(targetTime, true);
        this.progressPercent = val;
        this.currentTimeSec = targetTime;
      }
    } else if (this.audioRef?.nativeElement?.duration) {
      const audio = this.audioRef.nativeElement;
      const targetTime = (val / 100) * audio.duration;
      audio.currentTime = targetTime;
      this.currentTimeSec = targetTime;
      this.progressPercent = val;
    }
  }

  private secToStr(s: number): string {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  // ── Queue ──────────────────────────────────────────────────────

  next()     { this.store.dispatch(QueueActions.playNext()); }
  previous() { this.store.dispatch(QueueActions.playPrevious()); }

  playAt(index: number) {
    // Set currentIndex directly by dispatching playNext/playPrevious diff
    const diff = index - this.currentIndex;
    if (diff === 0) { this.togglePlay(); return; }
    // Simpler: dispatch reorder so song goes to currentIndex+1 then playNext
    // Actually we just change the currentIndex in store by dispatching enough next/prev
    // Best approach: dispatch a dedicated selectIndex — we don't have it,
    // so let's move the clicked song to position currentIndex+1 and playnext
    const from = index;
    const to = this.currentIndex + (diff > 0 ? 1 : -1);
    this.store.dispatch(QueueActions.reorderQueue({ previousIndex: from, currentIndex: to }));
    if (diff > 0) this.next(); else this.previous();
  }

  removeFromQueue(songId: string) {
    this.store.dispatch(QueueActions.removeFromQueue({ songId }));
  }

  clearQueue() {
    this.store.dispatch(QueueActions.clearQueue());
  }

  toggleQueue() { this.showQueue = !this.showQueue; }

  formatDuration(ms: number): string {
    if (!ms) return '';
    return this.secToStr(ms / 1000);
  }

  // ── Sleep Timer ────────────────────────────────────────────────

  setSleepTimer(minutes: number) {
    this.store.dispatch(QueueActions.setSleepTimer({ durationMinutes: minutes }));
  }

  getRemainingTime(): string {
    if (!this.sleepTimerExpiry) return '';
    const ms = new Date(this.sleepTimerExpiry).getTime() - Date.now();
    if (ms <= 0) return '0:00';
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ── Drag & Drop (native HTML5) ────────────────────────────────

  onDragStart(index: number, e: DragEvent) {
    this.dragFromIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
  }

  onDragOver(index: number, e: DragEvent) {
    e.preventDefault();
    this.dragOverIndex = index;
  }

  onDrop(index: number) {
    if (this.dragFromIndex !== -1 && this.dragFromIndex !== index) {
      this.store.dispatch(QueueActions.reorderQueue({
        previousIndex: this.dragFromIndex,
        currentIndex: index,
      }));
    }
    this.dragFromIndex = -1;
    this.dragOverIndex = -1;
  }

  onDragEnd() {
    this.dragFromIndex = -1;
    this.dragOverIndex = -1;
  }

  // ── Lifecycle ─────────────────────────────────────────────────

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
