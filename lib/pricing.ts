export type PricingTier = 'free' | 'indie' | 'pro' | 'agency';

export interface PricingPlan {
  id: PricingTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: number;
  subdomains: number;
  features: string[];
  stripeMonthlyPriceId: string;
  stripeYearlyPriceId: string;
}

export const PRICING_PLANS: Record<PricingTier, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out the platform',
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 5,
    subdomains: 0,
    features: [
      '5 credits per month',
      'Path-based deployment',
      'Basic templates',
      'Community support',
    ],
    stripeMonthlyPriceId: '',
    stripeYearlyPriceId: '',
  },
  indie: {
    id: 'indie',
    name: 'Indie',
    description: 'For solo builders and indie hackers',
    monthlyPrice: 5,
    yearlyPrice: 50,
    credits: 50,
    subdomains: 1,
    features: [
      '50 credits per month',
      '1 reserved custom subdomain',
      'All templates',
      'HTML export',
      'Priority support',
    ],
    stripeMonthlyPriceId: process.env.STRIPE_PRICE_INDIIE_MONTHLY || '',
    stripeYearlyPriceId: process.env.STRIPE_PRICE_INDIIE_YEARLY || '',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For power users building multiple projects',
    monthlyPrice: 9,
    yearlyPrice: 90,
    credits: 150,
    subdomains: 5,
    features: [
      '150 credits per month',
      '5 reserved custom subdomains',
      'All templates',
      'HTML export',
      'Priority support',
      'Advanced analytics',
    ],
    stripeMonthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    stripeYearlyPriceId: process.env.STRIPE_PRICE_PRO_YEARLY || '',
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    description: 'For agencies and teams',
    monthlyPrice: 19,
    yearlyPrice: 190,
    credits: 500,
    subdomains: -1, // Unlimited
    features: [
      '500 credits per month',
      'Unlimited custom subdomains',
      'White-label branding',
      'Custom CSS',
      'HTML export',
      'Priority support',
      'Advanced analytics',
      'Team collaboration',
    ],
    stripeMonthlyPriceId: process.env.STRIPE_PRICE_AGENCY_MONTHLY || '',
    stripeYearlyPriceId: process.env.STRIPE_PRICE_AGENCY_YEARLY || '',
  },
};

export function getPricingPlan(tier: PricingTier): PricingPlan {
  return PRICING_PLANS[tier];
}

export function getPricingPlans(): PricingPlan[] {
  return Object.values(PRICING_PLANS);
}

export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function getYearlySavings(monthlyPrice: number): number {
  const yearlyPrice = monthlyPrice * 10; // 2 months free
  const normalYearlyPrice = monthlyPrice * 12;
  return normalYearlyPrice - yearlyPrice;
}
