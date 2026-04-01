const spotifyUrlInfo = require('spotify-url-info')(fetch);

async function test() {
    try {
        const preview = await spotifyUrlInfo.getPreview('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M');
        console.log(JSON.stringify(preview, null, 2));
    } catch (e) {
        console.error('Error scraping:', e.message);
    }
}
test();
