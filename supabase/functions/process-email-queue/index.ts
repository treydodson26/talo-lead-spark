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

    // Get pending emails that are ready to be sent
    const { data: pendingEmails, error: fetchError } = await supabaseClient
      .from('communication_history')
      .select(`
        *,
        leads (name, email)
      `)
      .eq('status', 'pending')
      .eq('type', 'Email')
      .limit(10); // Process in batches

    if (fetchError) {
      throw new Error(`Failed to fetch pending emails: ${fetchError.message}`);
    }

    console.log(`Found ${pendingEmails?.length || 0} pending emails`);

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending emails to process',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processed = 0;
    let failed = 0;

    // Process each email
    for (const email of pendingEmails) {
      try {
        // Call the send-email function
        const sendResponse = await supabaseClient.functions.invoke('send-email', {
          body: {
            leadId: email.lead_id,
            templateId: email.template_id,
            subject: email.subject,
            content: email.content,
            to: email.leads.email,
            name: email.leads.name,
          },
        });

        if (sendResponse.error) {
          throw new Error(sendResponse.error.message);
        }

        processed++;
        console.log(`Successfully sent email to ${email.leads.email}`);

      } catch (emailError: any) {
        console.error(`Failed to send email to ${email.leads.email}:`, emailError);
        
        // Mark as failed
        await supabaseClient
          .from('communication_history')
          .update({
            status: 'failed',
            error_message: emailError.message,
          })
          .eq('id', email.id);
        
        failed++;
      }
    }

    console.log(`Email processing complete. Processed: ${processed}, Failed: ${failed}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed,
        failed,
        message: `Processed ${processed} emails, ${failed} failed`
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