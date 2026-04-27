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

const DEFAULT_FEED = "https://weworkremotely.com/categories/remote-data-science-jobs.rss/"; // Added trailing slash to prevent 301
const DEFAULT_KEYWORDS = ["data", "cleansing", "repair", "automation", "excel", "scraping", "python"];

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
