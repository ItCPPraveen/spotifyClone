import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { SearchComponent } from './search.component';
import { SongsActions, songsSelectors } from '@store/songs';
import { of } from 'rxjs';

describe('SearchComponent', () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;
    let mockStore: any;

    beforeEach(async () => {
        mockStore = {
            select: jest.fn((selector) => {
                if (selector === songsSelectors.selectSongs) {
                    return of([
                        {
                            _id: '1',
                            title: 'Test Song',
                            artist: 'Test Artist',
                            duration_ms: 180000,
                        },
                    ]);
                }
                return of(null);
            }),
            dispatch: jest.fn(),
        };

        await TestBed.configureTestingModule({
            declarations: [SearchComponent],
            providers: [
                {
                    provide: Store,
                    useValue: mockStore,
                },
            ],
        })
            .compileComponents();

        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should dispatch getRecentSongs action on init', () => {
        fixture.detectChanges();
        expect(mockStore.dispatch).toHaveBeenCalledWith(SongsActions.getRecentSongs());
    });

    it('should dispatch searchSongs action when search is called', () => {
        const query = 'adele';
        component.search(query);

        expect(mockStore.dispatch).toHaveBeenCalledWith(
            SongsActions.searchSongs({ query })
        );
    });

    it('should not dispatch search if query is empty', () => {
        const initialCallCount = mockStore.dispatch.mock.calls.length;
        component.search('   ');

        expect(mockStore.dispatch.mock.calls.length).toEqual(initialCallCount);
    });
});
