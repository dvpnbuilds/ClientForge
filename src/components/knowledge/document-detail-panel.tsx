'use client';

import type { DocumentChunk, KnowledgeDocument } from '@/lib/clientforge/types';
import { formatDate } from '@/lib/clientforge/formatters';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  doc: KnowledgeDocument;
  chunks: DocumentChunk[];
  onClose: () => void;
}

export default function DocumentDetailPanel({ doc, chunks, onClose }: Props) {
  return (
    <div className='fixed inset-0 z-50 bg-black/40 flex items-end justify-end p-4'>
      <div className='w-full max-w-xl max-h-[90vh] overflow-auto rounded-2xl bg-background border border-border shadow-xl p-6 space-y-4'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-lg font-semibold'>{doc.name}</h2>
            <p className='text-xs text-muted-foreground'>{doc.description}</p>
          </div>
          <button className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))} onClick={onClose}>Close</button>
        </div>

        <Card>
          <CardContent className='px-4 py-4 space-y-2'>
            <p className='text-xs text-muted-foreground'>Type: <span className='text-foreground'>{doc.type}</span></p>
            <p className='text-xs text-muted-foreground'>Size: <span className='text-foreground'>{doc.size}</span></p>
            <p className='text-xs text-muted-foreground'>Uploaded: <span className='text-foreground'>{formatDate(doc.uploadedAt)}</span></p>
            <p className='text-xs text-muted-foreground'>Chunks: <span className='text-foreground'>{doc.chunkCount}</span></p>
          </CardContent>
        </Card>

        <div>
          <h3 className='text-sm font-semibold mb-2'>Indexed chunks</h3>
          <div className='space-y-2'>
            {chunks.map((chunk) => (
              <Card key={chunk.id}>
                <CardContent className='px-4 py-3'>
                  <p className='text-xs font-medium mb-1'>{chunk.title}</p>
                  <p className='text-xs text-muted-foreground'>{chunk.content}</p>
                </CardContent>
              </Card>
            ))}
            {chunks.length === 0 && <p className='text-xs text-muted-foreground'>No chunks yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
