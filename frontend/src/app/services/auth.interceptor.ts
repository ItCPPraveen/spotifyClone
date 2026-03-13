import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { authSelectors } from '@store/auth';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private store: Store) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // Exclude iTunes API from auth headers as JSONP doesn't support headers
        if (request.url.includes('itunes.apple.com')) {
            return next.handle(request);
        }

        return this.store.select(authSelectors.selectToken).pipe(
            take(1),
            switchMap((token) => {
                if (token) {
                    request = request.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                }
                return next.handle(request);
            }),
        );
    }
}
