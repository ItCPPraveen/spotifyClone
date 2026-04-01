import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { authSelectors } from '@store/auth';
import { AuthActions } from '@store/auth';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styles: []
})
export class AppComponent implements OnInit {
    isAuthenticated$: Observable<boolean>;
    isMobileMenuOpen = false;

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

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }
}
