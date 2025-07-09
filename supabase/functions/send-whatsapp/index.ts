import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  leadId: string;
  templateId?: string;
  content: string;
  to: string;
  name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Send WhatsApp function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { leadId, templateId, content, to, name }: WhatsAppRequest = await req.json();
    
    console.log('Processing WhatsApp message for:', { leadId, to });

    // Check if Twilio credentials are configured
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER'); // e.g., whatsapp:+14155238886
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      throw new Error('Twilio credentials not configured');
    }

    // Personalize content
    const personalizedContent = content
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{phone\}\}/g, to);

    // Format phone number for WhatsApp (ensure it starts with whatsapp:)
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    // Send WhatsApp message via Twilio
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    const messageResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioWhatsAppNumber,
          To: whatsappTo,
          Body: personalizedContent,
        }),
      }
    );

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.error('Twilio API error:', errorText);
      throw new Error(`WhatsApp sending failed: ${errorText}`);
    }

    const messageResult = await messageResponse.json();
    console.log('WhatsApp message sent successfully:', messageResult.sid);

    // Update communication history
    const { error: historyError } = await supabaseClient
      .from('communication_history')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('lead_id', leadId)
      .eq('template_id', templateId || null)
      .eq('status', 'pending');

    if (historyError) {
      console.error('Failed to update communication history:', historyError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: messageResult.sid,
        message: 'WhatsApp message sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in send-whatsapp function:', error);
    
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