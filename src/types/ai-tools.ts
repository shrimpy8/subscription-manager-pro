/**
 * AI Tools Data Configuration
 * 
 * This file contains the core data structure and configuration for the AI Tools Tracker.
 * It includes:
 * - Type definitions for AITool and Category
 * - The complete dataset of 50 AI tools with their metadata
 * - Category ordering and labeling configuration
 * - Tool flags for special handling (CN/Region restrictions)
 */

export type AIToolCategory = string;

export type AIToolFlag = "cn-region" | "nsfw" | "no-rank";

export interface AITool {
  id: number;
  name: string;
  url: string;
  fallbackIcon: string;
  category: AIToolCategory;
  rank: number;           // in-category rank for UX ordering
  originalRank: number;   // a16z rank from your image
  flags?: AIToolFlag[];
  // Subscription tracking fields
  isSubscribed?: boolean;
  subscriptionId?: string; // Link to subscription if tracked
  isUsing?: boolean;      // Marked as currently using
}

export interface AIToolFilters {
  subcategory: string | 'all';
  searchTerm: string;
  showSubscribedOnly: boolean;
  showUsingOnly: boolean;
  showUntrackedOnly: boolean;
  a16zRank: 'all' | 'a16z-ranked' | 'user-choice' | 'no-rank';
}

export const AI_TOOL_CATEGORY_ORDER: AIToolCategory[] = [];

export const AI_TOOL_CATEGORY_LABEL: Record<string, string> = {};

export const AI_TOOL_CATEGORY_COLORS: Record<string, string> = {};
