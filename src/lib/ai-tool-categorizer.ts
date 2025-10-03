/**
 * AI Tool Categorization System
 * 
 * Smart logic to automatically categorize new AI tools based on:
 * 1. Name analysis and keyword matching
 * 2. URL domain analysis
 * 3. Description analysis (if provided)
 * 4. Existing category patterns
 * 5. Fallback to new category creation
 */

import { AITool } from '@/types/ai-tools';
import { NameAnalysis, DomainAnalysis } from '@/types/subscription';

// Category keyword mappings for intelligent classification
const CATEGORY_KEYWORDS = {
  'Chat': [
    'chat', 'conversation', 'assistant', 'ai', 'gpt', 'claude', 'gemini', 
    'bot', 'talk', 'discuss', 'converse', 'dialogue', 'messaging'
  ],
  'Search': [
    'search', 'find', 'discover', 'explore', 'query', 'perplexity', 
    'labs', 'research', 'investigate', 'lookup'
  ],
  'Roleplay': [
    'roleplay', 'character', 'persona', 'avatar', 'chatbot', 'companion',
    'friend', 'crush', 'spicy', 'juicy', 'candy', 'joi', 'janitor'
  ],
  'Image': [
    'image', 'photo', 'picture', 'visual', 'art', 'draw', 'paint', 'design',
    'midjourney', 'leonardo', 'civitai', 'photoroom', 'pixelcut', 'remove',
    'cutout', 'dream', 'generate', 'create', 'artwork', 'graphics'
  ],
  'Video': [
    'video', 'movie', 'film', 'animation', 'clip', 'veed', 'kling', 'remaker',
    'edit', 'produce', 'stream', 'record', 'camera', 'cinema'
  ],
  'Audio': [
    'audio', 'sound', 'voice', 'music', 'speech', 'elevenlabs', 'suno',
    'synthesize', 'record', 'play', 'listen', 'speak', 'sing', 'podcast'
  ],
  'Transcribe': [
    'transcribe', 'transcription', 'turboscribe', 'speech-to-text', 'stt',
    'convert', 'audio-to-text', 'dictation', 'voice-to-text', 'subtitles'
  ],
  'Build': [
    'build', 'create', 'develop', 'code', 'programming', 'cursor', 'replit',
    'lovable', 'development', 'software', 'app', 'website', 'platform'
  ],
  'Write': [
    'write', 'writing', 'text', 'content', 'notebook', 'gamma', 'quillbot',
    'manus', 'document', 'article', 'blog', 'copy', 'essay', 'story'
  ],
  'Dev': [
    'dev', 'development', 'hugging', 'face', 'studio', 'deepai', 'api',
    'model', 'framework', 'library', 'sdk', 'toolkit', 'platform'
  ],
  'Utils': [
    'util', 'utility', 'tool', 'helper', 'assistant', 'zerogpt', 'quark',
    'detect', 'analyze', 'check', 'verify', 'validate', 'process'
  ],
  'Automation': [
    'automation', 'automate', 'workflow', 'zapier', 'n8n', 'integrate', 'integration',
    'connect', 'sync', 'trigger', 'action', 'pipeline', 'orchestrate', 'schedule',
    'bot', 'workflow', 'process', 'streamline', 'efficiency', 'productivity'
  ],
  'Vector DB': [
    'vector', 'database', 'db', 'embedding', 'pinecone', 'weaviate', 'search',
    'similarity', 'semantic', 'index', 'retrieval', 'storage', 'vectorize'
  ],
  'APIs': [
    'api', 'apis', 'developer', 'developers', 'amadeus', 'travel', 'booking',
    'integration', 'endpoint', 'rest', 'graphql', 'webhook', 'service'
  ],
  'Planning': [
    'planning', 'plan', 'project', 'management', 'linear', 'roadmap', 'timeline',
    'schedule', 'organize', 'track', 'milestone', 'task', 'issue', 'kanban'
  ],
  'Design/Prototype': [
    'design', 'prototype', 'ui', 'ux', 'figma', 'magic', 'patterns', 'mobbin',
    'mockup', 'wireframe', 'interface', 'layout', 'visual', 'sketch', 'draft'
  ],
  'Speech-to-text': [
    'speech', 'voice', 'audio', 'text', 'transcribe', 'wispr', 'flow', 'stt',
    'dictation', 'voice-to-text', 'recognition', 'listen', 'hear', 'speak'
  ],
  'Productivity': [
    'productivity', 'efficiency', 'raycast', 'granola', 'superhuman', 'notion',
    'organize', 'manage', 'task', 'workflow', 'optimize', 'streamline', 'boost'
  ],
  'DB': [
    'database', 'db', 'supabase', 'postgres', 'sql', 'data', 'storage', 'query',
    'table', 'row', 'column', 'schema', 'migration', 'backup', 'sync'
  ],
  'Deploy': [
    'deploy', 'deployment', 'vercel', 'hosting', 'server', 'cloud', 'infrastructure',
    'production', 'staging', 'ci', 'cd', 'pipeline', 'release', 'publish'
  ]
};

// Domain-based categorization patterns
const DOMAIN_PATTERNS = {
  'Chat': ['chat.', 'ai.', 'claude.', 'gpt.', 'gemini.', 'poe.', 'monica.'],
  'Image': ['midjourney.', 'leonardo.', 'civitai.', 'photoroom.', 'pixelcut.', 'remove.', 'cutout.'],
  'Video': ['veed.', 'kling.', 'remaker.'],
  'Audio': ['elevenlabs.', 'suno.'],
  'Transcribe': ['turboscribe.', 'transcribe.'],
  'Build': ['cursor.', 'replit.', 'lovable.'],
  'Write': ['notebooklm.', 'gamma.', 'quillbot.', 'manus.'],
  'Dev': ['huggingface.', 'aistudio.', 'deepai.'],
  'Utils': ['zerogpt.', 'quark.'],
  'Automation': ['zapier.', 'n8n.', 'automate.', 'workflow.', 'integrate.', 'connect.'],
  'Vector DB': ['pinecone.', 'weaviate.', 'vector.', 'embedding.', 'similarity.'],
  'APIs': ['developers.', 'api.', 'amadeus.', 'travel.', 'booking.'],
  'Planning': ['linear.', 'plan.', 'project.', 'roadmap.', 'timeline.'],
  'Design/Prototype': ['figma.', 'magic.', 'patterns.', 'mobbin.', 'design.', 'prototype.'],
  'Speech-to-text': ['wispr.', 'flow.', 'speech.', 'voice.', 'audio.'],
  'Productivity': ['raycast.', 'granola.', 'superhuman.', 'notion.', 'productivity.'],
  'DB': ['supabase.', 'database.', 'db.', 'postgres.', 'sql.'],
  'Deploy': ['vercel.', 'deploy.', 'hosting.', 'server.', 'cloud.'],
  'Roleplay': ['character.', 'janitorai.', 'crushon.', 'candy.', 'juicychat.', 'joi.', 'spicychat.']
};

// Existing category list for reference
const EXISTING_CATEGORIES = [
  'Chat', 'Search', 'Roleplay', 'Image', 'Video', 'Audio',
  'Transcribe', 'Build', 'Write', 'Dev', 'Utils', 'Automation', 
  'Vector DB', 'APIs', 'Planning', 'Design/Prototype', 'Speech-to-text',
  'Productivity', 'DB', 'Deploy', 'Other'
];

export interface CategorizationResult {
  suggestedCategory: string;
  confidence: number; // 0-1 scale
  reasoning: string[];
  isNewCategory: boolean;
  alternativeCategories?: string[];
}

/**
 * Analyze tool name for category keywords
 */
function analyzeName(name: string): { category: string; score: number; keywords: string[]; confidence: number }[] {
  const results: { category: string; score: number; keywords: string[]; confidence: number }[] = [];
  const lowerName = name.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchedKeywords = keywords.filter(keyword => 
      lowerName.includes(keyword.toLowerCase())
    );
    
    if (matchedKeywords.length > 0) {
      const score = matchedKeywords.length / keywords.length;
      results.push({
        category,
        score,
        keywords: matchedKeywords,
        confidence: score
      });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Analyze URL domain for category patterns
 */
function analyzeDomain(url: string): { category: string; score: number; domain: string; confidence: number }[] {
  const results: { category: string; score: number; domain: string; confidence: number }[] = [];
  const domain = new URL(url).hostname.toLowerCase();
  
  for (const [category, patterns] of Object.entries(DOMAIN_PATTERNS)) {
    const matchedPatterns = patterns.filter(pattern => 
      domain.includes(pattern.toLowerCase())
    );
    
    if (matchedPatterns.length > 0) {
      const score = matchedPatterns.length / patterns.length;
      results.push({
        category,
        score,
        domain,
        confidence: score
      });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Calculate confidence score based on multiple factors
 */
function calculateConfidence(
  nameScore: number,
  domainScore: number,
  keywordCount: number,
  totalKeywords: number
): number {
  // Weighted combination of factors
  const nameWeight = 0.4;
  const domainWeight = 0.3;
  const keywordWeight = 0.3;
  
  const keywordRatio = keywordCount / totalKeywords;
  
  return (nameScore * nameWeight) + (domainScore * domainWeight) + (keywordRatio * keywordWeight);
}

/**
 * Generate reasoning for the categorization decision
 */
function generateReasoning(
  name: string,
  url: string,
  nameAnalysis: NameAnalysis[],
  domainAnalysis: DomainAnalysis[],
  finalCategory: string,
  confidence: number
): string[] {
  const reasoning: string[] = [];
  
  if (nameAnalysis.length > 0) {
    const topNameMatch = nameAnalysis[0];
    reasoning.push(`Name "${name}" contains keywords: ${topNameMatch.keywords.join(', ')}`);
  }
  
  if (domainAnalysis.length > 0) {
    const topDomainMatch = domainAnalysis[0];
    reasoning.push(`Domain matches ${topDomainMatch.category} pattern`);
  }
  
  if (confidence > 0.7) {
    reasoning.push(`High confidence (${Math.round(confidence * 100)}%) in ${finalCategory} category`);
  } else if (confidence > 0.4) {
    reasoning.push(`Medium confidence (${Math.round(confidence * 100)}%) in ${finalCategory} category`);
  } else {
    reasoning.push(`Low confidence (${Math.round(confidence * 100)}%) - consider manual review`);
  }
  
  return reasoning;
}

/**
 * Main categorization function
 */
export function categorizeAITool(
  name: string,
  url: string,
  description?: string
): CategorizationResult {
  // Step 1: Analyze name
  const nameAnalysis = analyzeName(name);
  
  // Step 2: Analyze domain
  const domainAnalysis = analyzeDomain(url);
  
  // Step 3: Combine results
  const categoryScores = new Map<string, number>();
  
  // Add name analysis scores
  nameAnalysis.forEach(result => {
    categoryScores.set(result.category, (categoryScores.get(result.category) || 0) + result.score * 0.6);
  });
  
  // Add domain analysis scores
  domainAnalysis.forEach(result => {
    categoryScores.set(result.category, (categoryScores.get(result.category) || 0) + result.score * 0.4);
  });
  
  // Step 4: Find best match
  let bestCategory = 'Other';
  let bestScore = 0;
  
  for (const [category, score] of categoryScores.entries()) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  // Step 5: Calculate confidence
  const topNameMatch = nameAnalysis[0];
  const topDomainMatch = domainAnalysis[0];
  
  const confidence = calculateConfidence(
    topNameMatch?.score || 0,
    topDomainMatch?.score || 0,
    topNameMatch?.keywords.length || 0,
    CATEGORY_KEYWORDS[bestCategory as keyof typeof CATEGORY_KEYWORDS]?.length || 1
  );
  
  // Step 6: Determine if new category is needed
  const isNewCategory = confidence < 0.3 && !EXISTING_CATEGORIES.includes(bestCategory);
  
  // Step 7: Generate reasoning
  const reasoning = generateReasoning(name, url, nameAnalysis, domainAnalysis, bestCategory, confidence);
  
  // Step 8: Get alternative categories
  const alternativeCategories = Array.from(categoryScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(1, 4)
    .map(([category]) => category);
  
  return {
    suggestedCategory: bestCategory,
    confidence,
    reasoning,
    isNewCategory,
    alternativeCategories
  };
}

/**
 * Suggest new category name based on tool characteristics
 */
export function suggestNewCategoryName(
  name: string,
  url: string,
  description?: string
): string {
  const lowerName = name.toLowerCase();
  const domain = new URL(url).hostname.toLowerCase();
  
  // Common patterns for new categories
  if (lowerName.includes('game') || lowerName.includes('play')) {
    return 'Gaming';
  }
  
  if (lowerName.includes('finance') || lowerName.includes('money') || lowerName.includes('crypto')) {
    return 'Finance';
  }
  
  if (lowerName.includes('health') || lowerName.includes('medical') || lowerName.includes('fitness')) {
    return 'Health';
  }
  
  if (lowerName.includes('education') || lowerName.includes('learn') || lowerName.includes('course')) {
    return 'Education';
  }
  
  if (lowerName.includes('marketing') || lowerName.includes('social') || lowerName.includes('media')) {
    return 'Marketing';
  }
  
  if (lowerName.includes('productivity') || lowerName.includes('task') || lowerName.includes('manage')) {
    return 'Productivity';
  }
  
  if (lowerName.includes('security') || lowerName.includes('privacy') || lowerName.includes('safe')) {
    return 'Security';
  }
  
  // Default fallback
  return 'Other';
}

/**
 * Batch categorize multiple tools
 */
export function batchCategorizeTools(tools: Partial<AITool>[]): CategorizationResult[] {
  return tools.map(tool => 
    categorizeAITool(tool.name || '', tool.url || '', undefined)
  );
}

/**
 * Get category statistics
 */
export function getCategoryStats(tools: AITool[]): Record<string, number> {
  const stats: Record<string, number> = {};
  
  tools.forEach(tool => {
    stats[tool.category] = (stats[tool.category] || 0) + 1;
  });
  
  return stats;
}
