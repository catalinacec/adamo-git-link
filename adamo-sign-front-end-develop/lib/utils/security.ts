/**
 * Security utilities for authentication flows
 */

// Rate limiting storage for client-side protection
const rateLimitStorage = new Map<string, { attempts: number; lastAttempt: number; blocked: boolean; blockUntil?: number }>();

// Configuration constants
export const SECURITY_CONFIG = {
  MAX_EMAIL_ATTEMPTS: 3,
  MAX_OTP_ATTEMPTS: 5,
  BLOCK_DURATION: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS_PER_MINUTE: 5,
} as const;

/**
 * Check if an identifier (email/IP) is currently blocked
 */
export function isBlocked(identifier: string): boolean {
  const record = rateLimitStorage.get(identifier);
  if (!record?.blocked) return false;

  const now = Date.now();
  if (record.blockUntil && now > record.blockUntil) {
    // Block has expired, clear it
    rateLimitStorage.delete(identifier);
    return false;
  }

  return true;
}

/**
 * Record a failed attempt for an identifier
 */
export function recordFailedAttempt(identifier: string, maxAttempts: number = SECURITY_CONFIG.MAX_EMAIL_ATTEMPTS): boolean {
  const now = Date.now();
  const record = rateLimitStorage.get(identifier) || { attempts: 0, lastAttempt: now, blocked: false };

  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= maxAttempts) {
    record.blocked = true;
    record.blockUntil = now + SECURITY_CONFIG.BLOCK_DURATION;
  }

  rateLimitStorage.set(identifier, record);
  return record.blocked;
}

/**
 * Reset attempts for an identifier (on successful action)
 */
export function resetAttempts(identifier: string): void {
  rateLimitStorage.delete(identifier);
}

/**
 * Get remaining attempts for an identifier
 */
export function getRemainingAttempts(identifier: string, maxAttempts: number): number {
  const record = rateLimitStorage.get(identifier);
  if (!record) return maxAttempts;
  return Math.max(0, maxAttempts - record.attempts);
}

/**
 * Check rate limiting for requests
 */
export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitStorage.get(identifier);
  
  if (!record) {
    rateLimitStorage.set(identifier, { attempts: 1, lastAttempt: now, blocked: false });
    return false;
  }

  // Check if we're within the rate limit window
  if (now - record.lastAttempt < SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
    if (record.attempts >= SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE) {
      return true;
    }
    record.attempts += 1;
  } else {
    // Reset counter if outside window
    record.attempts = 1;
  }

  record.lastAttempt = now;
  rateLimitStorage.set(identifier, record);
  return false;
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validate OTP format
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp.trim());
}

/**
 * Check if password meets security requirements
 */
export function validatePasswordSecurity(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  if (/\s/.test(password)) {
    errors.push("Password cannot contain spaces");
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Password cannot contain repeated characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random string for session tokens
 */
export function generateSecureToken(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return result;
}

/**
 * Clear all security records (for testing or logout)
 */
export function clearSecurityRecords(): void {
  rateLimitStorage.clear();
}
