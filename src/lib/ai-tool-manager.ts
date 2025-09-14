/**
 * AI Tool Management System
 * 
 * Integrates the categorization system with the existing AI tools data
 * Provides functions to add new tools with automatic categorization
 */

import { AITool } from '@/types/ai-tools';
import { aiTools } from './ai-tools-data';
import { categorizeAITool, suggestNewCategoryName, type CategorizationResult } from './ai-tool-categorizer';
import { generateId } from './utils';

export interface NewToolData {
  name: string;
  url: string;
  description?: string;
  fallbackIcon?: string;
  flags?: string[];
}

export interface ToolAdditionResult {
  tool: AITool;
  categorization: CategorizationResult;
  needsReview: boolean;
  suggestions: {
    category: string;
    newCategorySuggestion?: string;
    confidence: number;
  };
}

/**
 * Add a new AI tool with automatic categorization
 */
export function addNewAITool(
  toolData: NewToolData,
  customCategory?: string
): ToolAdditionResult {
  // Generate unique ID
  const newId = Math.max(...aiTools.map(t => t.id)) + 1;
  
  // Categorize the tool
  const categorization = categorizeAITool(
    toolData.name,
    toolData.url,
    toolData.description
  );
  
  // Determine final category
  let finalCategory = customCategory || categorization.suggestedCategory;
  
  // If confidence is low and no custom category provided, suggest review
  const needsReview = categorization.confidence < 0.4 && !customCategory;
  
  // Create the new tool
  const newTool: AITool = {
    id: newId,
    originalRank: newId, // New tools get their ID as rank
    name: toolData.name,
    url: toolData.url,
    fallbackIcon: toolData.fallbackIcon || '🤖',
    category: finalCategory as any,
    rank: 1, // Will be updated based on category
    flags: toolData.flags || []
  };
  
  // Update rank within category
  const categoryTools = aiTools.filter(t => t.category === finalCategory);
  newTool.rank = categoryTools.length + 1;
  
  return {
    tool: newTool,
    categorization,
    needsReview,
    suggestions: {
      category: finalCategory,
      newCategorySuggestion: categorization.isNewCategory 
        ? suggestNewCategoryName(toolData.name, toolData.url, toolData.description)
        : undefined,
      confidence: categorization.confidence
    }
  };
}

/**
 * Get category suggestions for a tool without adding it
 */
export function getCategorySuggestions(
  name: string,
  url: string,
  description?: string
): CategorizationResult {
  return categorizeAITool(name, url, description);
}

/**
 * Validate tool data before adding
 */
export function validateToolData(toolData: NewToolData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!toolData.name?.trim()) {
    errors.push('Tool name is required');
  }
  
  if (!toolData.url?.trim()) {
    errors.push('Tool URL is required');
  } else {
    try {
      new URL(toolData.url);
    } catch {
      errors.push('Invalid URL format');
    }
  }
  
  // Check for duplicates
  const existingTool = aiTools.find(t => 
    t.name.toLowerCase() === toolData.name.toLowerCase() ||
    t.url === toolData.url
  );
  
  if (existingTool) {
    errors.push('Tool with this name or URL already exists');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): string[] {
  const categories = new Set(aiTools.map(t => t.category));
  return Array.from(categories).sort();
}

/**
 * Get tools by category with counts
 */
export function getToolsByCategory(): Record<string, { tools: AITool[]; count: number }> {
  const result: Record<string, { tools: AITool[]; count: number }> = {};
  
  aiTools.forEach(tool => {
    if (!result[tool.category]) {
      result[tool.category] = { tools: [], count: 0 };
    }
    result[tool.category].tools.push(tool);
    result[tool.category].count++;
  });
  
  return result;
}

/**
 * Search tools by name or category
 */
export function searchTools(query: string): AITool[] {
  if (!query.trim()) return aiTools;
  
  const lowerQuery = query.toLowerCase();
  return aiTools.filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.category.toLowerCase().includes(lowerQuery) ||
    tool.url.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get category statistics
 */
export function getCategoryStats(): {
  totalTools: number;
  totalCategories: number;
  categoryBreakdown: Record<string, number>;
  averageToolsPerCategory: number;
} {
  const categoryBreakdown: Record<string, number> = {};
  let totalTools = 0;
  
  aiTools.forEach(tool => {
    categoryBreakdown[tool.category] = (categoryBreakdown[tool.category] || 0) + 1;
    totalTools++;
  });
  
  const totalCategories = Object.keys(categoryBreakdown).length;
  const averageToolsPerCategory = totalTools / totalCategories;
  
  return {
    totalTools,
    totalCategories,
    categoryBreakdown,
    averageToolsPerCategory
  };
}

/**
 * Export tools data for backup or sharing
 */
export function exportToolsData(): string {
  return JSON.stringify(aiTools, null, 2);
}

/**
 * Import tools data from backup
 */
export function importToolsData(data: string): {
  success: boolean;
  importedCount: number;
  errors: string[];
} {
  try {
    const importedTools = JSON.parse(data);
    
    if (!Array.isArray(importedTools)) {
      return {
        success: false,
        importedCount: 0,
        errors: ['Invalid data format']
      };
    }
    
    // Validate each tool
    const errors: string[] = [];
    const validTools: AITool[] = [];
    
    importedTools.forEach((tool, index) => {
      if (!tool.id || !tool.name || !tool.url || !tool.category) {
        errors.push(`Tool at index ${index} is missing required fields`);
        return;
      }
      
      validTools.push(tool);
    });
    
    return {
      success: errors.length === 0,
      importedCount: validTools.length,
      errors
    };
  } catch (error) {
    return {
      success: false,
      importedCount: 0,
      errors: ['Invalid JSON format']
    };
  }
}
