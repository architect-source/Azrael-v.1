import sodium from 'libsodium-wrappers';

export interface EncryptedMessage {
  ciphertext: string;
  nonce: string;
  version: string;
}

export class SessionCrypto {
  private key: Uint8Array | null = null;
  private sessionId: string;
  
  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async setKeyFromMaterial(material: string) {
    await sodium.ready;
    
    try {
      if (typeof sodium.crypto_pwhash === 'function') {
        this.key = sodium.crypto_pwhash(
          32,
          material,
          sodium.from_string(this.sessionId.slice(0, 16).padEnd(16, '0')), // Salt
          sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_ALG_ARGON2ID13
        );
        return;
      }
    } catch (e) {
      console.warn("Argon2 derivation failed, attempting PBKDF2 fallback:", e);
    }

    // POLYFILL_CRYPTO_PWHASH: PBKDF2 Fallback
    this.key = await this.pbkdf2Fallback(material, this.sessionId);
  }

  private async pbkdf2Fallback(password: string, salt: string): Promise<Uint8Array> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const bits = await window.crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: enc.encode(salt.slice(0, 16).padEnd(16, '0')),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );
    return new Uint8Array(bits);
  }

  randomId() {
    return Math.random().toString(36).substring(7);
  }

  async init(password: string) {
    await sodium.ready;
    
    try {
      if (typeof sodium.crypto_pwhash === 'function') {
        this.key = sodium.crypto_pwhash(
          32,
          password,
          sodium.from_string(this.sessionId.slice(0, 16).padEnd(16, '0')), // Salt
          sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_ALG_ARGON2ID13
        );
        return;
      }
    } catch (e) {
      console.warn("Argon2 derivation failed, attempting PBKDF2 fallback:", e);
    }

    this.key = await this.pbkdf2Fallback(password, this.sessionId);
  }
  
  async encrypt(plaintext: string): Promise<EncryptedMessage> {
    await sodium.ready;
    if (!this.key) throw new Error("Crypto not initialized");
    
    const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      plaintext,
      this.sessionId, // Associated data: session binding
      null, // No additional secret
      nonce,
      this.key
    );
    
    return {
      ciphertext: sodium.to_base64(ciphertext),
      nonce: sodium.to_base64(nonce),
      version: 'xchacha20poly1305-v1',
    };
  }
  
  async decrypt(msg: EncryptedMessage): Promise<string> {
    await sodium.ready;
    if (!this.key) throw new Error("Crypto not initialized");
    
    const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null, // No additional secret
      sodium.from_base64(msg.ciphertext),
      this.sessionId,
      sodium.from_base64(msg.nonce),
      this.key
    );
    
    return sodium.to_string(decrypted);
  }
}
