"use client";

import { useState, useEffect } from 'react';
import AIToolsBrowser from '@/components/ai-tools-browser';
import { AITool } from '@/types/ai-tools';
import { Subscription } from '@/types/subscription';
import { generateId } from '@/lib/utils';
import { saveSubscriptions, loadSubscriptions } from '@/lib/subscription-storage';

export default function AIToolsPage() {
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
      alert(`${tool.name} is already being tracked in your subscriptions.`);
      return;
    }

    // Create new subscription from AI tool
    const newSubscription: Subscription = {
      id: generateId(),
      name: tool.name,
      category: 'AI Tools', // Map to subscription category
      status: 'active',
      cost: 0, // Default cost, user can update later
      billingCycle: 'monthly',
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      priority: 'medium',
      usageFrequency: 'regular',
      url: tool.url,
      notes: `Added from AI Tools Browser - ${tool.category} category`,
      features: [tool.category]
    };

    // Add to subscriptions
    const updatedSubscriptions = [...subscriptions, newSubscription];
    setSubscriptions(updatedSubscriptions);
    saveSubscriptions(updatedSubscriptions);

    // Show success message
    alert(`${tool.name} has been added to your subscription tracker!`);
  };

  const handleMarkAsUsing = (tool: AITool) => {
    // This could be used to mark tools as currently using
    // For now, we'll just show a message
    alert(`${tool.name} marked as currently using!`);
  };

  const handleToolSelectionChange = (newSelectedTools: Set<number>) => {
    setSelectedTools(newSelectedTools);
  };

  return (
    <div>
      <AIToolsBrowser
        onAddToSubscriptions={handleAddToSubscriptions}
        onMarkAsUsing={handleMarkAsUsing}
        selectedTools={selectedTools}
        onToolSelectionChange={handleToolSelectionChange}
      />
    </div>
  );
}
