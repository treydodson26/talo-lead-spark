import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  leadId: string;
  templateId?: string;
  subject: string;
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
    console.log('Send email function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { leadId, templateId, subject, content, to, name }: EmailRequest = await req.json();
    
    console.log('Processing email for:', { leadId, to, subject });

    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Personalize content
    const personalizedContent = content
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{email\}\}/g, to);
    
    const personalizedSubject = subject.replace(/\{\{name\}\}/g, name);

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Talo Yoga Studio <noreply@taloyoga.com>',
        to: [to],
        subject: personalizedSubject,
        html: personalizedContent.replace(/\n/g, '<br>'),
        text: personalizedContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Email sending failed: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult.id);

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
        emailId: emailResult.id,
        message: 'Email sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in send-email function:', error);
    
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