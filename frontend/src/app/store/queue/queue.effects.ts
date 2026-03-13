import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as QueueActions from './queue.actions';
import { QueueService } from '@services/queue.service';

@Injectable()
export class QueueEffects {
    getQueue$ = createEffect(() =>
        this.actions$.pipe(
            ofType(QueueActions.getQueue),
            switchMap(() =>
                this.queueService.getQueue().pipe(
                    map((queue) => QueueActions.getQueueSuccess({ queue })),
                    catchError((error) => of(QueueActions.getQueueFailure({ error: error.message })))
                )
            )
        )
    );

    addToQueue$ = createEffect(() =>
        this.actions$.pipe(
            ofType(QueueActions.addToQueue),
            switchMap(({ songId }) =>
                this.queueService.addToQueue(songId).pipe(
                    map((queue) => QueueActions.addToQueueSuccess({ queue })),
                    catchError((error) => of(QueueActions.getQueueFailure({ error: error.message })))
                )
            )
        )
    );

    setSleepTimer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(QueueActions.setSleepTimer),
            switchMap(({ durationMinutes }) =>
                this.queueService.setSleepTimer(durationMinutes).pipe(
                    map(({ expires_at }) => QueueActions.setSleepTimerSuccess({ expiresAt: expires_at })),
                    catchError((error) => of(QueueActions.getQueueFailure({ error: error.message })))
                )
            )
        )
    );

    constructor(private actions$: Actions, private queueService: QueueService) { }
}
