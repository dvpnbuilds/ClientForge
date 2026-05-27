import type { BudgetRange, LeadScore, LeadScoreResult, LeadScoreBreakdown } from './types';

const budgetValues: Record<BudgetRange, number> = {
  'under-10k': 7000,
  '10k-25k': 18000,
  '25k-50k': 42000,
  '50k-100k': 75000,
  '100k-plus': 125000,
  unsure: 10000,
};

export function budgetRangeToValue(range?: BudgetRange): number {
  if (!range) return 0;
  return budgetValues[range] ?? 0;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function scoreToTier(score: number): LeadScore {
  if (score >= 70) return 'hot';
  if (score >= 45) return 'warm';
  return 'cold';
}

export function scoreLead(input: {
  leadId: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  service: string;
  budgetRange?: BudgetRange;
  timeline?: string;
  description?: string;
  source?: string;
}): LeadScoreResult {
  const breakdown: LeadScoreBreakdown[] = [];
  let score = 25;

  const budget = budgetRangeToValue(input.budgetRange);
  if (budget >= 80000) {
    score += 30;
    breakdown.push({ label: 'Budget', score: 30, note: 'Large project budget' });
  } else if (budget >= 25000) {
    score += 22;
    breakdown.push({ label: 'Budget', score: 22, note: 'Healthy project budget' });
  } else if (budget > 0) {
    score += 10;
    breakdown.push({ label: 'Budget', score: 10, note: 'Smaller budget' });
  } else {
    breakdown.push({ label: 'Budget', score: 0, note: 'Budget not specified' });
  }

  const timeline = (input.timeline ?? '').toLowerCase();
  if (timeline.includes('asap') || timeline.includes('1-3')) {
    score += 20;
    breakdown.push({ label: 'Timeline', score: 20, note: 'Immediate or near-term' });
  } else if (timeline.includes('3-6')) {
    score += 12;
    breakdown.push({ label: 'Timeline', score: 12, note: 'Moderate urgency' });
  } else {
    breakdown.push({ label: 'Timeline', score: 4, note: 'Low urgency or exploratory' });
    score += 4;
  }

  const desc = `${input.service} ${input.description ?? ''}`.toLowerCase();
  const serviceKeywords = ['renovation', 'fit-out', 'fit out', 'kitchen', 'office', 'commercial', 'repair', 'construction'];
  const matches = serviceKeywords.filter((kw) => desc.includes(kw)).length;
  const servicePoints = clamp(matches * 7, 0, 21);
  score += servicePoints;
  breakdown.push({ label: 'Service match', score: servicePoints, note: matches > 0 ? 'Matches core services' : 'Generic inquiry' });

  if ((input.source ?? '') === 'referral') {
    score += 8;
    breakdown.push({ label: 'Source', score: 8, note: 'Referral bonus' });
  }

  score = clamp(score, 0, 100);
  const tier = scoreToTier(score);
  const reason =
    tier === 'hot'
      ? 'High budget, near-term timeline, and clear project scope.'
      : tier === 'warm'
      ? 'Good fit and reasonable budget, but not urgent enough to be hot.'
      : 'Early-stage inquiry with low urgency or unclear budget.';

  return {
    leadId: input.leadId,
    score: tier,
    numericScore: score,
    reason,
    breakdown,
  };
}

export function inferScoreResult(leadId: string, score: LeadScore, reason: string): LeadScoreResult {
  const numericScore = score === 'hot' ? 85 : score === 'warm' ? 62 : 31;
  return {
    leadId,
    score,
    numericScore,
    reason,
    breakdown: [
      { label: 'Inference', score: numericScore, note: reason },
    ],
  };
}
