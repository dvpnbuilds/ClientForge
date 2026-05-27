'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { DraftProposal } from '@/lib/clientforge/types';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  draft: DraftProposal;
  showLeadLink: boolean;
  defaultExpanded?: boolean;
  onApprove?: (id: string) => void;
  onSend?: (id: string) => void;
  onSaveBody?: (id: string, body: string) => void;
}

export default function DraftCard({ draft, showLeadLink, defaultExpanded = false, onApprove, onSend, onSaveBody }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [body, setBody] = useState(draft.body);
  const isEditable = draft.status !== 'sent' && !!onSaveBody;
  const statusLabel = useMemo(() => draft.status.toUpperCase(), [draft.status]);

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <CardTitle className='text-sm'>{draft.subject}</CardTitle>
            <p className='text-xs text-muted-foreground mt-1'>{draft.type} · {statusLabel}</p>
            {showLeadLink && (
              <Link href={`/leads/${draft.leadId}`} className='text-xs text-primary hover:underline'>View lead</Link>
            )}
          </div>
          <button className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))} onClick={() => setExpanded((v) => !v)} type='button'>
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className='space-y-3'>
          <textarea
            className='w-full min-h-36 rounded-md border border-input bg-background px-3 py-2 text-sm'
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (isEditable) onSaveBody?.(draft.id, e.target.value);
            }}
            readOnly={!isEditable}
          />
          <div className='flex flex-wrap gap-2'>
            {onApprove && draft.status === 'draft' && (
              <button className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))} type='button' onClick={() => onApprove(draft.id)}>Approve</button>
            )}
            {onSend && draft.status === 'approved' && (
              <button className={cn(buttonVariants({ size: 'sm' }))} type='button' onClick={() => onSend(draft.id)}>Mark Sent</button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
