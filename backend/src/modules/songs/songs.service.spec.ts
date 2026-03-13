import { Test, TestingModule } from '@nestjs/testing';
import { SongsService } from './songs.service';
import { getModelToken } from '@nestjs/mongoose';
import { Song } from './schemas/song.schema';
import { SearchMapService } from '@services/search-map.service';

describe('SongsService', () => {
    let service: SongsService;
    let mockSongModel: any;
    let mockSearchMapService: any;

    beforeEach(async () => {
        mockSongModel = {
            find: jest.fn(),
            findById: jest.fn(),
            countDocuments: jest.fn(),
            deleteMany: jest.fn(),
        };

        mockSearchMapService = {
            searchSongs: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SongsService,
                {
                    provide: getModelToken(Song.name),
                    useValue: mockSongModel,
                },
                {
                    provide: SearchMapService,
                    useValue: mockSearchMapService,
                },
            ],
        }).compile();

        service = module.get<SongsService>(SongsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('searchSongs', () => {
        it('should call searchMapService with correct query', async () => {
            const query = 'adele';
            const limit = 20;
            mockSearchMapService.searchSongs.mockResolvedValue({
                songs: [],
                sources: ['spotify'],
            });

            const result = await service.searchSongs(query, limit);

            expect(mockSearchMapService.searchSongs).toHaveBeenCalledWith(query, limit);
            expect(result.sources).toContain('spotify');
        });

        it('should throw error if query is empty', async () => {
            await expect(service.searchSongs('', 20)).rejects.toThrow();
        });
    });

    describe('getCacheStats', () => {
        it('should return cache statistics', async () => {
            mockSongModel.countDocuments.mockResolvedValue(100);

            const stats = await service.getCacheStats();

            expect(stats.total_songs).toBe(100);
            expect(mockSongModel.countDocuments).toHaveBeenCalledTimes(4);
        });
    });
});
