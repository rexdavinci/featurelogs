export const FAIR_USE_LIMITS = {
  projectCap: 100,
  periodCap: 50,
  periodHours: 24,
};

export function monthStartIso() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  return start.toISOString();
}

export function isoHoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export function formatUsageText(used: number) {
  return `${used}/${FAIR_USE_LIMITS.periodCap} used in the last ${FAIR_USE_LIMITS.periodHours}h`;
}
