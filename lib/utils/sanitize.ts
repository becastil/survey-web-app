import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The potentially dangerous HTML string
 * @returns Clean, safe HTML string
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize text input to prevent XSS attacks
 * @param input - The user input string
 * @returns Clean, safe string
 */
export function sanitizeText(input: string | unknown): string {
  if (typeof input !== 'string') {
    return String(input);
  }
  // Remove any HTML tags and escape special characters
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
}

/**
 * Sanitize and validate JSON data
 * @param data - The JSON data to sanitize
 * @returns Sanitized JSON object
 */
export function sanitizeJson(data: any): any {
  if (typeof data === 'string') {
    return sanitizeText(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeJson(item));
  }
  
  if (data !== null && typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        sanitized[key] = sanitizeJson(data[key]);
      }
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Validate and sanitize email addresses
 * @param email - The email address to validate
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeText(email).toLowerCase().trim();
  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize URL to prevent XSS and open redirect attacks
 * @param url - The URL to sanitize
 * @returns Safe URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  try {
    const sanitized = sanitizeText(url);
    const parsed = new URL(sanitized);
    // Only allow http and https protocols
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return sanitized;
    }
  } catch {
    // Invalid URL
  }
  return '';
}