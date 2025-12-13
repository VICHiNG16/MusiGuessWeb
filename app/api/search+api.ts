import { ExpoRequest, ExpoResponse } from 'expo-router/server';

const CACHE_DURATION = 3600 * 1000; // 1 hour
const cache = new Map<string, { data: any, timestamp: number }>();

export async function GET(request: ExpoRequest) {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term');
    const entity = searchParams.get('entity') || 'song';
    const limit = searchParams.get('limit') || '50';
    const attribute = searchParams.get('attribute');

    if (!term) {
        return new Response(JSON.stringify({ results: [] }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const cacheKey = `${term}-${entity}-${limit}-${attribute}`;
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_DURATION)) {
        return new Response(JSON.stringify(cachedEntry.data), {
            headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
        });
    }

    let itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=${limit}`;
    if (attribute) {
        itunesUrl += `&attribute=${attribute}`;
    }

    try {
        const response = await fetch(itunesUrl);
        const data = await response.json();

        cache.set(cacheKey, { data, timestamp: Date.now() });

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch from iTunes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
