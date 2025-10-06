import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes user input by removing all HTML tags and attributes
 * Use this for plain text fields like names, titles, descriptions
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitizes HTML content while allowing basic formatting tags
 * Use this for rich text content that needs basic formatting
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitizes URLs to prevent javascript: and other dangerous schemes
 * Use this for URL fields and links
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  // Remove any HTML tags first
  const cleanUrl = sanitizeInput(url);
  
  // Check for dangerous schemes
  const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = cleanUrl.toLowerCase();
  
  for (const scheme of dangerousSchemes) {
    if (lowerUrl.startsWith(scheme)) {
      return '';
    }
  }
  
  return cleanUrl;
}

/**
 * Sanitizes content for display in tooltips or titles
 * Strips all HTML and limits length
 */
export function sanitizeTooltip(content: string, maxLength: number = 100): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  const sanitized = sanitizeInput(content);
  return sanitized.length > maxLength 
    ? sanitized.substring(0, maxLength) + '...'
    : sanitized;
}

/**
 * Sanitizes search queries to prevent XSS in search results
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  return sanitizeInput(query.trim());
}