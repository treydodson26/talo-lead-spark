import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
}

export function AutomationTester() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const { toast } = useToast();

  const loadLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, email, status')
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      toast({
        title: "Error Loading Leads",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerSequence = async (triggerType: 'intro-package-purchased' | 'first-class-attended') => {
    if (!selectedLead) {
      toast({
        title: "No Lead Selected",
        description: "Please select a lead first",
        variant: "destructive",
      });
      return;
    }

    try {
      setTriggering(true);
      
      const { error } = await supabase.rpc('trigger_communication_sequence', {
        p_lead_id: selectedLead,
        p_trigger_type: triggerType,
        p_segment: 'general'
      });

      if (error) throw error;

      const sequenceName = triggerType === 'intro-package-purchased' 
        ? 'Intro Package Journey (5 touchpoints over 30 days)'
        : 'First Class Follow-up (4 hours)';

      toast({
        title: "Sequence Triggered Successfully!",
        description: `${sequenceName} has been started for the selected lead.`,
      });

    } catch (err: any) {
      toast({
        title: "Error Triggering Sequence",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Automation Tester</h2>
          <p className="text-muted-foreground">Test intro package and post-class follow-up sequences</p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadLeads}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Leads"}
        </Button>
      </div>

      {/* Lead Selection */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            Select Lead for Testing
          </CardTitle>
          <CardDescription>
            Choose a lead to test automation sequences with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedLead} onValueChange={setSelectedLead}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a lead..." />
            </SelectTrigger>
            <SelectContent>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{lead.name} ({lead.email})</span>
                    <Badge variant="secondary" className="ml-2">
                      {lead.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Automation Sequences */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Intro Package Automation */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Intro Package Journey
            </CardTitle>
            <CardDescription>
              SREQ-003: 5-interaction sequence over 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Sequence Timeline:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Day 0: Welcome message (immediate)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3 h-3 text-yellow-500" />
                  <span>Day 7: Week 1 check-in</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3 h-3 text-yellow-500" />
                  <span>Day 15: Mid-point motivation</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3 h-3 text-yellow-500" />
                  <span>Day 22: Week 3 encouragement</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3 h-3 text-yellow-500" />
                  <span>Day 28: Final push before expiry</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => triggerSequence('intro-package-purchased')}
              disabled={!selectedLead || triggering}
              className="w-full"
              variant="zen"
            >
              {triggering ? "Triggering..." : "Trigger Intro Package Sequence"}
            </Button>
          </CardContent>
        </Card>

        {/* Post-Class Follow-up */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              First Class Follow-up
            </CardTitle>
            <CardDescription>
              SREQ-004: Automatic message 4 hours after first class
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Sequence Timeline:</p>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-blue-500" />
                <span>4 hours after first class attendance</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Checks in on their experience, answers questions, and encourages next steps.
              </p>
            </div>
            
            <Button 
              onClick={() => triggerSequence('first-class-attended')}
              disabled={!selectedLead || triggering}
              className="w-full"
              variant="zen"
            >
              {triggering ? "Triggering..." : "Trigger Post-Class Follow-up"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-muted/50 border-0">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Load leads using the "Load Leads" button</li>
            <li>Select a lead from the dropdown</li>
            <li>Click one of the trigger buttons to start a sequence</li>
            <li>Go to Communications → WhatsApp Automation to see queued messages</li>
            <li>Use "Process Queue" to send the messages immediately</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-3">
            Note: In production, these sequences would be triggered automatically when customers purchase intro packages or attend their first class.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}