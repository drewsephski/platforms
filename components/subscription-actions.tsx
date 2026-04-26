'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreditCard, ExternalLink, Loader2, XCircle, AlertTriangle } from 'lucide-react';

interface SubscriptionActionsProps {
  hasActiveSubscription: boolean;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
}

export function SubscriptionActions({
  hasActiveSubscription,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: SubscriptionActionsProps) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isLoadingCancel, setIsLoadingCancel] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelResult, setCancelResult] = useState<{
    success: boolean;
    message: string;
    currentPeriodEnd?: string;
  } | null>(null);

  const handleManageBilling = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create portal session:', data.error);
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoadingCancel(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setCancelResult({
          success: true,
          message: data.message,
          currentPeriodEnd: data.currentPeriodEnd,
        });
      } else {
        setCancelResult({
          success: false,
          message: data.error || 'Failed to cancel subscription',
        });
      }
    } catch (error) {
      setCancelResult({
        success: false,
        message: 'An error occurred while canceling your subscription',
      });
    } finally {
      setIsLoadingCancel(false);
      setShowCancelDialog(false);
    }
  };

  if (!hasActiveSubscription) {
    return null;
  }

  // Show cancellation scheduled message
  if (cancelAtPeriodEnd) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Subscription ending soon</p>
              <p className="text-sm text-amber-800 mt-1">
                Your subscription will be canceled on{' '}
                {currentPeriodEnd
                  ? new Date(currentPeriodEnd).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'the next billing date'}
                . You can reactivate anytime before then.
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={handleManageBilling}
          disabled={isLoadingPortal}
          variant="outline"
          className="w-full gap-2"
        >
          {isLoadingPortal ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          Manage Billing
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <Button
          onClick={handleManageBilling}
          disabled={isLoadingPortal}
          variant="outline"
          className="w-full gap-2"
        >
          {isLoadingPortal ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          Manage Billing
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>

        <Button
          onClick={() => setShowCancelDialog(true)}
          disabled={isLoadingCancel}
          variant="ghost"
          className="w-full gap-2 text-muted-foreground hover:text-destructive"
        >
          <XCircle className="w-4 h-4" />
          Cancel Subscription
        </Button>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Cancel Subscription?
            </DialogTitle>
            <DialogDescription>
              Your subscription will remain active until the end of your current billing period.
              After that, you&apos;ll be downgraded to the free plan with 5 credits per month.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 rounded-lg p-4 my-4">
            <p className="text-sm font-medium mb-2">What happens when you cancel:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• You keep access until {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : 'the end of your billing period'}</li>
              <li>• Your credits will reset to 5 per month</li>
              <li>• You&apos;ll be limited to 1 site on the free plan</li>
              <li>• You can reactivate anytime</li>
            </ul>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isLoadingCancel}
            >
              {isLoadingCancel && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Yes, Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog
        open={!!cancelResult}
        onOpenChange={() => {
          setCancelResult(null);
          if (cancelResult?.success) {
            window.location.reload();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {cancelResult?.success ? 'Subscription Canceled' : 'Cancellation Failed'}
            </DialogTitle>
            <DialogDescription>{cancelResult?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setCancelResult(null);
                if (cancelResult?.success) {
                  window.location.reload();
                }
              }}
            >
              {cancelResult?.success ? 'Got it' : 'Try Again'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
