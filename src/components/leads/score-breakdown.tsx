'use client';

import type { LeadScoreResult } from '@/lib/clientforge/types';
import { Card, CardContent } from '@/components/ui/card';

export default function ScoreBreakdown({ result }: { result: LeadScoreResult }) {
  return (
    <Card>
      <CardContent className='px-4 py-4 space-y-3'>
        <div>
          <p className='text-xs text-muted-foreground'>Score</p>
          <p className='text-lg font-semibold'>{result.score.toUpperCase()} · {result.numericScore}/100</p>
        </div>
        <div>
          <p className='text-xs text-muted-foreground mb-1'>Reason</p>
          <p className='text-sm'>{result.reason}</p>
        </div>
        <div className='space-y-1'>
          {result.breakdown.map((item) => (
            <div key={item.label} className='flex items-center justify-between gap-3 text-xs'>
              <span className='text-muted-foreground'>{item.label}</span>
              <span className='font-medium'>{item.score} — {item.note}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
