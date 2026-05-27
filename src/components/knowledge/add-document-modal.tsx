'use client';

import { useMemo, useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { KnowledgeDocument } from '@/lib/clientforge/types';

export interface AddDocumentFormData {
  name: string;
  type: KnowledgeDocument['type'];
  category: string;
  description: string;
}

interface Props {
  onAdd: (data: AddDocumentFormData) => void;
  onClose: () => void;
}

export default function AddDocumentModal({ onAdd, onClose }: Props) {
  const [form, setForm] = useState<AddDocumentFormData>({
    name: '',
    type: 'pdf',
    category: 'profile',
    description: '',
  });
  const [error, setError] = useState('');

  const isValid = useMemo(() => Boolean(form.name.trim() && form.description.trim()), [form]);

  function handleSubmit() {
    if (!isValid) {
      setError('Please enter a document name and description.');
      return;
    }

    setError('');
    onAdd({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
    });
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4'>
      <div className='w-full max-w-lg rounded-2xl bg-background border border-border shadow-xl p-6 space-y-4'>
        <div>
          <h2 className='text-lg font-semibold'>Add Document</h2>
          <p className='text-xs text-muted-foreground'>Upload a knowledge source for grounded answers.</p>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <Input placeholder='Document name' value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <select className='h-10 rounded-md border border-input bg-background px-3 text-sm' value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AddDocumentFormData['type'] }))}>
            <option value='pdf'>PDF</option>
            <option value='txt'>TXT</option>
            <option value='md'>MD</option>
            <option value='docx'>DOCX</option>
          </select>
          <select className='h-10 rounded-md border border-input bg-background px-3 text-sm' value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            <option value='profile'>Profile</option>
            <option value='pricing'>Pricing</option>
            <option value='faq'>FAQ</option>
            <option value='other'>Other</option>
          </select>
          <Input placeholder='Description' value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        {error && <p className='text-sm text-red-600'>{error}</p>}
        <div className='flex justify-end gap-2 pt-2'>
          <button className={cn(buttonVariants({ variant: 'outline' }))} onClick={onClose} type='button'>Cancel</button>
          <button className={cn(buttonVariants())} onClick={handleSubmit} type='button' disabled={!isValid}>Add Document</button>
        </div>
      </div>
    </div>
  );
}
