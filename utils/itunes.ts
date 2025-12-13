import { Platform } from 'react-native';

export interface Song {
    trackId: number;
    trackName: string;
    artistName: string;
    previewUrl: string;
    artworkUrl100: string;
    trackViewUrl: string;
}

// Apple Affiliate Token
const AFFILIATE_TOKEN = '';

function appendAffiliateToken(url: string): string {
    if (!url) return url;
    if (!AFFILIATE_TOKEN) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}at=${AFFILIATE_TOKEN}`;
}

// JSONP Helper for Web
const jsonp = (url: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_' + Math.round(100000 * Math.random());
        const script = document.createElement('script');

        (window as any)[callbackName] = (data: any) => {
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            resolve(data);
        };

        script.src = `${url}&callback=${callbackName}`;
        script.onerror = (err) => {
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            reject(new Error('JSONP request failed'));
        };

        document.body.appendChild(script);
    });
};

export async function fetchMusicData(artist: string): Promise<Song[]> {
    try {
        let data;
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=song&limit=50`;

        if (Platform.OS === 'web') {
            data = await jsonp(url);
        } else {
            const response = await fetch(url);
            data = await response.json();
        }

        if (!data || !data.results) return [];

        // Filter out songs without previewUrl
        const songs = data.results.filter((s: any) => s.previewUrl && s.kind === 'song');

        return songs.map((s: any) => ({
            trackId: s.trackId,
            trackName: s.trackName,
            artistName: s.artistName,
            previewUrl: s.previewUrl,
            artworkUrl100: s.artworkUrl100.replace('100x100', '600x600'), // Get higher quality art
            trackViewUrl: appendAffiliateToken(s.trackViewUrl)
        }));
    } catch (error) {
        console.error("Error fetching music data:", error);
        return [];
    }
}

export async function searchArtists(query: string) {
    if (!query || query.length < 2) return [];
    try {
        let data;
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&attribute=artistTerm&limit=20`;

        if (Platform.OS === 'web') {
            data = await jsonp(url);
        } else {
            const response = await fetch(url);
            data = await response.json();
        }

        // Deduplicate artists
        const uniqueArtists = new Map();

        if (data && data.results) {
            data.results.forEach((r: any) => {
                if (!uniqueArtists.has(r.artistName)) {
                    uniqueArtists.set(r.artistName, {
                        artistId: r.artistId,
                        artistName: r.artistName,
                        primaryGenreName: r.primaryGenreName,
                        image: r.artworkUrl100?.replace('100x100', '600x600')
                    });
                }
            });
        }

        return Array.from(uniqueArtists.values()).slice(0, 5);
    } catch (error: any) {
        console.error("Error searching artists:", error);
        return [{ artistName: "ERROR: " + (error.message || error.toString()), artistId: 0, image: null }];
    }
}
