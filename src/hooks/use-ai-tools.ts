import { useState, useEffect } from 'react';
import { AITool } from '@/types/ai-tools';

type SupabaseSubscription = {
  id: string;
  name: string;
  url: string;
  category: string;
  fallback_icon: string;
  description: string;
  a16z_rank: number | null;
  iam_using_it: boolean;
  safe_for_work: boolean;
  china_region_only: boolean;
  no_subscription: boolean;
  not_in_a16z: boolean;
  cost: number;
  currency: string;
  billing_cycle: string;
  status: string;
};

export function useAITools() {
  const [aiTools, setAiTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAITools = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the API proxy to fetch data
        const response = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions&query=select=*&order=a16z_rank.asc.nulls_last');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch data');
        }

        const data: SupabaseSubscription[] = result.data || [];
        console.log('🔍 useAITools: Raw data from API:', data.length, 'records');
        console.log('🔍 useAITools: First record:', data[0]);

        // Convert database records to AITool format
        const tools: AITool[] = data.map((sub: SupabaseSubscription, index: number) => {
          // Build flags array based on database fields
          const flags: ('cn-region' | 'nsfw' | 'no-rank')[] = [];
          if (sub.china_region_only) flags.push('cn-region');
          if (!sub.safe_for_work) flags.push('nsfw');
          if (sub.not_in_a16z === true) flags.push('no-rank');
          
          return {
            id: index + 1, // Use index as ID for compatibility
            name: sub.name,
            url: sub.url || '',
            fallbackIcon: sub.fallback_icon || '🤖',
            category: (sub.category || 'Other') as 'Chat' | 'Search' | 'Roleplay' | 'Image' | 'Video' | 'Audio' | 'Transcribe' | 'Build' | 'Write' | 'Dev' | 'Utils' | 'Automation' | 'Vector DB' | 'APIs' | 'Planning' | 'Design/Prototype' | 'Speech-to-text' | 'Productivity' | 'DB' | 'Deploy' | 'Other',
            rank: sub.a16z_rank || 999, // rank = a16z_rank
            originalRank: sub.a16z_rank || 999, // originalRank = a16z_rank
            flags: flags, // Map flags: CN Region = china_region_only, NSFW = !safe_for_work
            isSubscribed: sub.no_subscription === false, // If no_subscription is false, it's subscribed
            subscriptionId: sub.id, // Use the database ID
            isUsing: sub.iam_using_it || false // user choice = iam_using_it
          };
        });

        console.log('🔍 useAITools: Converted tools:', tools.length, 'tools');
        console.log('🔍 useAITools: First converted tool:', tools[0]);
        setAiTools(tools);
      } catch (err) {
        console.error('❌ Error fetching AI tools:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch AI tools');
      } finally {
        setLoading(false);
      }
    };

    fetchAITools();
  }, []);

  return { aiTools, loading, error };
}
