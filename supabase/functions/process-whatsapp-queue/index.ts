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
    console.log('Processing WhatsApp queue...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending WhatsApp messages that are ready to be sent (including scheduled ones)
    const { data: readyMessages, error: fetchError } = await supabaseClient.rpc('get_ready_messages');

    if (fetchError) {
      throw new Error(`Failed to fetch ready messages: ${fetchError.message}`);
    }

    console.log(`Found ${readyMessages?.length || 0} ready WhatsApp messages`);

    if (!readyMessages || readyMessages.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No WhatsApp messages ready to send',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processed = 0;
    let failed = 0;

    // Process each ready WhatsApp message
    for (const message of readyMessages) {
      try {
        // Call the send-whatsapp function
        const sendResponse = await supabaseClient.functions.invoke('send-whatsapp', {
          body: {
            leadId: message.lead_id,
            templateId: message.template_id,
            content: message.content,
            to: message.lead_phone,
            name: message.lead_name,
          },
        });

        if (sendResponse.error) {
          throw new Error(sendResponse.error.message);
        }

        processed++;
        console.log(`Successfully sent WhatsApp message to ${message.lead_phone}`);

      } catch (messageError: any) {
        console.error(`Failed to send WhatsApp message to ${message.lead_phone}:`, messageError);
        
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
    console.error('Error in process-whatsapp-queue function:', error);
    
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