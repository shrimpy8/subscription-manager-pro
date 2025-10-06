"use client";

import { useState, useEffect } from 'react';
import AIToolsBrowser from '@/components/ai-tools-browser';
import PageHeader from '@/components/ui/page-header';
import { PremiumButton } from '@/components/ui/premium-button';
import { Plus } from 'lucide-react';
import { aiTools } from '@/lib/ai-tools-data';
import { AITool } from '@/types/ai-tools';
import { Subscription } from '@/types/subscription';
import { generateId } from '@/lib/utils';
import { saveSubscriptions, loadSubscriptions } from '@/lib/subscription-storage';
import { useToast } from '@/components/ui/toast';
import { ToastContainer } from '@/components/ui/toast';
import { getUserFriendlyMessage } from '@/utils/error-messages';

export default function AIToolsPage() {
  const toast = useToast();
  const [selectedTools, setSelectedTools] = useState<Set<number>>(new Set());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    // Load existing subscriptions
    const loadedSubscriptions = loadSubscriptions();
    setSubscriptions(loadedSubscriptions);
  }, []);

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
    const newSubscription: Subscription = {
      id: generateId(),
      name: tool.name,
      category: 'AI Tools', // Map to subscription category
      status: 'active',
      cost: 0, // Default cost, user can update later
      billingCycle: 'Monthly',
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      priority: 'medium',
      usageFrequency: 'monthly',
      url: tool.url,
      notes: `Added from AI Tools Browser - ${tool.category} category`,
      tags: [tool.category],
      plan: 'Free', // Default plan
      logo: `https://www.google.com/s2/favicons?domain=${new URL(tool.url).hostname}&sz=64`,
      fallbackIcon: tool.fallbackIcon,
      currency: 'USD',
      description: '',
      subcategory: '',
      startDate: new Date(),
      autoRenew: true,
      accountEmail: '' // Default empty email
    };

    // Add to subscriptions
    const updatedSubscriptions = [...subscriptions, newSubscription];
    setSubscriptions(updatedSubscriptions);
    saveSubscriptions(updatedSubscriptions);

    // Show success message
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
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
        onAddToSubscriptions={handleAddToSubscriptions}
        onMarkAsUsing={handleMarkAsUsing}
        selectedTools={selectedTools}
        onToolSelectionChange={handleToolSelectionChange}
      />
      <ToastContainer />
    </div>
  );
}
