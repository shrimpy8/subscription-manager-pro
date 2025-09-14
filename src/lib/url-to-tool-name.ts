/**
 * Utility functions to extract tool names from URLs
 */

import { handleError } from '@/utils/error-handler';

/**
 * Extracts a meaningful tool name from a URL
 * @param url - The URL to extract the name from
 * @returns The extracted tool name
 */
export function extractToolNameFromUrl(url: string): string {
  try {
    // Clean the URL
    let cleanUrl = url.trim();
    
    // Remove protocol if present
    cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
    
    // Remove www. if present
    cleanUrl = cleanUrl.replace(/^www\./, '');
    
    // Remove trailing slash
    cleanUrl = cleanUrl.replace(/\/$/, '');
    
    // Split by dots to get domain parts
    const domainParts = cleanUrl.split('.');
    
    // Get the main domain (usually the first part)
    let mainDomain = domainParts[0];
    
    // Handle subdomains - extract the meaningful part
    if (mainDomain.includes('-')) {
      // For domains like "chat-gpt" or "mid-journey", convert to proper case
      mainDomain = mainDomain.split('-').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join(' ');
    } else {
      // Capitalize first letter
      mainDomain = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1).toLowerCase();
    }
    
    // Handle common patterns
    const patterns = [
      // Remove common suffixes
      { pattern: /^(.*?)(ai|app|tool|platform|service|api)$/i, replacement: '$1' },
      // Handle camelCase
      { pattern: /([a-z])([A-Z])/g, replacement: '$1 $2' },
      // Handle numbers
      { pattern: /(\d+)/g, replacement: ' $1 ' },
    ];
    
    let result = mainDomain;
    
    // Apply patterns
    patterns.forEach(({ pattern, replacement }) => {
      result = result.replace(pattern, replacement);
    });
    
    // Clean up extra spaces
    result = result.replace(/\s+/g, ' ').trim();
    
    // Handle special cases
    const specialCases: Record<string, string> = {
      'chatgpt': 'ChatGPT',
      'openai': 'OpenAI',
      'claude': 'Claude',
      'gemini': 'Gemini',
      'bard': 'Bard',
      'midjourney': 'Midjourney',
      'dalle': 'DALL-E',
      'stable diffusion': 'Stable Diffusion',
      'elevenlabs': 'ElevenLabs',
      'suno': 'Suno',
      'perplexity': 'Perplexity',
      'character': 'Character.ai',
      'janitor': 'Janitor AI',
      'crushon': 'CrushOn AI',
      'candy': 'Candy AI',
      'juicychat': 'JuicyChat',
      'spicychat': 'SpicyChat',
      'cursor': 'Cursor',
      'replit': 'Replit',
      'huggingface': 'Hugging Face',
      'deepai': 'DeepAI',
      'zerogpt': 'ZeroGPT',
      'quark': 'Quark',
      'zapier': 'Zapier',
      'n8n': 'n8n',
      'notion': 'Notion',
      'gamma': 'Gamma',
      'quillbot': 'QuillBot',
      'manus': 'Manus',
      'turboscribe': 'TurboScribe',
      'hailuo': 'Hailuo AI',
      'polybuzz': 'PolyBuzz',
      'adot': 'Adot',
    };
    
    // Check for exact matches in special cases
    const lowerResult = result.toLowerCase();
    if (specialCases[lowerResult]) {
      return specialCases[lowerResult];
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(specialCases)) {
      if (lowerResult.includes(key)) {
        return value;
      }
    }
    
    return result;
    
  } catch (error) {
    handleError(
      error as Error,
      { component: 'url-to-tool-name', action: 'extract tool name' }
    );
    return 'Unknown Tool';
  }
}

/**
 * Extracts tool names from a list of URLs
 * @param urls - Array of URLs
 * @returns Array of objects with url and extracted name
 */
export function extractToolNamesFromUrls(urls: string[]): Array<{ url: string; name: string }> {
  return urls.map(url => ({
    url,
    name: extractToolNameFromUrl(url)
  }));
}

/**
 * Formats a list of tools for the ATTools.txt file
 * @param tools - Array of tool objects with url and name
 * @returns Formatted string for ATTools.txt
 */
export function formatToolsForATTools(tools: Array<{ url: string; name: string }>): string {
  return tools.map(tool => tool.name).join(', ');
}

// Example usage and testing
export const exampleUrls = [
  'https://chat.openai.com',
  'https://www.midjourney.com',
  'https://elevenlabs.io',
  'https://perplexity.ai',
  'https://character.ai',
  'https://cursor.sh',
  'https://zapier.com',
  'https://n8n.io',
  'https://huggingface.co',
  'https://deepai.org',
  'https://zerogpt.com',
  'https://quark.app',
  'https://notion.so',
  'https://gamma.app',
  'https://quillbot.com',
  'https://manus.ai',
  'https://turboscribe.ai',
  'https://hailuo.ai',
  'https://polybuzz.ai',
  'https://adot.ai'
];

// Test the function
export function testUrlExtraction() {
  // Debug logging removed for production
  // Test URLs: exampleUrls.forEach(url => extractToolNameFromUrl(url));
}
