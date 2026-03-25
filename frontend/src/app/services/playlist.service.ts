import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

export interface Playlist {
  _id: string;
  name: string;
  description: string;
  owner?: string;
  songs?: any[];
  song_count: number;
  total_duration_ms: number;
  image_url?: string;
  is_imported: boolean;
  source?: string;
  original_url?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private apiUrl = `${environment.apiUrl}/playlists`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('device_id', deviceId as string);
    }
    return new HttpHeaders({ 'x-device-id': deviceId as string });
  }

  getUserPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getPlaylist(id: string): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createPlaylist(name: string, description: string): Observable<Playlist> {
    return this.http.post<Playlist>(this.apiUrl, { name, description }, { headers: this.getHeaders() });
  }

  importPlaylist(playlistUrl: string): Observable<{ playlist: Playlist, imported_count: number, duplicate_count: number }> {
    return this.http.post<{ playlist: Playlist, imported_count: number, duplicate_count: number }>(
      `${this.apiUrl}/import`, 
      { playlist_url: playlistUrl }, 
      { headers: this.getHeaders() }
    );
  }

  addSongToPlaylist(playlistId: string, songId: string): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}/${playlistId}/songs/${songId}`, {}, { headers: this.getHeaders() });
  }

  removeSongFromPlaylist(playlistId: string, songId: string): Observable<Playlist> {
    return this.http.delete<Playlist>(`${this.apiUrl}/${playlistId}/songs/${songId}`, { headers: this.getHeaders() });
  }

  deletePlaylist(playlistId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${playlistId}`, { headers: this.getHeaders() });
  }
}
