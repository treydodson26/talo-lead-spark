import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/lead';

export function useSupabaseLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load leads from Supabase
  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const mappedLeads: Lead[] = (data || []).map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        referralSource: lead.referral_source,
        segment: lead.segment as any,
        status: lead.status as LeadStatus,
        notes: lead.notes || undefined,
        submittedAt: new Date(lead.submitted_at),
        lastContactedAt: lead.last_contacted_at ? new Date(lead.last_contacted_at) : undefined,
      }));

      setLeads(mappedLeads);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const addLead = async (newLead: Omit<Lead, 'id' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          referral_source: newLead.referralSource,
          segment: newLead.segment || 'general',
          submitted_at: newLead.submittedAt.toISOString(),
          notes: newLead.notes,
        })
        .select()
        .single();

      if (error) throw error;

      const lead: Lead = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        referralSource: data.referral_source,
        segment: data.segment as any,
        status: data.status as LeadStatus,
        notes: data.notes || undefined,
        submittedAt: new Date(data.submitted_at),
        lastContactedAt: data.last_contacted_at ? new Date(data.last_contacted_at) : undefined,
      };

      setLeads(prev => [lead, ...prev]);
      
      // Trigger welcome email automation (SREQ-001)
      await triggerWelcomeEmail(lead);
      
      return lead;
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding lead:', err);
      throw err;
    }
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus) => {
    try {
      const updates: any = { status };
      if (status === 'contacted') {
        updates.last_contacted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { 
              ...lead, 
              status, 
              lastContactedAt: status === 'contacted' ? new Date() : lead.lastContactedAt 
            }
          : lead
      ));
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating lead status:', err);
    }
  };

  const addLeadNote = async (leadId: string, note: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes: note })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.map(lead =>
        lead.id === leadId
          ? { ...lead, notes: note }
          : lead
      ));
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating lead note:', err);
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.filter(lead => lead.id !== leadId));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting lead:', err);
    }
  };

  // Trigger welcome WhatsApp message automation (SREQ-001)
  const triggerWelcomeEmail = async (lead: Lead) => {
    try {
      // Get appropriate welcome template based on segment
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', 'welcome')
        .or(`segment.eq.${lead.segment},segment.is.null`)
        .eq('is_active', true)
        .order('segment', { ascending: false })
        .limit(1)
        .single();

      if (templateError) {
        console.error('No welcome template found:', templateError);
        return;
      }

      // Schedule the welcome WhatsApp message
      const personalizedContent = template.content.replace(/\{\{name\}\}/g, lead.name);

      await supabase
        .from('communication_history')
        .insert({
          lead_id: lead.id,
          type: 'SMS',
          template_id: template.id,
          subject: null, // WhatsApp doesn't need subjects
          content: personalizedContent,
          status: 'pending'
        });

      console.log('Welcome WhatsApp message queued for:', lead.phone);
    } catch (err: any) {
      console.error('Error triggering welcome WhatsApp message:', err);
    }
  };

  // Migrate localStorage data to Supabase
  const migrateLocalStorageData = async () => {
    try {
      const savedLeads = localStorage.getItem('talo-yoga-leads');
      if (!savedLeads) return { migrated: 0 };

      const localLeads = JSON.parse(savedLeads);
      let migratedCount = 0;

      for (const localLead of localLeads) {
        try {
          await supabase
            .from('leads')
            .insert({
              name: localLead.name,
              email: localLead.email,
              phone: localLead.phone,
              referral_source: localLead.referralSource,
              segment: localLead.segment || 'general',
              status: localLead.status || 'new',
              notes: localLead.notes,
              submitted_at: localLead.submittedAt,
              last_contacted_at: localLead.lastContactedAt,
            });
          migratedCount++;
        } catch (insertError) {
          console.warn('Failed to migrate lead:', localLead.email, insertError);
        }
      }

      // Clear localStorage after successful migration
      if (migratedCount > 0) {
        localStorage.removeItem('talo-yoga-leads');
        await loadLeads(); // Reload from database
      }

      return { migrated: migratedCount };
    } catch (err: any) {
      console.error('Error migrating localStorage data:', err);
      return { migrated: 0, error: err.message };
    }
  };

  return {
    leads,
    loading,
    error,
    addLead,
    updateLeadStatus,
    addLeadNote,
    deleteLead,
    migrateLocalStorageData,
    refreshLeads: loadLeads,
  };
}