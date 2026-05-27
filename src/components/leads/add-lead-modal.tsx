'use client';

import { useMemo, useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { BudgetRange, LeadSource, Timeline } from '@/lib/clientforge/types';

export interface LeadFormData {
  name: string;
  company: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  service: string;
  budgetRange: BudgetRange;
  timeline: Timeline;
  description: string;
  source: LeadSource;
}

interface Props {
  onAdd: (data: LeadFormData) => void;
  onClose: () => void;
}

const defaultForm: LeadFormData = {
  name: '',
  company: '',
  contactPerson: '',
  email: '',
  phone: '',
  service: '',
  budgetRange: '25k-50k',
  timeline: '1-3months',
  description: '',
  source: 'website',
};

export default function AddLeadModal({ onAdd, onClose }: Props) {
  const [form, setForm] = useState<LeadFormData>(defaultForm);
  const [error, setError] = useState('');

  const isValid = useMemo(() => {
    return Boolean(
      form.name.trim() &&
      form.company.trim() &&
      form.email.trim() &&
      form.service.trim() &&
      form.description.trim()
    );
  }, [form]);

  function handleSubmit() {
    if (!isValid) {
      setError('Please fill in name, company, email, service, and description.');
      return;
    }

    setError('');
    onAdd({
      ...form,
      name: form.name.trim(),
      company: form.company.trim(),
      contactPerson: form.contactPerson?.trim() || '',
      email: form.email.trim(),
      phone: form.phone?.trim() || '',
      service: form.service.trim(),
      description: form.description.trim(),
    });
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4'>
      <div className='w-full max-w-xl rounded-2xl bg-background border border-border shadow-xl p-6 space-y-4'>
        <div>
          <h2 className='text-lg font-semibold'>Add Lead</h2>
          <p className='text-xs text-muted-foreground'>Create a new inbound lead for scoring.</p>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <Input placeholder='Name' value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input placeholder='Company' value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
          <Input placeholder='Contact person' value={form.contactPerson} onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))} />
          <Input placeholder='Email' value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input placeholder='Phone' value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input placeholder='Service needed' value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))} />
          <select className='h-10 rounded-md border border-input bg-background px-3 text-sm' value={form.budgetRange} onChange={(e) => setForm((f) => ({ ...f, budgetRange: e.target.value as BudgetRange }))}>
            <option value='under-10k'>Under $10k</option>
            <option value='10k-25k'>$10k-$25k</option>
            <option value='25k-50k'>$25k-$50k</option>
            <option value='50k-100k'>$50k-$100k</option>
            <option value='100k-plus'>$100k+</option>
            <option value='unsure'>Not specified</option>
          </select>
          <select className='h-10 rounded-md border border-input bg-background px-3 text-sm' value={form.timeline} onChange={(e) => setForm((f) => ({ ...f, timeline: e.target.value as Timeline }))}>
            <option value='asap'>ASAP</option>
            <option value='1-3months'>1-3 months</option>
            <option value='3-6months'>3-6 months</option>
            <option value='6months-plus'>6+ months</option>
            <option value='exploring'>Just exploring</option>
          </select>
          <select className='h-10 rounded-md border border-input bg-background px-3 text-sm col-span-2' value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as LeadSource }))}>
            <option value='referral'>Referral</option>
            <option value='google'>Google</option>
            <option value='website'>Website</option>
            <option value='social'>Social</option>
            <option value='other'>Other</option>
          </select>
          <textarea className='min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm col-span-2' placeholder='Description' value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        {error && <p className='text-sm text-red-600'>{error}</p>}
        <div className='flex justify-end gap-2 pt-2'>
          <button className={cn(buttonVariants({ variant: 'outline' }))} onClick={onClose} type='button'>Cancel</button>
          <button className={cn(buttonVariants())} onClick={handleSubmit} type='button' disabled={!isValid}>Add Lead</button>
        </div>
      </div>
    </div>
  );
}
