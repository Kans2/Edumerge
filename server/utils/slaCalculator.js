/**
 * SLA configuration by priority level.
 * Times are in hours.
 */
const SLA_RULES = {
  critical: { responseTime: 1, resolutionTime: 4 },
  high: { responseTime: 4, resolutionTime: 24 },
  medium: { responseTime: 8, resolutionTime: 72 },
  low: { responseTime: 24, resolutionTime: 168 },
};

/**
 * Calculate SLA deadline based on priority
 */
export const calculateSLADeadline = (priority, createdAt = new Date()) => {
  const rule = SLA_RULES[priority];
  if (!rule) return null;

  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + rule.resolutionTime);
  return deadline;
};

/**
 * Get ageing bucket for a ticket
 */
export const getAgeingBucket = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const hoursDiff = (now - created) / (1000 * 60 * 60);

  if (hoursDiff <= 24) return 'fresh';
  if (hoursDiff <= 72) return 'normal';
  if (hoursDiff <= 168) return 'ageing';
  return 'critical';
};

/**
 * Check if SLA is breached
 */
export const isSLABreached = (slaDeadline) => {
  if (!slaDeadline) return false;
  return new Date() > new Date(slaDeadline);
};

export default SLA_RULES;
