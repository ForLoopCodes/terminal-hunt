// CSRF Token Generator for Additional Security
import { randomBytes } from "crypto";

const csrfTokens = new Map<string, { token: string; timestamp: number }>();
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

export function generateCSRFToken(sessionId: string): string {
  const token = randomBytes(32).toString("hex");
  const timestamp = Date.now();

  csrfTokens.set(sessionId, { token, timestamp });

  // Clean up expired tokens
  cleanupExpiredTokens();

  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);

  if (!stored) return false;

  // Check if token is expired
  if (Date.now() - stored.timestamp > TOKEN_EXPIRY) {
    csrfTokens.delete(sessionId);
    return false;
  }

  return stored.token === token;
}

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now - data.timestamp > TOKEN_EXPIRY) {
      csrfTokens.delete(sessionId);
    }
  }
}

export function removeCSRFToken(sessionId: string) {
  csrfTokens.delete(sessionId);
}
