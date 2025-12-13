const https = require('https');

const options = {
    hostname: 'itunes.apple.com',
    port: 443,
    path: '/search?term=adele&entity=song',
    method: 'GET',
    headers: {
        'Origin': 'https://musiguess.live'
    }
};

const req = https.request(options, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
