import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s Timeout

        try {
            let response;
            try {
                response = await fetch(url, {
                    headers: { 'User-Agent': 'WebRev-AI-Scraper/1.0' },
                    signal: controller.signal
                });
            } catch (err: unknown) {
                // Retry with www. if request failed (e.g. timeout or DNS) and url doesn't have it
                const urlObj = new URL(url);
                if (!urlObj.hostname.startsWith('www.')) {
                    console.log(`Retrying with www.${urlObj.hostname}...`);
                    urlObj.hostname = `www.${urlObj.hostname}`;
                    response = await fetch(urlObj.toString(), {
                        headers: { 'User-Agent': 'WebRev-AI-Scraper/1.0' },
                        signal: controller.signal
                    });
                } else {
                    throw err;
                }
            }

            clearTimeout(timeoutId);

            if (!response.ok) {
                return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status });
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("text/html")) {
                return NextResponse.json({ error: "Invalid content type. Only HTML allowed." }, { status: 400 });
            }

            // Size check via Content-Length (soft check)
            const contentLength = response.headers.get("content-length");
            if (contentLength && parseInt(contentLength) > 2 * 1024 * 1024) { // 2MB
                return NextResponse.json({ error: "Page too large (>2MB)." }, { status: 400 });
            }

            // Hard check during text consumption
            const html = await response.text();
            if (html.length > 2 * 1024 * 1024) { // 2MB
                return NextResponse.json({ error: "Page too large (>2MB)." }, { status: 400 });
            }

            const $ = cheerio.load(html);

            // Extract Data
            const title = $('title').text().trim();
            const description = $('meta[name="description"]').attr('content') || '';

            // Extract Headings
            const headings: { level: string; text: string }[] = [];
            $('h1, h2, h3, h4, h5, h6').each((_, el) => {
                headings.push({
                    level: el.tagName,
                    text: $(el).text().trim(),
                });
            });

            // Extract Images
            const images: { src: string; alt: string }[] = [];
            $('img').each((_, el) => {
                const src = $(el).attr('src');
                if (src) {
                    images.push({
                        src,
                        alt: $(el).attr('alt') || '',
                    });
                }
            });

            // Extract Main Content (simplistic approach: all paragraphs)
            const content = $('p').map((_, el) => $(el).text().trim()).get().filter(text => text.length > 0);

            return NextResponse.json({
                url,
                title,
                description,
                headings,
                imageCount: images.length,
                images: images.slice(0, 50), // Limit payload
                content: content.slice(0, 20), // Limit payload for analysis
                rawHtml: html.length // Maybe useful for sizing
            });

        } catch (error: unknown) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                return NextResponse.json({ error: "Request timed out (5s limit)." }, { status: 408 });
            }
            throw error;
        }

    } catch (error) {
        console.error('Scrape error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
