import crypto from 'crypto';

/**
 * Utilidad de cifrado simétrico AES-256-GCM para proteger tokens OAuth.
 * - Requiere `OAUTH_ENCRYPTION_KEY` en variables de entorno.
 */
class CryptoUtil {
  private readonly key: Buffer;

  constructor() {
    const raw = process.env.OAUTH_ENCRYPTION_KEY || '';
    if (!raw) {
      throw new Error('OAUTH_ENCRYPTION_KEY no configurada');
    }
    this.key = this.deriveKey(raw);
  }

  private deriveKey(input: string): Buffer {
    try {
      if (/^[A-Za-z0-9+/=]+$/.test(input) && input.length % 4 === 0) {
        const b = Buffer.from(input, 'base64');
        if (b.length === 32) return b;
      }
      if (/^[0-9a-fA-F]+$/.test(input)) {
        const b = Buffer.from(input, 'hex');
        if (b.length === 32) return b;
      }
    } catch {}
    return crypto.hkdfSync('sha256', Buffer.alloc(0), Buffer.from(input), Buffer.from('oauth-token-encryption'), 32);
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, ciphertext, tag]).toString('base64');
  }

  decrypt(payloadBase64: string): string {
    const payload = Buffer.from(payloadBase64, 'base64');
    if (payload.length < 12 + 16) {
      throw new Error('Payload de cifrado inválido');
    }
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(payload.length - 16);
    const ciphertext = payload.subarray(12, payload.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }
}

const cryptoUtil = new CryptoUtil();
export default cryptoUtil;
