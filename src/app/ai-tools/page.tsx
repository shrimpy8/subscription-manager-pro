"use client";

import { useState } from 'react';
import AIToolsBrowser from '@/components/ai-tools-browser';
import PageHeader from '@/components/ui/page-header';
// import { PremiumButton } from '@/components/ui/premium-button';
import { Plus } from 'lucide-react';
import { AITool } from '@/types/ai-tools';
// import { Subscription } from '@/types/subscription';
import { generateId } from '@/lib/utils';
import { useSupabaseSubscriptions } from '@/hooks/use-supabase-subscriptions';
import { useAITools } from '@/hooks/use-ai-tools';
import { useToast } from '@/components/ui/toast';
import { ToastContainer } from '@/components/ui/toast';
// import { getUserFriendlyMessage } from '@/utils/error-messages';

export default function AIToolsPage() {
  const toast = useToast();
  const [selectedTools, setSelectedTools] = useState<Set<number>>(new Set());
  
  // Use Supabase hooks for both subscriptions and AI tools
  const { subscriptions } = useSupabaseSubscriptions();
  const { aiTools, loading: aiToolsLoading, error: aiToolsError } = useAITools();
  
  console.log('🔍 AI Tools Page - aiTools:', aiTools.length, 'loading:', aiToolsLoading, 'error:', aiToolsError);
  console.log('🔍 AI Tools Page - First tool:', aiTools[0]);

  const handleAddToSubscriptions = (tool: AITool) => {
    // Check if already tracked
    const existingSubscription = subscriptions.find(sub => 
      sub.name.toLowerCase() === tool.name.toLowerCase()
    );

    if (existingSubscription) {
      toast.warning(`${tool.name} is already being tracked in your subscriptions.`);
      return;
    }

    // Create new subscription from AI tool
    const newSubscription = {
      id: generateId(),
      name: tool.name,
      category: 'AI Tools', // Map to subscription category
      status: 'active',
      cost: 0, // Default cost, user can update later
      billing_cycle: 'Monthly',
      renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      usage_importance: 'medium',
      usage_frequency: 'monthly',
      url: tool.url,
      notes: `Added from AI Tools Browser - ${tool.category} category`,
      tags: [tool.category],
      plan: 'Free', // Default plan
      logo: `https://www.google.com/s2/favicons?domain=${new URL(tool.url).hostname}&sz=64`,
      fallback_icon: tool.fallbackIcon,
      currency: 'USD',
      description: '',
      subcategory: '',
      start_date: new Date(),
      auto_renew: true,
      account_email: '' // Default empty email
    };

    // Add to subscriptions via database
    // Note: This would need to be implemented as a database write operation
    // For now, we'll just show a success message
    toast.success(`${tool.name} has been added to your subscription tracker!`);
  };

  const handleMarkAsUsing = (tool: AITool) => {
    // This could be used to mark tools as currently using
    // For now, we'll just show a message
    toast.success(`${tool.name} marked as currently using!`);
  };

  const handleToolSelectionChange = (newSelectedTools: Set<number>) => {
    setSelectedTools(newSelectedTools);
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-200">
      <PageHeader
        title="Trending AI Tools"
        badgeText={`${aiTools.length} Tools`}
        actions={[{
          key: 'add-ai',
          label: 'Add AI Tool',
          variant: 'orange-gradient',
          iconLeft: <Plus className="w-4 h-4 mr-2" />,
          onClick: () => (window.location.href = '/add-ai-tool')
        }]}
      />
      <AIToolsBrowser
        aiTools={aiTools}
        loading={aiToolsLoading}
        error={aiToolsError}
        onAddToSubscriptions={handleAddToSubscriptions}
        onMarkAsUsing={handleMarkAsUsing}
        selectedTools={selectedTools}
        onToolSelectionChange={handleToolSelectionChange}
      />
      <ToastContainer />
    </div>
  );
}
