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

    getQueue(): Observable<any> {
        return this.http.get(`${this.apiUrl}/queue`);
    }

    addToQueue(songId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/queue/add/${songId}`, {});
    }

    removeFromQueue(songId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/queue/remove/${songId}`);
    }

    clearQueue(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/queue/clear`);
    }

    setSleepTimer(durationMinutes: number): Observable<{ expires_at: Date }> {
        return this.http.post<{ expires_at: Date }>(
            `${this.apiUrl}/queue/sleep-timer`,
            { duration_minutes: durationMinutes }
        );
    }

    getSleepTimer(): Observable<{ remaining_ms: number }> {
        return this.http.get<{ remaining_ms: number }>(
            `${this.apiUrl}/queue/sleep-timer`
        );
    }
}
