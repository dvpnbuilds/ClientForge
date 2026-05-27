import type { Lead } from './types';

const _dynamicLeads: Lead[] = [];

export function addDynamicLead(lead: Lead): void {
  _dynamicLeads.unshift(lead);
}

export function getDynamicLead(id: string): Lead | undefined {
  return _dynamicLeads.find((lead) => lead.id === id);
}

export function getAllDynamicLeads(): Lead[] {
  return [..._dynamicLeads];
}
