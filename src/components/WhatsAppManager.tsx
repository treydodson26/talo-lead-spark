import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CommunicationHistoryItem {
  id: string;
  lead_id: string;
  type: string;
  template_id: string | null;
  subject: string | null;
  content: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  leads: {
    name: string;
    phone: string;
  };
}

export function WhatsAppManager() {
  const [pendingMessages, setPendingMessages] = useState<CommunicationHistoryItem[]>([]);
  const [sentMessages, setSentMessages] = useState<CommunicationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      // Load pending messages
      const { data: pending, error: pendingError } = await supabase
        .from('communication_history')
        .select(`
          *,
          leads (name, phone)
        `)
        .eq('type', 'SMS')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // Load recent sent messages
      const { data: sent, error: sentError } = await supabase
        .from('communication_history')
        .select(`
          *,
          leads (name, phone)
        `)
        .eq('type', 'SMS')
        .in('status', ['sent', 'failed'])
        .order('sent_at', { ascending: false })
        .limit(20);

      if (sentError) throw sentError;

      setPendingMessages(pending || []);
      setSentMessages(sent || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load messages: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processQueue = async () => {
    try {
      setProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('process-whatsapp-queue', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Queue Processed Successfully",
        description: `${data.processed} messages sent, ${data.failed} failed`,
      });

      // Reload messages to see updated status
      await loadMessages();
    } catch (error: any) {
      toast({
        title: "Error Processing Queue",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">WhatsApp Automation</h2>
          <p className="text-muted-foreground">Manage automated WhatsApp messages and sequences</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadMessages}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="zen" 
            onClick={processQueue}
            disabled={processing || pendingMessages.length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Process Queue ({pendingMessages.length})
            {processing && <div className="ml-2 w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
          </Button>
        </div>
      </div>

      {/* Pending Messages */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Messages ({pendingMessages.length})
          </CardTitle>
          <CardDescription>
            Messages waiting to be sent via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pending messages</p>
              <p className="text-sm">Messages will appear here when leads are captured</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMessages.map((message) => (
                <div key={message.id} className="p-4 border border-border rounded-lg bg-background">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{message.leads.name}</p>
                      <p className="text-sm text-muted-foreground">{message.leads.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(message.status)}
                      <Badge className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm bg-muted p-3 rounded border-l-4 border-l-primary">
                    {message.content.length > 200 
                      ? message.content.substring(0, 200) + '...'
                      : message.content
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Queued: {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Messages ({sentMessages.length})
          </CardTitle>
          <CardDescription>
            Recently sent WhatsApp messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sentMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No messages sent yet</p>
              <p className="text-sm">Sent messages will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentMessages.map((message) => (
                <div key={message.id} className="p-4 border border-border rounded-lg bg-background">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{message.leads.name}</p>
                      <p className="text-sm text-muted-foreground">{message.leads.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(message.status)}
                      <Badge className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm bg-muted p-3 rounded border-l-4 border-l-primary">
                    {message.content.length > 200 
                      ? message.content.substring(0, 200) + '...'
                      : message.content
                    }
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>
                      {message.sent_at 
                        ? `Sent: ${new Date(message.sent_at).toLocaleString()}`
                        : `Queued: ${new Date(message.created_at).toLocaleString()}`
                      }
                    </span>
                    {message.error_message && (
                      <span className="text-red-500">Error: {message.error_message}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-refresh button */}
      <Button 
        variant="outline" 
        onClick={loadMessages}
        className="w-full"
      >
        Load Messages
      </Button>
    </div>
  );
}