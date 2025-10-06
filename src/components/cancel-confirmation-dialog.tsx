"use client";

import { AlertTriangle, X } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface CancelConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function CancelConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: CancelConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div>
              <DialogTitle className="modal-title">
                Cancel Changes
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                You have unsaved changes that will be lost.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <X className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">
                  Are you sure you want to cancel?
                </h4>
                <p className="text-sm text-yellow-800">
                  You have made changes to this subscription that have not been saved. 
                  These changes will be <strong>permanently lost</strong> if you proceed.
                </p>
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
            Continue Editing
          </PremiumButton>
          <PremiumButton
            variant="warning"
            onClick={onConfirm}
            loading={!!isLoading}
            className="px-4 py-2"
          >
            {!isLoading && (
              <div className="flex items-center space-x-2">
                <X className="w-4 h-4" />
                <span>Cancel Changes</span>
              </div>
            )}
            {isLoading && 'Cancelling...'}
          </PremiumButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
