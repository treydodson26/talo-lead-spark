import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Running automated scheduler...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process WhatsApp queue
    const queueResponse = await supabaseClient.functions.invoke('process-whatsapp-queue', {
      body: {}
    });

    if (queueResponse.error) {
      console.error('Queue processing error:', queueResponse.error);
    } else {
      console.log('Queue processing result:', queueResponse.data);
    }

    // Check for leads that need re-engagement (SREQ-005)
    // Find leads that haven't been contacted in 90 days and have no recent communication
    const { data: inactiveLeads, error: inactiveError } = await supabaseClient
      .from('leads')
      .select('id, name, segment')
      .eq('status', 'converted') // Only converted customers for re-engagement
      .lte('last_contacted_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    if (inactiveError) {
      console.error('Error finding inactive leads:', inactiveError);
    } else {
      console.log(`Found ${inactiveLeads?.length || 0} inactive leads for re-engagement`);

      // Trigger re-engagement sequences for inactive leads
      for (const lead of inactiveLeads || []) {
        // Check if they already have a recent re-engagement message
        const { data: recentMessages } = await supabaseClient
          .from('communication_history')
          .select('id')
          .eq('lead_id', lead.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (!recentMessages || recentMessages.length === 0) {
          // Trigger re-engagement sequence
          const { error: sequenceError } = await supabaseClient.rpc('trigger_communication_sequence', {
            p_lead_id: lead.id,
            p_trigger_type: 'inactive-90-days',
            p_segment: lead.segment || 'general'
          });

          if (sequenceError) {
            console.error(`Failed to trigger re-engagement for lead ${lead.id}:`, sequenceError);
          } else {
            console.log(`Triggered re-engagement sequence for lead: ${lead.name}`);
          }
        }
      }
    }

    // Update lead status based on age (auto-progression)
    const { error: updateError } = await supabaseClient
      .from('leads')
      .update({ status: 'lost' })
      .eq('status', 'new')
      .lte('submitted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 days old

    if (updateError) {
      console.error('Error updating lead statuses:', updateError);
    }

    const schedulerResult = {
      success: true,
      queueProcessed: queueResponse.data?.processed || 0,
      queueFailed: queueResponse.data?.failed || 0,
      reengagementTriggered: inactiveLeads?.length || 0,
      timestamp: new Date().toISOString()
    };

    console.log('Scheduler run complete:', schedulerResult);

    return new Response(
      JSON.stringify(schedulerResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in scheduler function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});