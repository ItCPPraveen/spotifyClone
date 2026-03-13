import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SongsService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    searchSongs(query: string, limit: number = 20): Observable<{ songs: any[]; sources: string[] }> {
        return this.http.get<{ songs: any[]; sources: string[] }>(
            `${this.apiUrl}/songs/search`,
            { params: { q: query, limit: limit.toString() } }
        );
    }

    getRecentSongs(limit: number = 50): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/songs/recent`, {
            params: { limit: limit.toString() }
        });
    }

    getSongById(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/songs/${id}`);
    }
}
