'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CreditDisplayProps {
  showPurchase?: boolean;
  compact?: boolean;
}

export function CreditDisplay({ showPurchase = true, compact = false }: CreditDisplayProps) {
  const [credits, setCredits] = useState<{
    monthly: number;
    purchased: number;
    total: number;
    isPro: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCredits();
  }, []);

  async function loadCredits() {
    try {
      const response = await fetch('/api/credits/balance');
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      const data = await response.json();
      setCredits(data);
    } catch (err) {
      console.error('Error loading credits:', err);
      setError('Failed to load credits');
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    setCheckoutLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/credits/checkout', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Failed to create checkout');
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to start checkout');
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {!compact && <span>Loading credits...</span>}
      </div>
    );
  }

  if (!credits) {
    return null;
  }

  const monthlyLimit = credits.isPro ? 50 : 5;
  const isLow = credits.total <= 2;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-muted/40 text-muted-foreground border border-border/60`}>
          <Zap className="h-3 w-3" />
          <span>{credits.total}</span>
        </div>
        {showPurchase && isLow && (
          <Link href="/dashboard/billing">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              disabled={checkoutLoading}
            >
              Buy
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className={`h-5 w-5 ${isLow ? 'text-amber-500' : 'text-emerald-500'}`} />
          <span className="font-medium">
            {credits.total} AI Credits
          </span>
          {isLow && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle className="h-3 w-3" />
              Low
            </span>
          )}
        </div>
        {credits.isPro && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Pro Plan
          </span>
        )}
      </div>

      {/* Credit breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Monthly credits</span>
          <span>{credits.monthly} / {monthlyLimit}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{ width: `${(credits.monthly / monthlyLimit) * 100}%` }}
          />
        </div>
        
        {credits.purchased > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Purchased credits</span>
            <span className="text-emerald-600 font-medium">{credits.purchased}</span>
          </div>
        )}
      </div>

      {/* Purchase button */}
      {showPurchase && (
        <div className="pt-2 border-t">
          <Button
            onClick={handlePurchase}
            disabled={checkoutLoading}
            className="w-full"
            variant={isLow ? 'default' : 'outline'}
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Buy 10 Credits for $5
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Credits never expire • Purchase more anytime
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
