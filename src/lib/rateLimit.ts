// Simple in-memory rate limiter for development
// In production, use Redis or a proper rate limiting service

const attempts = new Map();
const WINDOW_SIZE_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5; // Max 5 attempts per window

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  resetTime?: number;
} {
  const now = Date.now();
  const key = identifier;

  if (!attempts.has(key)) {
    attempts.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  const data = attempts.get(key);

  // Reset window if expired
  if (now - data.windowStart > WINDOW_SIZE_MS) {
    attempts.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  // Increment count
  data.count++;

  if (data.count > MAX_ATTEMPTS) {
    const resetTime = data.windowStart + WINDOW_SIZE_MS;
    return { allowed: false, resetTime };
  }

  return { allowed: true };
}

export function clearRateLimit(identifier: string): void {
  attempts.delete(identifier);
}
