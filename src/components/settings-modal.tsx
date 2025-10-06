"use client";

import { useState } from 'react';
import { X, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@/types/subscription';
import { handleError } from '@/utils/error-handler';
import { saveSubscriptions, loadSubscriptions } from '@/lib/subscription-storage';
import { useToast } from '@/components/ui/toast';
import { ToastContainer } from '@/components/ui/toast';
import { getUserFriendlyMessage } from '@/utils/error-messages';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  onSubscriptionsChange: (subscriptions: Subscription[]) => void;
}

export default function SettingsModal({ isOpen, onClose, subscriptions, onSubscriptionsChange }: SettingsModalProps) {
  const toast = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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
        { component: 'settings-modal', action: 'export data' }
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
              onSubscriptionsChange(importedData);
              saveSubscriptions(importedData);
              toast.success(`Successfully imported ${importedData.length} subscriptions!`);
            } else {
              throw new Error('Invalid file format');
            }
          } catch (error) {
            handleError(
              error as Error,
              { component: 'settings-modal', action: 'import data' }
            );
            const errorMessage = getUserFriendlyMessage('IMPORT_ERROR');
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
      onSubscriptionsChange([]);
      saveSubscriptions([]);
      toast.success('All subscriptions have been cleared.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <PremiumButton variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </PremiumButton>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="card-title">Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExport}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Subscriptions'}
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleImport}
                disabled={isImporting}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Subscriptions'}
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleClearAll}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="card-title">About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Subscription Manager Pro</strong></p>
                <p>Version 1.0.0</p>
                <p>Track your subscriptions and discover AI tools in one place.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} className="btn-primary">
            Close
          </Button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
