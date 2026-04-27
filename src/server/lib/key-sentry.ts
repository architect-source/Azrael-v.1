import https from 'https';

/**
 * AZRAEL S-1792 | KEY-SENTRY
 * Purpose: Forensic validation and redundancy for API credentials.
 */
export class KeySentry {
    private static activeKey: string | null = null;
    private static failureCount: number = 0;
    private static readonly MAX_FAILURES = 3;

    /**
     * Executes a forensic integrity check on the provided key.
     */
    static async validateIntegrity(key: string): Promise<boolean> {
        console.log(`[ANALYZING_KEY: ${key.substring(0, 8)}****]`);
        
        return new Promise((resolve) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
            const req = https.get(url, (res) => {
                if (res.statusCode === 200) {
                    console.log(`[STATUS: KEY_INTEGRITY_VERIFIED]`);
                    resolve(true);
                } else {
                    console.error(`[STATUS: KEY_COMPROMISED] | CODE: ${res.statusCode}`);
                    resolve(false);
                }
            });

            req.on('error', (err) => {
                console.error(`[STATUS: HANDSHAKE_FAILURE] | ${err.message}`);
                resolve(false);
            });

            req.setTimeout(5000, () => {
                req.destroy();
                resolve(false);
            });
        });
    }

    /**
     * Deploys the most viable engine key from the vault.
     */
    static async deployEngine(): Promise<string> {
        if (this.failureCount >= this.MAX_FAILURES) {
            throw new Error("CRITICAL_SYSTEM_FAILURE: LOCKDOWN_MODE_ACTIVE. Forensic audit required.");
        }

        const keys = [
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_BACKUP_KEY_1,
            process.env.GEMINI_BACKUP_KEY_2
        ].filter(Boolean) as string[];

        for (const key of keys) {
            const cleanKey = key.trim().replace(/^["']|["']$/g, "");
            if (await this.validateIntegrity(cleanKey)) {
                this.activeKey = cleanKey;
                this.failureCount = 0; // Reset on success
                return cleanKey;
            }
        }

        this.failureCount++;
        throw new Error("CORE_STALL: All keys in the vault have been COMPROMISED.");
    }

    static getActiveKey() {
        return this.activeKey;
    }
}
