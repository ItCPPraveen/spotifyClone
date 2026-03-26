import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class QueueService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private getDeviceId(): string {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }

    private getHeaders() {
        return { 'x-device-id': this.getDeviceId() };
    }

    getQueue(): Observable<any> {
        return this.http.get(`${this.apiUrl}/queue`, { headers: this.getHeaders() });
    }

    addToQueue(songId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/queue/add/${songId}`, {}, { headers: this.getHeaders() });
    }

    playSong(songId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/queue/play/${songId}`, {}, { headers: this.getHeaders() });
    }

    removeFromQueue(songId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/queue/remove/${songId}`, { headers: this.getHeaders() });
    }

    clearQueue(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/queue/clear`, { headers: this.getHeaders() });
    }

    setSleepTimer(durationMinutes: number): Observable<{ expires_at: Date }> {
        return this.http.post<{ expires_at: Date }>(
            `${this.apiUrl}/queue/sleep-timer`,
            { duration_minutes: durationMinutes },
            { headers: this.getHeaders() }
        );
    }

    getSleepTimer(): Observable<{ remaining_ms: number }> {
        return this.http.get<{ remaining_ms: number }>(
            `${this.apiUrl}/queue/sleep-timer`,
            { headers: this.getHeaders() }
        );
    }
}
