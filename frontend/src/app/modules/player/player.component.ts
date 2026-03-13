import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { queueSelectors, QueueActions } from '@store/queue';
import { ElementRef, ViewChild, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-player',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <!-- ══════════════════════════════════════════════════════════
         FIXED PLAYER BAR
    ══════════════════════════════════════════════════════════ -->
    <div style="
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
      background: rgba(13,13,13,0.97);
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
    ">
      <!-- ── Progress track (clickable) ──────────────────────── -->
      <div
        class="progress-track"
        style="border-radius:0;"
        (click)="seekTo($event)"
      >
        <div class="progress-fill" [style.width.%]="progressPercent"></div>
      </div>

      <!-- ── Main player row ─────────────────────────────────── -->
      <div style="
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding: 12px 24px;
        gap: 16px;
      ">

        <!-- LEFT: Song info -->
        <div style="display:flex; align-items:center; gap:14px; min-width:0;">
          <!-- Album art / placeholder -->
          <div style="
            width: 48px; height: 48px; border-radius: 8px; flex-shrink:0;
            background: var(--surface-2);
            overflow: hidden;
            border: 1px solid var(--border);
          ">
            <img
              *ngIf="currentSong?.cover_url"
              [src]="currentSong.cover_url"
              style="width:100%; height:100%; object-fit:cover;"
              alt="cover"
            />
            <div *ngIf="!currentSong?.cover_url" style="
              width:100%; height:100%;
              display:flex; align-items:center; justify-content:center;
              font-size:22px;
            ">🎵</div>
          </div>
          <div style="min-width:0;">
            <p style="font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text);">
              {{ currentSong?.title || 'Nothing playing' }}
            </p>
            <p style="font-size:12px; color:var(--text-muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              {{ currentSong?.artist || '—' }}
            </p>
          </div>
          <!-- Source badge -->
          <span *ngIf="currentSong?.api_source" style="
            font-size:10px; font-weight:600; padding:2px 7px;
            border-radius:4px; flex-shrink:0;
            background: {{ currentSong.api_source === 'youtube' ? 'rgba(255,0,0,0.2)' : 'rgba(30,215,96,0.15)' }};
            color: {{ currentSong.api_source === 'youtube' ? '#fc5c5c' : '#1ed760' }};
            border: 1px solid {{ currentSong.api_source === 'youtube' ? 'rgba(255,0,0,0.3)' : 'rgba(30,215,96,0.3)' }};
          ">{{ currentSong.api_source === 'youtube' ? 'YT' : 'SP' }}</span>
        </div>

        <!-- CENTER: Controls -->
        <div style="display:flex; align-items:center; gap:8px;">
          <!-- Sleep timer display -->
          <span *ngIf="sleepTimerExpiry" style="
            font-size:11px; color:var(--accent); margin-right:4px;
            display:flex; align-items:center; gap:4px;
          ">
            <span>⏱</span>{{ getRemainingTime() }}
          </span>

          <!-- Previous -->
          <button (click)="previous()" title="Previous"
            style="
              width:36px; height:36px; border-radius:50%; border:none;
              background: var(--surface-2); color: var(--text-muted);
              cursor:pointer; font-size:15px;
              display:flex; align-items:center; justify-content:center;
              transition: all 0.15s;
            "
            onmouseover="this.style.background='var(--surface-3)'; this.style.color='var(--text)'"
            onmouseout="this.style.background='var(--surface-2)'; this.style.color='var(--text-muted)'"
          >⏮</button>

          <!-- Play / Pause (big) -->
          <button (click)="togglePlay()" title="Play/Pause"
            style="
              width:48px; height:48px; border-radius:50%; border:none;
              background: var(--accent);
              color: #fff; cursor:pointer; font-size:20px;
              display:flex; align-items:center; justify-content:center;
              box-shadow: 0 0 16px var(--accent-glow);
              transition: all 0.15s;
            "
            onmouseover="this.style.transform='scale(1.08)'; this.style.background='var(--accent-dark)'"
            onmouseout="this.style.transform='scale(1)'; this.style.background='var(--accent)'"
          >{{ isPlaying ? '⏸' : '▶' }}</button>

          <!-- Next -->
          <button (click)="next()" title="Next"
            style="
              width:36px; height:36px; border-radius:50%; border:none;
              background: var(--surface-2); color: var(--text-muted);
              cursor:pointer; font-size:15px;
              display:flex; align-items:center; justify-content:center;
              transition: all 0.15s;
            "
            onmouseover="this.style.background='var(--surface-3)'; this.style.color='var(--text)'"
            onmouseout="this.style.background='var(--surface-2)'; this.style.color='var(--text-muted)'"
          >⏭</button>

          <!-- Time display -->
          <span style="font-size:11px; color:var(--text-dim); margin-left:8px; font-variant-numeric:tabular-nums;">
            {{ currentTimeStr }} / {{ durationStr }}
          </span>
        </div>

        <!-- RIGHT: Extra controls -->
        <div style="display:flex; align-items:center; justify-content:flex-end; gap:8px;">
          <!-- Sleep timer buttons -->
          <div style="display:flex; gap:4px;">
            <button *ngFor="let opt of timerOptions"
              (click)="setSleepTimer(opt)"
              title="Sleep timer: {{opt}} min"
              style="
                padding: 4px 9px; border-radius: 6px; border: 1px solid var(--border);
                background: transparent; color: var(--text-muted);
                font-size: 11px; font-weight:500; cursor:pointer;
                transition: all 0.15s;
              "
              onmouseover="this.style.borderColor='var(--accent)'; this.style.color='var(--accent)'"
              onmouseout="this.style.borderColor='var(--border)'; this.style.color='var(--text-muted)'"
            >{{opt}}m</button>
          </div>

          <!-- Queue toggle button -->
          <button
            (click)="toggleQueue()"
            title="Show queue"
            style="
              padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border);
              background: {{ showQueue ? 'var(--accent)' : 'transparent' }};
              color: {{ showQueue ? '#fff' : 'var(--text-muted)' }};
              font-size: 13px; font-weight:600; cursor:pointer;
              transition: all 0.15s; display:flex; align-items:center; gap:6px;
              white-space:nowrap;
            "
            [style.background]="showQueue ? 'var(--accent)' : 'transparent'"
            [style.color]="showQueue ? '#fff' : 'var(--text-muted)'"
          >
            🎶 Queue <span style="
              background: rgba(255,255,255,0.15); border-radius:10px;
              padding: 1px 6px; font-size:11px;
            ">{{ queueLength }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         QUEUE PANEL (slide-up drawer)
    ══════════════════════════════════════════════════════════ -->
    <div *ngIf="showQueue" style="
      position: fixed; bottom: 88px; right: 20px; z-index: 199;
      width: 360px; max-height: 480px;
      background: var(--surface);
      border: 1px solid var(--border); border-radius: 16px;
      overflow: hidden; display:flex; flex-direction:column;
      box-shadow: 0 -4px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
      animation: slideUp 0.2s ease-out;
    ">
      <!-- Panel header -->
      <div style="
        display:flex; justify-content:space-between; align-items:center;
        padding: 16px 20px 12px;
        border-bottom: 1px solid var(--border);
      ">
        <span style="font-size:14px; font-weight:700;">Up Next</span>
        <div style="display:flex; gap:8px; align-items:center;">
          <span style="font-size:12px; color:var(--text-muted);">{{ queueLength }} songs</span>
          <button
            (click)="clearQueue()"
            style="
              font-size:11px; color:var(--accent); background:none; border:none;
              cursor:pointer; padding:2px 6px; border-radius:4px;
            "
            *ngIf="queueLength > 0"
          >Clear all</button>
          <button (click)="toggleQueue()"
            style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:18px; line-height:1;"
          >×</button>
        </div>
      </div>

      <!-- Queue list with drag-to-reorder -->
      <div style="overflow-y:auto; flex:1;" id="queueList">
        <div
          *ngFor="let song of queueSongs; let i = index"
          class="queue-item animate-fadeIn"
          [draggable]="true"
          (dragstart)="onDragStart(i, $event)"
          (dragover)="onDragOver(i, $event)"
          (drop)="onDrop(i)"
          (dragend)="onDragEnd()"
          style="
            display:flex; align-items:center; gap:12px;
            padding: 10px 16px; cursor:grab;
            transition: background 0.15s;
            border-bottom: 1px solid rgba(255,255,255,0.03);
            position: relative;
          "
          [style.background]="i === currentIndex ? 'rgba(229,62,62,0.1)' : (dragOverIndex === i ? 'var(--surface-2)' : 'transparent')"
          onmouseover="if(!this.style.background.includes('229,62,62')) this.style.background='var(--surface-2)'"
          onmouseout="if(!this.style.background.includes('229,62,62')) this.style.background=''"
        >
          <!-- Drag handle -->
          <span style="color:var(--text-dim); font-size:14px; flex-shrink:0; cursor:grab;">⠿</span>

          <!-- Position / playing indicator -->
          <span style="
            width:20px; text-align:center; font-size:12px; flex-shrink:0;
            color: {{ i === currentIndex ? 'var(--accent)' : 'var(--text-dim)' }};
          " [style.color]="i === currentIndex ? 'var(--accent)' : 'var(--text-dim)'">
            {{ i === currentIndex ? '♪' : (i + 1) }}
          </span>

          <!-- Cover -->
          <div style="width:38px; height:38px; border-radius:6px; flex-shrink:0; overflow:hidden; background:var(--surface-3);">
            <img *ngIf="song.cover_url" [src]="song.cover_url" style="width:100%; height:100%; object-fit:cover;" alt="">
            <div *ngIf="!song.cover_url" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:18px;">🎵</div>
          </div>

          <!-- Title + Artist -->
          <div style="flex:1; min-width:0;">
            <p style="
              font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
              color: {{ i === currentIndex ? 'var(--accent)' : 'var(--text)' }};
            " [style.color]="i === currentIndex ? 'var(--accent)' : 'var(--text)'">{{ song.title }}</p>
            <p style="font-size:11px; color:var(--text-dim); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ song.artist }}</p>
          </div>

          <!-- Duration -->
          <span style="font-size:11px; color:var(--text-dim); flex-shrink:0;">{{ formatDuration(song.duration_ms) }}</span>

          <!-- Play / Remove buttons -->
          <div style="display:flex; gap:4px; flex-shrink:0;">
            <button (click)="playAt(i)" title="Play this song"
              style="
                width:28px; height:28px; border-radius:50%; border:1px solid var(--border);
                background:none; color:var(--text-muted); cursor:pointer; font-size:12px;
                display:flex; align-items:center; justify-content:center; transition: all 0.15s;
              "
              onmouseover="this.style.borderColor='var(--accent)'; this.style.color='var(--accent)'"
              onmouseout="this.style.borderColor='var(--border)'; this.style.color='var(--text-muted)'"
            >▶</button>
            <button (click)="removeFromQueue(song._id)" title="Remove"
              style="
                width:28px; height:28px; border-radius:50%; border:1px solid var(--border);
                background:none; color:var(--text-muted); cursor:pointer; font-size:14px;
                display:flex; align-items:center; justify-content:center; transition: all 0.15s;
              "
              onmouseover="this.style.borderColor='rgba(229,62,62,0.6)'; this.style.color='var(--accent)'"
              onmouseout="this.style.borderColor='var(--border)'; this.style.color='var(--text-muted)'"
            >✕</button>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="queueLength === 0" style="
          padding: 40px 20px; text-align:center; color: var(--text-dim);
        ">
          <p style="font-size:32px; margin-bottom:12px;">🎵</p>
          <p style="font-size:14px;">Queue is empty</p>
          <p style="font-size:12px; margin-top:6px;">Search for songs and add them to your queue</p>
        </div>
      </div>
    </div>

    <!-- ── Hidden YouTube iframe ─────────────────────────────────── -->
    <div style="position:absolute; left:-9999px; top:-9999px; width:1px; height:1px;" *ngIf="isYouTubeSong()">
      <iframe #youtubePlayer
        width="1" height="1"
        [src]="getYouTubeEmbedUrl()"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>

    <!-- ── Hidden audio element ──────────────────────────────────── -->
    <audio #audioElement
      (timeupdate)="onTimeUpdate($event)"
      (ended)="next()"
      (durationchange)="onDurationChange($event)"
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

  // ── YouTube URL
  private currentYouTubeId = '';
  private youtubeUrl!: SafeResourceUrl;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.store.dispatch(QueueActions.getQueue());

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
        this.cdRef.markForCheck();
      });

    // Track sleep timer
    this.store.select(queueSelectors.selectSleepTimer)
      .pipe(takeUntil(this.destroy$))
      .subscribe(t => {
        this.sleepTimerExpiry = t?.expiresAt ? new Date(t.expiresAt) : null;
        this.cdRef.markForCheck();
      });

    // 1-second ticker: update progress for YouTube (which has no timeupdate event) + check sleep timer
    this.ngZone.runOutsideAngular(() => {
      interval(500).pipe(takeUntil(this.destroy$)).subscribe(() => {
        // Sleep timer auto-stop
        if (this.sleepTimerExpiry && new Date() >= this.sleepTimerExpiry) {
          this.ngZone.run(() => {
            this.sleepTimerExpiry = null;
            this.pauseAudio();
          });
        }
        this.ngZone.run(() => { this.cdRef.markForCheck(); });
      });
    });
  }

  // ── Playback ───────────────────────────────────────────────────

  togglePlay() {
    if (this.isPlaying) {
      this.pauseAudio();
    } else {
      this.isPlaying = true;
      if (this.currentSong && !this.isYouTubeSong() && this.audioRef) {
        this.audioRef.nativeElement.play().catch(e => console.error('Play failed', e));
      }
      // For YT: isYouTubeSong() = true triggers iframe re-mount with autoplay=1
    }
  }

  private playSong(song: any) {
    this.isPlaying = true;
    this.progressPercent = 0;
    this.currentTimeSec = 0;
    this.durationSec = 0;

    if (song.api_source === 'youtube' && song.youtube_id) {
      this.currentYouTubeId = song.youtube_id;
      this.youtubeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${song.youtube_id}?autoplay=1&enablejsapi=1`
      );
      if (this.audioRef) this.audioRef.nativeElement.pause();
    } else if (song.preview_url) {
      this.currentYouTubeId = '';
      const audio = this.audioRef?.nativeElement;
      if (audio) {
        if (audio.src !== song.preview_url) audio.src = song.preview_url;
        audio.play().catch(e => console.error('Audio failed', e));
      }
    }
  }

  private pauseAudio() {
    this.isPlaying = false;
    this.audioRef?.nativeElement.pause();
  }

  isYouTubeSong(): boolean {
    return !!this.currentSong && this.currentSong.api_source === 'youtube' && !!this.currentSong.youtube_id;
  }

  getYouTubeEmbedUrl(): SafeResourceUrl {
    return this.youtubeUrl || this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
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

  seekTo(e: MouseEvent) {
    if (!this.audioRef?.nativeElement.duration) return;
    const track = e.currentTarget as HTMLElement;
    const ratio = e.offsetX / track.offsetWidth;
    const audio = this.audioRef.nativeElement;
    audio.currentTime = ratio * audio.duration;
    this.currentTimeSec = audio.currentTime;
    this.progressPercent = ratio * 100;
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
