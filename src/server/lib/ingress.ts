import fs from 'fs';
import https from 'https';
import http from 'http';
import crypto from 'crypto';

/**
 * AZRAEL S-1792 | VORTEX-STREAM INGRESS 
 * Purpose: High-integrity content retrieval for One Tap execution.
 */
export const initiateIngress = (url: string, dest: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        console.log(`[ANALYSIS] TARGET_IDENTIFIED: ${url}`);
        
        const file = fs.createWriteStream(dest);
        const hash = crypto.createHash('sha256');
        const lib = url.startsWith('https') ? https : http;

        const request = lib.get(url, (response) => {
            if (response.statusCode !== 200) {
                console.error(`[FAILURE] SOURCE_REJECTED_CONNECTION. STATUS: ${response.statusCode}`);
                reject(new Error(`SOURCE_REJECTED: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            response.on('data', (chunk) => {
                hash.update(chunk);
            });

            file.on('finish', () => {
                file.close();
                const finalHash = hash.digest('hex');
                console.log(`[SUCCESS] INGRESS_COMPLETE. CHECKSUM: ${finalHash}`);
                resolve(finalHash);
            });
        });

        request.on('error', (err) => {
            fs.unlink(dest, () => {}); // Purge contaminated fragments
            console.error(`[CRITICAL] STREAM_COLLAPSE: ${err.message}`);
            reject(err);
        });

        request.setTimeout(60000, () => {
            request.destroy();
            reject(new Error("INGRESS_TIMEOUT"));
        });
    });
};
