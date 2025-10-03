"use client";

import { useState, useEffect } from 'react';
import { Download, Upload, Trash2, ArrowLeft, Info, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@/types/subscription';
import { handleError } from '@/utils/error-handler';
import { saveSubscriptions, loadSubscriptions } from '@/lib/subscription-storage';
import Link from 'next/link';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { getUserFriendlyMessage } from '@/utils/error-messages';

export default function SettingsPage() {
  const toast = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    // Load subscriptions on component mount
    const loadData = async () => {
      try {
        const data = await loadSubscriptions();
        setSubscriptions(data);
      } catch (error) {
        handleError(
          error as Error,
          { component: 'settings-page', action: 'load subscriptions' }
        );
      }
    };
    loadData();
  }, []);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const dataStr = JSON.stringify(subscriptions, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subscriptions-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError(
        error as Error,
        { component: 'settings-page', action: 'export data' }
      );
      const errorMessage = getUserFriendlyMessage('EXPORT_ERROR');
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target?.result as string);
            if (Array.isArray(importedData)) {
              setSubscriptions(importedData);
              saveSubscriptions(importedData);
              toast.success(`Successfully imported ${importedData.length} subscriptions!`);
            } else {
              throw new Error('Invalid file format');
            }
          } catch (error) {
            handleError(
              error as Error,
              { component: 'settings-page', action: 'import data' }
            );
            const errorMessage = getUserFriendlyMessage('VALIDATION_ERROR');
            toast.error(errorMessage);
          } finally {
            setIsImporting(false);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all subscriptions? This action cannot be undone.')) {
      setSubscriptions([]);
      saveSubscriptions([]);
      toast.success('All subscriptions have been cleared.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="glass-card border-b border-orange-200/50 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <ArrowLeft className="w-5 h-5 mr-2 text-gray-600" />
                  <Link 
                    href="/" 
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <h2 className="section-title">Settings</h2>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <p className="text-gray-600">
              Manage your subscription data and application preferences.
            </p>
          </div>

          {/* Settings Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Management */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                  <Download className="w-5 h-5 mr-2 text-orange-600" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 hover:bg-orange-50 hover:border-orange-300"
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export Subscriptions'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 hover:bg-orange-50 hover:border-orange-300"
                    onClick={handleImport}
                    disabled={isImporting}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Import Subscriptions'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Current Subscriptions:</strong> {subscriptions.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Export your data as JSON for backup or migration purposes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Application Info */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                  <Info className="w-5 h-5 mr-2 text-orange-600" />
                  Application Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Subscription Manager Pro</h3>
                    <p className="text-sm text-gray-600">Version 1.0.0</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Track AI tool subscriptions</li>
                      <li>• Discover trending AI tools</li>
                      <li>• Advanced filtering and sorting</li>
                      <li>• CSV export functionality</li>
                      <li>• Data import/export</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Technology Stack</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Next.js 14 with App Router</li>
                      <li>• TypeScript for type safety</li>
                      <li>• Tailwind CSS for styling</li>
                      <li>• shadcn/ui components</li>
                      <li>• Local storage for data persistence</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card className="border border-gray-200 shadow-sm lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                  <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{subscriptions.length}</div>
                    <div className="text-sm text-gray-600">Total Subscriptions</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">
                      {subscriptions.filter(sub => sub.status === 'active').length}
                    </div>
                    <div className="text-sm text-gray-600">Active Subscriptions</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {subscriptions.filter(sub => sub.status === 'paused').length}
                    </div>
                    <div className="text-sm text-gray-600">Paused Subscriptions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}