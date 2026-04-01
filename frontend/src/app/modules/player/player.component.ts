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
  templateUrl: './player.component.html',
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
