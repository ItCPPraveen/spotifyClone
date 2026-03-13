import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getLoginUrl(): Observable<{ auth_url: string }> {
        return this.http.get<{ auth_url: string }>(`${this.apiUrl}/auth/login`);
    }

    handleCallback(code: string): Observable<{ access_token: string; user: any }> {
        return this.http.post<{ access_token: string; user: any }>(
            `${this.apiUrl}/auth/callback`,
            { code }
        );
    }

    getProfile(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/profile`);
    }

    refreshToken(): Observable<{ access_token: string }> {
        return this.http.post<{ access_token: string }>(
            `${this.apiUrl}/auth/refresh`,
            {}
        );
    }
}
