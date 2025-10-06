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

export type AIToolCategory =
  | "Chat"
  | "Search"
  | "Roleplay"
  | "Image"
  | "Video"
  | "Audio"
  | "Transcribe"
  | "Build"
  | "Write"
  | "Dev"
  | "Utils"
  | "Automation"
  | "Vector DB"
  | "APIs"
  | "Planning"
  | "Design/Prototype"
  | "Speech-to-text"
  | "Productivity"
  | "DB"
  | "Deploy"
  | "Other";

export type AIToolFlag = "cn-region";

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
  category: AIToolCategory | 'all';
  searchTerm: string;
  showSubscribedOnly: boolean;
  showUsingOnly: boolean;
  showUntrackedOnly: boolean;
  a16zRank: 'all' | 'a16z-ranked' | 'user-choice';
}

export const AI_TOOL_CATEGORY_ORDER: AIToolCategory[] = [
  "Chat","Search","Roleplay","Image","Video","Audio","Transcribe","Build","Write","Dev","Utils","Automation","Vector DB","APIs","Planning","Design/Prototype","Speech-to-text","Productivity","DB","Deploy","Other"
];

export const AI_TOOL_CATEGORY_LABEL: Record<AIToolCategory, string> = {
  Chat: "Chat",
  Search: "Search",
  Roleplay: "Roleplay",
  Image: "Image",
  Video: "Video",
  Audio: "Audio",
  Transcribe: "Transcribe",
  Build: "Build",
  Write: "Write",
  Dev: "Dev",
  Utils: "Utils",
  Automation: "Automation",
  "Vector DB": "Vector DB",
  APIs: "APIs",
  Planning: "Planning",
  "Design/Prototype": "Design/Prototype",
  "Speech-to-text": "Speech-to-text",
  Productivity: "Productivity",
  DB: "DB",
  Deploy: "Deploy",
  Other: "Other",
};

export const AI_TOOL_CATEGORY_COLORS: Record<AIToolCategory, string> = {
  Chat: "bg-orange-100 text-orange-800",
  Search: "bg-green-100 text-green-800",
  Roleplay: "bg-purple-100 text-purple-800",
  Image: "bg-pink-100 text-pink-800",
  Video: "bg-red-100 text-red-800",
  Audio: "bg-yellow-100 text-yellow-800",
  Transcribe: "bg-indigo-100 text-indigo-800",
  Build: "bg-orange-100 text-orange-800",
  Write: "bg-teal-100 text-teal-800",
  Dev: "bg-gray-100 text-gray-800",
  Utils: "bg-cyan-100 text-cyan-800",
  Automation: "bg-emerald-100 text-emerald-800",
  "Vector DB": "bg-violet-100 text-violet-800",
  APIs: "bg-amber-100 text-amber-800",
  Planning: "bg-rose-100 text-rose-800",
  "Design/Prototype": "bg-fuchsia-100 text-fuchsia-800",
  "Speech-to-text": "bg-lime-100 text-lime-800",
  Productivity: "bg-sky-100 text-sky-800",
  DB: "bg-stone-100 text-stone-800",
  Deploy: "bg-zinc-100 text-zinc-800",
  Other: "bg-slate-100 text-slate-800",
};
