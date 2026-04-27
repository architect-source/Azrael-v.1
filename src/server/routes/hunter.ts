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

const DEFAULT_FEED = "https://www.upwork.com/ab/feed/jobs/rss?q=data+cleansing";
const DEFAULT_KEYWORDS = ["data cleansing", "CSV repair", "Python automation", "Excel formatting", "scraping", "automation"];

// In-memory cache for persistence within the current session
const detectedHashes = new Set<string>();

export const handleHunt = async (req: Request, res: Response) => {
    const feedUrl = (req.query.url as string) || DEFAULT_FEED;
    const keywords = (req.query.keywords as string)?.split(',') || DEFAULT_KEYWORDS;

    console.log(`[AZRAEL] SOVEREIGN_HUNTER_INITIATED | Feed: ${feedUrl}`);

    try {
        const feed = await parser.parseURL(feedUrl);
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
        res.status(500).json({
            error: "HUNT_SEQUENCE_FAILURE",
            message: err.message
        });
    }
};
