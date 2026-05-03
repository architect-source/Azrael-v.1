import { Request, Response } from 'express';
import Parser from 'rss-parser';
import crypto from 'crypto';

/**
 * AZRAEL S-1792 | SOVEREIGN_HUNTER (MOD-SH1)
 * Purpose: Forensic scanning of job feeds for 'Sudden Capital' acquisition.
 */

const parser = new Parser({
    customFields: {
        item: ['description'],
    }
});

const DEFAULT_FEED = "https://weworkremotely.com/categories/remote-data-science-jobs.rss"; 
const BACKUP_FEED = "https://weworkremotely.com/categories/remote-data-science-jobs.rss/"; 
const DEFAULT_KEYWORDS = ["data", "cleansing", "repair", "automation", "excel", "scraping", "python"];

// In-memory cache for persistence within the current session
const detectedHashes = new Set<string>();

export const handleHunt = async (req: Request, res: Response) => {
    let feedUrl = (req.query.url as string) || DEFAULT_FEED;
    const keywords = (req.query.keywords as string)?.split(',') || DEFAULT_KEYWORDS;

    console.log(`[AZRAEL] SOVEREIGN_HUNTER_INITIATED | Feed: ${feedUrl}`);

    try {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        ];

        const tryFetch = async (url: string) => {
            const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
            return await fetch(url, {
                redirect: 'follow',
                headers: {
                    'User-Agent': ua,
                    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
        };

        let response = await tryFetch(feedUrl);

        // 301/308 Redirect Handling
        if (response.status === 301 || response.status === 308) {
            const nextUrl = response.headers.get('Location');
            if (nextUrl) {
                console.log(`[AZRAEL] HUNT_REDIRECT_DETECTED: Retrying with ${nextUrl}`);
                response = await tryFetch(nextUrl);
            }
        }

        // 403 Retry with trailing-slash toggle
        if (response.status === 403) {
            const altUrl = feedUrl.endsWith('/') ? feedUrl.slice(0, -1) : feedUrl + '/';
            console.log(`[AZRAEL] HUNT_403_DETECTED: Attempting alternative path ${altUrl}`);
            response = await tryFetch(altUrl);
        }

        if (!response.ok) {
            throw new Error(`HTTP_ERROR: Status ${response.status}`);
        }
        const xml = await response.text();
        const feed = await parser.parseString(xml);
        const targets: any[] = [];

        for (const item of feed.items) {
            const entryId = item.guid || item.link || "";
            const entryHash = crypto.createHash('sha256').update(entryId).digest('hex');

            // Logic: State Persistence Check
            const isNew = !detectedHashes.has(entryHash);
            
            // Forensic Filter: Check title and description
            const content = `${item.title} ${item.content || ""} ${item.description || ""}`.toLowerCase();
            const matches = keywords.some(kw => content.includes(kw.toLowerCase()));

            if (matches) {
                if (isNew) {
                    detectedHashes.add(entryHash);
                }
                
                targets.push({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    description: item.contentSnippet || item.content || item.description,
                    hash: entryHash,
                    isNew
                });
            }
        }

        res.json({
            status: "SCAN_COMPLETE",
            timestamp: new Date().toISOString(),
            new_targets_count: targets.filter(t => t.isNew).length,
            total_targets_count: targets.length,
            targets: targets.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        });

    } catch (err: any) {
        console.error(`[AZRAEL] HUNT_SEQUENCE_FAILED: ${err.message}`);
        
        let errorMsg = err.message;
        if (err.message.includes('410')) {
            errorMsg = "PROTOCOL_RETIRED: The targeted vector has been permanently neutralized (Status 410). Switching to backup relays required.";
        } else if (err.message.includes('403')) {
            errorMsg = "TARGET_HARDENED: Access denied by perimeter defense (Status 403). Rotation initiated.";
        } else if (err.message.includes('301')) {
            errorMsg = "VECTOR_SHIFT: The target has moved (Status 301). Update manual URL or apply trailing-slash corrections.";
        }

        res.status(500).json({
            error: "HUNT_SEQUENCE_FAILURE",
            message: errorMsg
        });
    }
};
