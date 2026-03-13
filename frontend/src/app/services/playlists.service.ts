import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PlaylistsService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getUserPlaylists(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/playlists`);
    }

    getPlaylist(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/playlists/${id}`);
    }

    createPlaylist(name: string, description: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/playlists`, { name, description });
    }

    importPlaylist(playlistUrl: string): Observable<{ playlist: any; imported_count: number }> {
        return this.http.post<{ playlist: any; imported_count: number }>(
            `${this.apiUrl}/playlists/import`,
            { playlist_url: playlistUrl }
        );
    }

    addToPlaylist(playlistId: string, songId: string): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/playlists/${playlistId}/songs/${songId}`,
            {}
        );
    }

    deletePlaylist(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/playlists/${id}`);
    }
}
