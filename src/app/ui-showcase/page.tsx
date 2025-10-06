/**
 * UI Showcase Page
 * Demonstrates the enhanced components and design system
 */

'use client';

import { useState } from 'react';
import { Plus, Search, Download, Settings, Bell, User, Star, Heart, Share2 } from 'lucide-react';
import { EnhancedCard, MetricsCard } from '@/components/ui/enhanced-card';
import { PremiumButton, ButtonGroup } from '@/components/ui/premium-button';
import { EnhancedInput, SearchInput } from '@/components/ui/enhanced-input';
import { LoadingState, Skeleton, ProgressBar, Spinner } from '@/components/ui/loading-states';
import { MetricsOverview } from '@/components/dashboard/metrics-overview';
import { EnhancedSubscriptionCard } from '@/components/subscription/enhanced-subscription-card';
import { Subscription } from '@/types/subscription';

export default function UIShowcasePage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sample data
  const sampleSubscriptions: Subscription[] = [
    {
      id: '1',
      name: 'Netflix',
      plan: 'Standard',
      logo: 'https://netflix.com/favicon.ico',
      category: 'Entertainment',
      subcategory: 'Streaming',
      description: 'Video streaming service',
      url: 'https://netflix.com',
      cost: 15.99,
      currency: 'USD',
      billingCycle: 'Monthly',
      status: 'active',
      priority: 'high',
      startDate: new Date('2024-01-01'),
      renewalDate: new Date('2024-12-01'),
      accountEmail: 'user@example.com',
      promoDiscount: 0,
      promoCode: '',
      notes: 'Family plan',
      usageFrequency: 'daily',
      autoRenew: true,
      logoUrl: 'https://netflix.com/favicon.ico',
      fallbackIcon: '🎬',
      chinaRegionOnly: false
    },
    {
      id: '2',
      name: 'Spotify',
      plan: 'Premium',
      logo: 'https://spotify.com/favicon.ico',
      category: 'Entertainment',
      subcategory: 'Music',
      description: 'Music streaming service',
      url: 'https://spotify.com',
      cost: 9.99,
      currency: 'USD',
      billingCycle: 'Monthly',
      status: 'active',
      priority: 'medium',
      startDate: new Date('2024-02-01'),
      renewalDate: new Date('2024-11-01'),
      accountEmail: 'user@example.com',
      promoDiscount: 0,
      promoCode: '',
      notes: 'Premium plan',
      usageFrequency: 'daily',
      autoRenew: true,
      logoUrl: 'https://spotify.com/favicon.ico',
      fallbackIcon: '🎵',
      chinaRegionOnly: false
    }
  ];

  const handleLoadingDemo = () => {
    setLoading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setLoading(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-display text-neutral-900 mb-4">
              UI/UX Showcase
            </h1>
            <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
              Apple-inspired design system with Airbnb-level user experience. 
              Premium components with smooth interactions and professional polish.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Design System Overview */}
        <section className="mb-16">
          <h2 className="text-h2 text-neutral-900 mb-8">Design System Foundation</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <EnhancedCard variant="elevated" padding="lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-h3 text-neutral-900 mb-2">Apple-Inspired</h3>
                <p className="text-body text-neutral-600">
                  Clean, minimal design with premium typography and spacing
                </p>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="elevated" padding="lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-h3 text-neutral-900 mb-2">Smooth Interactions</h3>
                <p className="text-body text-neutral-600">
                  Delightful micro-interactions and hover effects
                </p>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="elevated" padding="lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Share2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-h3 text-neutral-900 mb-2">Airbnb Experience</h3>
                <p className="text-body text-neutral-600">
                  Intuitive user experience with clear visual hierarchy
                </p>
              </div>
            </EnhancedCard>
          </div>
        </section>

        {/* Premium Components */}
        <section className="mb-16">
          <h2 className="text-h2 text-neutral-900 mb-8">Premium Components</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buttons */}
            <EnhancedCard variant="elevated" padding="lg">
              <h3 className="text-h3 text-neutral-900 mb-6">Button Variants</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <PremiumButton variant="primary">Primary</PremiumButton>
                  <PremiumButton variant="secondary">Secondary</PremiumButton>
                  <PremiumButton variant="ghost">Ghost</PremiumButton>
                  <PremiumButton variant="gradient">Gradient</PremiumButton>
                </div>
                <div className="flex flex-wrap gap-3">
                  <PremiumButton variant="success">Success</PremiumButton>
                  <PremiumButton variant="warning">Warning</PremiumButton>
                  <PremiumButton variant="error">Error</PremiumButton>
                </div>
                <div className="flex flex-wrap gap-3">
                  <PremiumButton size="sm">Small</PremiumButton>
                  <PremiumButton size="md">Medium</PremiumButton>
                  <PremiumButton size="lg">Large</PremiumButton>
                </div>
                <div className="flex flex-wrap gap-3">
                  <PremiumButton loading>Loading</PremiumButton>
                  <PremiumButton disabled>Disabled</PremiumButton>
                </div>
              </div>
            </EnhancedCard>

            {/* Inputs */}
            <EnhancedCard variant="elevated" padding="lg">
              <h3 className="text-h3 text-neutral-900 mb-6">Enhanced Inputs</h3>
              <div className="space-y-4">
                <EnhancedInput
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  helperText="We'll never share your email"
                />
                <EnhancedInput
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                />
                <EnhancedInput
                  label="Website URL"
                  type="url"
                  placeholder="https://example.com"
                  success
                />
                <EnhancedInput
                  label="Error State"
                  type="text"
                  placeholder="This field has an error"
                  error="This field is required"
                />
                <SearchInput
                  placeholder="Search subscriptions..."
                  suggestions={['Netflix', 'Spotify', 'Adobe', 'Microsoft']}
                />
              </div>
            </EnhancedCard>
          </div>
        </section>

        {/* Loading States */}
        <section className="mb-16">
          <h2 className="text-h2 text-neutral-900 mb-8">Loading States</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EnhancedCard variant="elevated" padding="lg">
              <h3 className="text-h3 text-neutral-900 mb-6">Loading Indicators</h3>
              <div className="space-y-4">
                <LoadingState state="loading" message="Loading subscriptions..." />
                <LoadingState state="success" message="Successfully saved!" />
                <LoadingState state="error" message="Something went wrong" />
                <LoadingState state="pending" message="Processing..." />
                <div className="flex items-center space-x-4">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="elevated" padding="lg">
              <h3 className="text-h3 text-neutral-900 mb-6">Progress & Skeleton</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-h4 text-neutral-900 mb-2">Progress Bar</h4>
                  <ProgressBar progress={progress} />
                  <PremiumButton 
                    variant="primary" 
                    onClick={handleLoadingDemo}
                    disabled={loading}
                    className="mt-2"
                  >
                    {loading ? 'Loading...' : 'Start Demo'}
                  </PremiumButton>
                </div>
                <div>
                  <h4 className="text-h4 text-neutral-900 mb-2">Skeleton Loading</h4>
                  <Skeleton lines={3} />
                </div>
              </div>
            </EnhancedCard>
          </div>
        </section>

        {/* Metrics Dashboard */}
        <section className="mb-16">
          <h2 className="text-h2 text-neutral-900 mb-8">Metrics Dashboard</h2>
          <MetricsOverview subscriptions={sampleSubscriptions} />
        </section>

        {/* Subscription Cards */}
        <section className="mb-16">
          <h2 className="text-h2 text-neutral-900 mb-8">Enhanced Subscription Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleSubscriptions.map((subscription) => (
              <EnhancedSubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onEdit={(sub) => console.log('Edit:', sub.name)}
                onDuplicate={(sub) => console.log('Duplicate:', sub.name)}
                onDelete={(sub) => console.log('Delete:', sub.name)}
                onPause={(sub) => console.log('Pause:', sub.name)}
                onViewDetails={(sub) => console.log('View Details:', sub.name)}
              />
            ))}
          </div>
        </section>

        {/* Glass Effects */}
        <section className="mb-16">
          <h2 className="text-h2 text-neutral-900 mb-8">Glass Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EnhancedCard variant="glass" padding="lg">
              <h3 className="text-h3 text-neutral-900 mb-4">Glass Card</h3>
              <p className="text-body text-neutral-700">
                Beautiful glass morphism effect with backdrop blur and transparency.
                Perfect for modern, premium interfaces.
              </p>
            </EnhancedCard>
            
            <EnhancedCard variant="outlined" padding="lg">
              <h3 className="text-h3 text-neutral-900 mb-4">Outlined Card</h3>
              <p className="text-body text-neutral-700">
                Clean outlined design with subtle borders and professional spacing.
                Great for content organization and visual hierarchy.
              </p>
            </EnhancedCard>
          </div>
        </section>
      </div>
    </div>
  );
}
