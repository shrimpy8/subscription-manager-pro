"use client";

import { AlertTriangle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UpdateSubscriptionFormData } from '@/components/update-subscription-form';

interface SaveConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionData: UpdateSubscriptionFormData | null;
  isLoading?: boolean;
}

export default function SaveConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  subscriptionData,
  isLoading = false
}: SaveConfirmationDialogProps) {
  if (!subscriptionData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div>
              <DialogTitle className="modal-title">
                Save Changes
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Save className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-orange-900 mb-2">
                  Are you sure you want to save these changes?
                </h4>
                <p className="text-sm text-orange-800 mb-3">
                  These changes are <strong>IRREVERSIBLE</strong> and will permanently update the subscription data.
                </p>
                <div className="bg-white rounded border border-orange-200 p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">Name:</span>
                    <span className="text-sm text-gray-700">{subscriptionData.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">Category:</span>
                    <span className="text-sm text-gray-700">{subscriptionData.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">Plan:</span>
                    <span className="text-sm text-gray-700">{subscriptionData.plan}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">Cost:</span>
                    <span className="text-sm text-gray-700">
                      ${subscriptionData.cost} / {subscriptionData.billingCycle}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">Status:</span>
                    <span className={`text-sm px-2 py-1 rounded-full text-xs font-medium ${
                      subscriptionData.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : subscriptionData.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriptionData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <PremiumButton
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2"
          >
            Cancel
          </PremiumButton>
          <PremiumButton
            variant="gradient"
            onClick={onConfirm}
            loading={!!isLoading}
            className="px-4 py-2"
          >
            {!isLoading && (
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </div>
            )}
            {isLoading && 'Saving...'}
          </PremiumButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
