const axios = require('axios');
const fs = require('fs');

async function testYouTube() {
    const apiKey = 'AIzaSyAOK8LkxFYA6KUlb_uPHwVIKICPhGzejZc';
    const query = 'Bohemian Rhapsody Queen';
    
    const client = axios.create({
        baseURL: 'https://www.googleapis.com/youtube/v3',
    });

    try {
        const searchRes = await client.get('/search', {
            params: {
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: 5,
                key: apiKey
            }
        });

        const videoIds = searchRes.data.items.map((item) => item.id.videoId).filter(Boolean);
        if (!videoIds.length) {
            console.log('No video IDs found');
            return;
        }

        console.log('Fetching exact videos for:', videoIds);

        const videosRes = await client.get('/videos', {
            params: {
                part: 'snippet,contentDetails,statistics',
                id: videoIds.join(','),
                key: apiKey
            }
        });

        fs.writeFileSync('youtube_test_output.json', JSON.stringify(videosRes.data, null, 2));
        console.log('Success! Wrote to youtube_test_output.json');
    } catch (e) {
        fs.writeFileSync('youtube_test_error.json', JSON.stringify(e.response ? e.response.data : e.message, null, 2));
        console.error('Failed! Wrote to youtube_test_error.json');
    }
}

testYouTube();
