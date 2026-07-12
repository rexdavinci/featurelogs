export const FREE_LIMITS = {
  projectCap: 1,
  periodCap: 10,
};

export const PREMIUM_LIMITS = {
  projectCap: 100,
  periodCap: 50,
};

export type Profile = {
  id: string;
  email: string;
  is_subscribed: boolean;
  stripe_customer_id: string | null;
};

export function monthStartIso() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  return start.toISOString();
}

export function isoHoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export function formatUsageText(isSubscribed: boolean, used: number) {
  if (isSubscribed) {
    return `Pro Tier • ${used}/${PREMIUM_LIMITS.periodCap} in the last 24h`;
  }

  return `${used}/${FREE_LIMITS.periodCap} Free Logs Used this month`;
}
