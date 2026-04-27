import crypto from 'crypto';

/**
 * AZRAEL S-1792 | CONDUIT-SENTRY
 * Purpose: Generates and validates 24-hour ephemeral API gateways.
 */
export class ConduitSentry {
    private static readonly SYSTEM_SALT = process.env.SYSTEM_SALT || "AZRAEL_CORE_DEFAULT_SALT_792";

    /**
     * Generates a 32-character forensic hash for the current 24-hour window.
     */
    static getActiveHash(): string {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return crypto
            .createHmac('sha256', this.SYSTEM_SALT)
            .update(date)
            .digest('hex')
            .substring(0, 32);
    }

    /**
     * Validates if a provided hash matches the current active conduit.
     */
    static validate(hash: string): boolean {
        const active = this.getActiveHash();
        return hash === active;
    }

    /**
     * Calculate seconds remaining until next cycle incineration.
     */
    static getSecondsToRotation(): number {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);
        return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
    }
}
