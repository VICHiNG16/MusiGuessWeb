export interface Song {
    trackId: number;
    trackName: string;
    artistName: string;
    previewUrl: string;
    artworkUrl100: string;
}

export async function fetchMusicData(artist: string): Promise<Song[]> {
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=song&limit=50`);
        const data = await response.json();

        // Filter out songs without previewUrl
        const songs = data.results.filter((s: any) => s.previewUrl && s.kind === 'song');

        return songs.map((s: any) => ({
            trackId: s.trackId,
            trackName: s.trackName,
            artistName: s.artistName,
            previewUrl: s.previewUrl,
            artworkUrl100: s.artworkUrl100.replace('100x100', '600x600'), // Get higher quality art
        }));
    } catch (error) {
        console.error("Error fetching music data:", error);
        return [];
    }
}

export async function searchArtists(query: string) {
    if (!query || query.length < 2) return [];
    try {
        // Search albums to get artwork (artist entity doesn't have images)
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&attribute=artistTerm&limit=20`);
        const data = await response.json();

        // Deduplicate artists
        const uniqueArtists = new Map();

        data.results.forEach((r: any) => {
            if (!uniqueArtists.has(r.artistName)) {
                uniqueArtists.set(r.artistName, {
                    artistId: r.artistId,
                    artistName: r.artistName,
                    primaryGenreName: r.primaryGenreName,
                    image: r.artworkUrl100 // Use album art as artist image
                });
            }
        });

        return Array.from(uniqueArtists.values()).slice(0, 5);
    } catch (error) {
        console.error("Error searching artists:", error);
        return [];
    }
}
