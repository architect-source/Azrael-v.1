import { Request, Response } from 'express';
import { OmegaDriveBridge } from '../lib/drive';

/**
 * AZRAEL S-1792 | DRIVE_ROUTER
 * Purpose: Endpoint management for the Omega Drive Vault bridge.
 */

const getRedirectUri = (req: Request) => {
    // Using the runtime APP_URL if available, otherwise constructing from request
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    return `${appUrl}/api/auth/callback`;
};

export const handleDriveAuthUrl = (req: Request, res: Response) => {
    const redirectUri = getRedirectUri(req);
    const url = OmegaDriveBridge.getAuthUrl(redirectUri);
    res.json({ url });
};

export const handleDriveCallback = async (req: Request, res: Response) => {
    const { code } = req.query;
    const redirectUri = getRedirectUri(req);

    try {
        if (!code) throw new Error("MISSING_AUTH_CODE");
        
        const tokens = await OmegaDriveBridge.exchangeCode(code as string, redirectUri);
        
        // Store tokens in a secure, cross-origin compatible cookie
        res.cookie('omega_drive_tokens', JSON.stringify(tokens), {
            secure: true,
            sameSite: 'none',
            httpOnly: true,
            maxAge: 3600000 // 1 hour
        });

        res.send(`
            <html>
                <body style="background: black; color: #cc0000; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh;">
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                            window.close();
                        } else {
                            window.location.href = '/';
                        }
                    </script>
                    <div style="text-align: center;">
                        <h2>AUTHENTICATION_SUCCESSFUL</h2>
                        <p>VAULT_BRIDGE_ESTABLISHED. CLOSING_CONDUIT...</p>
                    </div>
                </body>
            </html>
        `);
    } catch (err: any) {
        console.error(`[AZRAEL] DRIVE_AUTH_FAILURE: ${err.message}`);
        res.status(500).send(`AUTH_FAILURE: ${err.message}`);
    }
};

export const handleDriveUpload = async (req: Request, res: Response) => {
    const { fileName, content, mimeType } = req.body;
    const tokensRaw = req.cookies.omega_drive_tokens;

    if (!tokensRaw) {
        return res.status(401).json({ error: "UNAUTHORIZED_VAULT_ACCESS", reason: "MISSING_TOKENS" });
    }

    try {
        const tokens = JSON.parse(tokensRaw);
        const fileId = await OmegaDriveBridge.uploadToDrive(tokens, fileName, content, mimeType);
        
        res.json({
            status: "UPLOAD_SUCCESSFUL",
            file_id: fileId,
            vault_path: `S-1792_VAULT/${fileName}`
        });
    } catch (err: any) {
        console.error(`[AZRAEL] DRIVE_UPLOAD_FAILURE: ${err.message}`);
        res.status(500).json({ error: "TRANSMISSION_ERROR", message: err.message });
    }
};

export const handleDriveStatus = (req: Request, res: Response) => {
    const hasTokens = !!req.cookies.omega_drive_tokens;
    res.json({ connected: hasTokens });
};
