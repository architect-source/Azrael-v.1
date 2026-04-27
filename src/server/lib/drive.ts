import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * AZRAEL S-1792 | OMEGA_DRIVE_BRIDGE
 * Purpose: Secure transmission of forensic assets to Google Drive.
 */
export class OmegaDriveBridge {
    private static oauth2Client: OAuth2Client | null = null;

    private static getClient(): OAuth2Client {
        if (!this.oauth2Client) {
            this.oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                '' // Redirect URI will be set per request
            );
        }
        return this.oauth2Client;
    }

    static getAuthUrl(redirectUri: string): string {
        const client = this.getClient();
        return client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            prompt: 'consent',
            redirect_uri: redirectUri
        });
    }

    static async exchangeCode(code: string, redirectUri: string): Promise<any> {
        const client = this.getClient();
        const { tokens } = await client.getToken({
            code,
            redirect_uri: redirectUri
        });
        return tokens;
    }

    static async uploadToDrive(tokens: any, fileName: string, content: string | Buffer, mimeType: string = 'text/plain'): Promise<string> {
        const client = this.getClient();
        client.setCredentials(tokens);

        const drive = google.drive({ version: 'v3', auth: client });

        // 1. Locate or create the vault folder
        const folderId = await this.findOrCreateVaultFolder(drive);

        // 2. Upload the asset
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId],
                description: 'S-1792_FORENSIC_ASSET'
            },
            media: {
                mimeType,
                body: typeof content === 'string' ? content : Buffer.isBuffer(content) ? content : JSON.stringify(content)
            }
        });

        return response.data.id || '';
    }

    private static async findOrCreateVaultFolder(drive: any): Promise<string> {
        const folderName = 'S-1792_VAULT';
        
        const res = await drive.files.list({
            q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0].id;
        }

        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            description: 'AZRAEL_CORE_SECURE_VAULT'
        };

        const folder = await drive.files.create({
            requestBody: folderMetadata,
            fields: 'id'
        });

        return folder.data.id;
    }
}
