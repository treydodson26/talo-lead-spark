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
    console.log('Processing email queue...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending WhatsApp messages that are ready to be sent
    const { data: pendingMessages, error: fetchError } = await supabaseClient
      .from('communication_history')
      .select(`
        *,
        leads (name, phone)
      `)
      .eq('status', 'pending')
      .eq('type', 'SMS')
      .limit(10); // Process in batches

    if (fetchError) {
      throw new Error(`Failed to fetch pending messages: ${fetchError.message}`);
    }

    console.log(`Found ${pendingMessages?.length || 0} pending WhatsApp messages`);

    if (!pendingMessages || pendingMessages.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending WhatsApp messages to process',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processed = 0;
    let failed = 0;

    // Process each WhatsApp message
    for (const message of pendingMessages) {
      try {
        // Call the send-whatsapp function
        const sendResponse = await supabaseClient.functions.invoke('send-whatsapp', {
          body: {
            leadId: message.lead_id,
            templateId: message.template_id,
            content: message.content,
            to: message.leads.phone,
            name: message.leads.name,
          },
        });

        if (sendResponse.error) {
          throw new Error(sendResponse.error.message);
        }

        processed++;
        console.log(`Successfully sent WhatsApp message to ${message.leads.phone}`);

      } catch (messageError: any) {
        console.error(`Failed to send WhatsApp message to ${message.leads.phone}:`, messageError);
        
        // Mark as failed
        await supabaseClient
          .from('communication_history')
          .update({
            status: 'failed',
            error_message: messageError.message,
          })
          .eq('id', message.id);
        
        failed++;
      }
    }

    console.log(`WhatsApp processing complete. Processed: ${processed}, Failed: ${failed}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed,
        failed,
        message: `Processed ${processed} WhatsApp messages, ${failed} failed`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in process-email-queue function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});