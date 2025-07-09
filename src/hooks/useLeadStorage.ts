import { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@/types/lead';

const STORAGE_KEY = 'talo-yoga-leads';

export function useLeadStorage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  // Load leads from localStorage on mount
  useEffect(() => {
    const savedLeads = localStorage.getItem(STORAGE_KEY);
    if (savedLeads) {
      try {
        const parsedLeads = JSON.parse(savedLeads).map((lead: any) => ({
          ...lead,
          submittedAt: new Date(lead.submittedAt),
          lastContactedAt: lead.lastContactedAt ? new Date(lead.lastContactedAt) : undefined,
        }));
        setLeads(parsedLeads);
      } catch (error) {
        console.error('Failed to load leads from storage:', error);
      }
    }
  }, []);

  // Save leads to localStorage whenever leads change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const addLead = (newLead: Omit<Lead, 'id' | 'status'>) => {
    const lead: Lead = {
      ...newLead,
      id: Date.now().toString(),
      status: 'new',
    };
    setLeads(prev => [lead, ...prev]);
    return lead;
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { 
            ...lead, 
            status, 
            lastContactedAt: status === 'contacted' ? new Date() : lead.lastContactedAt 
          }
        : lead
    ));
  };

  const addLeadNote = (leadId: string, note: string) => {
    setLeads(prev => prev.map(lead =>
      lead.id === leadId
        ? { ...lead, notes: note }
        : lead
    ));
  };

  const deleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== leadId));
  };

  return {
    leads,
    addLead,
    updateLeadStatus,
    addLeadNote,
    deleteLead,
  };
}