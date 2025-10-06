"use client";

import { useState } from 'react';
import { BarChart3, Sparkles, Settings, Menu, X } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SidebarProps {
  currentTab: 'subscriptions' | 'ai-tools';
  onTabChange: (tab: 'subscriptions' | 'ai-tools') => void;
  onSettingsClick?: () => void;
  className?: string;
}

export default function Sidebar({ currentTab, onTabChange, onSettingsClick, className }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'subscriptions' as const,
      label: 'Subscriptions',
      icon: BarChart3,
      description: 'Manage your subscriptions'
    },
    {
      id: 'ai-tools' as const,
      label: 'Trending AI Tools',
      icon: Sparkles,
      description: 'Discover and track AI tools'
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <PremiumButton
        variant="secondary"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </PremiumButton>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-sm border-r border-orange-200/50 z-40 transform transition-transform duration-300 ease-in-out",
        "md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        <div className="p-6">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-xl font-bold gradient-text">
              Subscription Manager Pro
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Track subscriptions & AI tools
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                    "hover:bg-orange-50 hover:border-orange-200",
                    isActive 
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg" 
                      : "text-gray-700 hover:text-orange-600"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-white" : "text-gray-500"
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className={cn(
                      "text-xs",
                      isActive ? "text-orange-100" : "text-gray-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Settings */}
          <div className="mt-8 pt-6 border-t border-orange-200/50">
            <Link href="/settings" className="block">
              <PremiumButton
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </PremiumButton>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
