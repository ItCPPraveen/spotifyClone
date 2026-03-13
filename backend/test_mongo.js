const mongoose = require('mongoose');

// Temporary Mongoose connection using the exact schema definitions from NestJS
const MONGODB_URI = 'mongodb+srv://spotifyhehe:Spotifyhehe123@portfoliodb.of6lx8a.mongodb.net/?appName=PortfolioDB';

// Define schema directly
const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: String,
    cover_url: String,
    duration_ms: { type: Number, required: true },
    spotify_id: String,
    youtube_id: String,
    api_source: { type: String, enum: ['spotify', 'youtube', 'internal'], default: 'youtube' },
    preview_url: String,
    popularity: { type: Number, default: 0 },
    isrc: { type: String, index: true },
    cached_at: { type: Date, default: () => new Date() },
    cache_expires_at: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
});

const Song = mongoose.model('Song', songSchema);

async function testMongo() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const mapped = {
        title: 'Queen – Bohemian Rhapsody (Official Video Remastered)',
        artist: 'Queen Official',
        album: undefined,
        cover_url: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
        duration_ms: 359000,
        youtube_id: 'fJ9rUzIMcZQ',
        api_source: 'youtube',
        preview_url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        popularity: 1819665675,
        cached_at: new Date(),
        cache_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    try {
        const saved = await Song.create(mapped);
        console.log('Successfully saved to Mongo!', saved);
    } catch (e) {
        console.error('MONGO DB SAVE ERROR:', e.message);
        console.error(e);
    }

    mongoose.disconnect();
}

testMongo();
