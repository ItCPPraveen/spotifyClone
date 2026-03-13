import { Directive, EventEmitter, HostListener, Output, ElementRef } from '@angular/core';
import * as Hammer from 'hammerjs';

export interface SwipeEvent {
    direction: 'left' | 'right';
    distance: number;
    velocity: number;
}

@Directive({
    selector: '[appSwipe]'
})
export class SwipeDirective {
    @Output() swipeRight = new EventEmitter<SwipeEvent>();
    @Output() swipeLeft = new EventEmitter<SwipeEvent>();

    private hammerManager: HammerManager;

    constructor(private element: ElementRef) {
        this.hammerManager = new Hammer(this.element.nativeElement);
        this.setupGestures();
    }

    private setupGestures() {
        const swipe = new Hammer.Swipe();
        this.hammerManager.add(swipe);

        this.hammerManager.on('swiperight', (event: any) => {
            this.swipeRight.emit({
                direction: 'right',
                distance: event.distance,
                velocity: event.velocity
            });
        });

        this.hammerManager.on('swipeleft', (event: any) => {
            this.swipeLeft.emit({
                direction: 'left',
                distance: event.distance,
                velocity: event.velocity
            });
        });
    }

    ngOnDestroy() {
        this.hammerManager.destroy();
    }
}
