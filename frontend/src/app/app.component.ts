import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { authSelectors } from '@store/auth';
import { AuthActions } from '@store/auth';

@Component({
    selector: 'app-root',
    template: `
    <div class="app-shell" style="display:flex; flex-direction:column; min-height:100vh; background:var(--bg);">

      <!-- ── Top Navigation ─────────────────────────────────────── -->
      <nav style="
        display:flex; justify-content:space-between; align-items:center;
        padding: 0 28px; height: 60px;
        background: rgba(13,13,13,0.95);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border);
        position: sticky; top: 0; z-index: 100;
      ">
        <!-- Logo -->
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="
            width:34px; height:34px; border-radius:50%;
            background: var(--accent);
            display:flex; align-items:center; justify-content:center;
            font-size:16px;
            box-shadow: var(--shadow-glow);
          ">🎵</div>
          <span style="font-size:20px; font-weight:800; letter-spacing:-0.5px;">
            spotifyhehe
          </span>
        </div>

        <!-- Nav Links -->
        <div style="display:flex; gap:8px;">
          <a href="/" style="
            padding: 8px 16px; border-radius: 8px; font-size:14px; font-weight:500;
            color: var(--text-muted); text-decoration:none;
            transition: all 0.2s;
          " onmouseover="this.style.background='var(--surface-2)'; this.style.color='var(--text)'"
             onmouseout="this.style.background=''; this.style.color='var(--text-muted)'">
            🏠 Home
          </a>
          <a href="/search" style="
            padding: 8px 16px; border-radius: 8px; font-size:14px; font-weight:500;
            color: var(--text-muted); text-decoration:none;
            transition: all 0.2s;
          " onmouseover="this.style.background='var(--surface-2)'; this.style.color='var(--text)'"
             onmouseout="this.style.background=''; this.style.color='var(--text-muted)'">
            🔍 Search
          </a>
          <a href="/import" style="
            padding: 8px 16px; border-radius: 8px; font-size:14px; font-weight:500;
            color: var(--text-muted); text-decoration:none;
            transition: all 0.2s;
          " onmouseover="this.style.background='var(--surface-2)'; this.style.color='var(--text)'"
             onmouseout="this.style.background=''; this.style.color='var(--text-muted)'">
            📥 Import
          </a>
        </div>

        <!-- Auth Button -->
        <div>
          <button
            *ngIf="!(isAuthenticated$ | async)"
            (click)="login()"
            style="
              padding: 9px 20px;
              background: var(--accent);
              color: #fff;
              border: none; border-radius: 8px;
              font-size: 13px; font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              letter-spacing: 0.3px;
            "
            onmouseover="this.style.background='var(--accent-dark)'"
            onmouseout="this.style.background='var(--accent)'"
          >Login with Spotify</button>
          <button
            *ngIf="isAuthenticated$ | async"
            (click)="logout()"
            style="
              padding: 9px 20px;
              background: transparent;
              color: var(--text-muted);
              border: 1px solid var(--border); border-radius: 8px;
              font-size: 13px; font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            "
            onmouseover="this.style.borderColor='var(--accent)'; this.style.color='var(--accent)'"
            onmouseout="this.style.borderColor='var(--border)'; this.style.color='var(--text-muted)'"
          >Logout</button>
        </div>
      </nav>

      <!-- ── Page Content ────────────────────────────────────────── -->
      <main style="flex:1; padding: 32px 28px 120px; overflow-y:auto;">
        <router-outlet></router-outlet>
      </main>

      <!-- ── Global Player ───────────────────────────────────────── -->
      <app-player></app-player>
    </div>
  `,
    styles: []
})
export class AppComponent implements OnInit {
    isAuthenticated$: Observable<boolean>;

    constructor(private store: Store) {
        this.isAuthenticated$ = this.store.select(authSelectors.selectIsAuthenticated);
    }

    ngOnInit() {
        this.store.dispatch(AuthActions.checkAuth());
    }

    login() {
        this.store.dispatch(AuthActions.initiateLogin());
    }

    logout() {
        this.store.dispatch(AuthActions.logout());
    }
}
