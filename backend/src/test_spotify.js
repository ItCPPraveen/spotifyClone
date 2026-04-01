const axios = require('axios');

async function test() {
    try {
        const clientId = 'aac5cbf21ad84cde97b017e75b1dfa14';
        const clientSecret = '61362ac219b14a17adc6ba651d07b905';
        const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await axios.post('https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );
        console.log('Token successfully generated: ', response.data.access_token.substring(0, 5) + '...');
        const token = response.data.access_token;

        // Test a specific track 
        const trackId = '11dFghVXANMlKmJXsNCbNl'; // Cut To The Feeling
        const trackRes = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Track fetched! Name:', trackRes.data.name);

    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}
test();
