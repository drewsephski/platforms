import { redis } from '@/lib/redis';

export type RateLimitTier = 'free' | 'pro' | 'agency';

interface RateLimitConfig {
  hourly: number;
  daily: number;
}

const RATE_LIMITS: Record<RateLimitTier, RateLimitConfig> = {
  free: { hourly: 5, daily: 10 },
  pro: { hourly: 20, daily: 100 },
  agency: { hourly: 50, daily: 500 },
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
  window: 'hourly' | 'daily';
}

/**
 * Check rate limit for a given identifier (user ID or IP)
 * Uses Redis for distributed rate limiting with sliding window
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'free',
  type: 'user' | 'ip' = 'user'
): Promise<RateLimitResult> {
  const limits = RATE_LIMITS[tier];
  const now = Date.now();
  const hourKey = Math.floor(now / 3600000); // Current hour bucket
  const dayKey = Math.floor(now / 86400000); // Current day bucket

  const prefix = type === 'user' ? 'rate_limit:user' : 'rate_limit:ip';
  const hourlyKey = `${prefix}:${identifier}:hour:${hourKey}`;
  const dailyKey = `${prefix}:${identifier}:day:${dayKey}`;

  // Get current counts
  const [hourlyCount, dailyCount] = await Promise.all([
    redis.get<number>(hourlyKey) ?? 0,
    redis.get<number>(dailyKey) ?? 0,
  ]);

  // Check which window will be exceeded first
  const hourlyRemaining = Math.max(0, limits.hourly - (hourlyCount || 0));
  const dailyRemaining = Math.max(0, limits.daily - (dailyCount || 0));

  // Use the more restrictive limit
  const window = dailyRemaining < hourlyRemaining ? 'daily' : 'hourly';
  const remaining = window === 'daily' ? dailyRemaining : hourlyRemaining;
  const limit = window === 'daily' ? limits.daily : limits.hourly;

  // Calculate reset time
  const resetAt = window === 'daily'
    ? new Date((dayKey + 1) * 86400000)
    : new Date((hourKey + 1) * 3600000);

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      limit,
      window,
    };
  }

  // Increment counters (use pipeline for atomicity)
  const pipeline = redis.pipeline();
  pipeline.incr(hourlyKey);
  pipeline.incr(dailyKey);
  // Set expiry if new keys
  pipeline.expire(hourlyKey, 3600); // 1 hour
  pipeline.expire(dailyKey, 86400); // 24 hours

  await pipeline.exec();

  return {
    allowed: true,
    remaining: remaining - 1,
    resetAt,
    limit,
    window,
  };
}

/**
 * Get user's subscription tier from database
 * This should be called before checkRateLimit to determine the tier
 */
export async function getUserRateLimitTier(
  userId: string,
  supabase: any
): Promise<RateLimitTier> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, stripe_price_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (!subscription) {
    return 'free';
  }

  // Map price IDs to tiers (update these based on your actual Stripe price IDs)
  const AGENCY_PRICE_IDS = ['price_agency_monthly', 'price_agency_yearly'];
  const PRO_PRICE_IDS = ['price_1TQ97uRZE8Whwvf0aIGLZ1w0']; // Your existing pro price

  if (AGENCY_PRICE_IDS.includes(subscription.stripe_price_id)) {
    return 'agency';
  }

  if (PRO_PRICE_IDS.includes(subscription.stripe_price_id)) {
    return 'pro';
  }

  return 'free';
}

/**
 * Get client IP from request headers
 * Falls back to various header sources for different deployment environments
 */
export function getClientIP(headers: Headers): string | null {
  // Vercel-specific headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Get first IP in the chain (client)
    return forwardedFor.split(',')[0].trim();
  }

  // Fall back to other common headers
  return headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-client-ip') ||
    null;
}
