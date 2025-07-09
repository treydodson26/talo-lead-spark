import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Mail, MessageSquare, Edit, Trash2, Clock, PlayCircle, Users, TrendingUp, Calendar, Send } from "lucide-react";
import { EmailTemplate, CustomerSegment, CUSTOMER_SEGMENTS } from "@/types/communication";
import { WhatsAppManager } from "@/components/WhatsAppManager";
import { AutomationTester } from "@/components/AutomationTester";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CommunicationCenterProps {
  onBack: () => void;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome-general",
    name: "Welcome - General",
    subject: "Welcome to Talo Yoga Studio! Your Journey Begins Here",
    content: `Hi {{name}},

Thank you for your interest in Talo Yoga Studio! We're excited to welcome you to our community.

We received your inquiry and wanted to reach out personally to help you get started on your yoga journey. Our studio offers a variety of classes suitable for all levels, from gentle restorative sessions to more dynamic flows.

What's next?
• Browse our class schedule at [studio website]
• Book your first class online or call us
• Arrive 15 minutes early for a studio tour

We're here to support you every step of the way. Feel free to reach out with any questions!

Namaste,
The Talo Yoga Team`,
    type: "welcome",
    segment: "general",
    delayHours: 2
  },
  {
    id: "welcome-prenatal",
    name: "Welcome - Prenatal",
    subject: "Welcome to Talo Yoga - Supporting You Through Your Pregnancy",
    content: `Hi {{name}},

Congratulations on your pregnancy! We're honored you've chosen Talo Yoga to support you during this special time.

Our prenatal yoga classes are specifically designed to help you:
• Build strength and flexibility safely
• Connect with your growing baby
• Prepare your body for birth
• Find community with other expecting mothers

Important: Please bring a note from your healthcare provider clearing you for prenatal yoga.

Looking forward to seeing you in class!

With love and light,
The Talo Yoga Team`,
    type: "welcome",
    segment: "prenatal",
    delayHours: 2
  }
];

interface CommunicationSequence {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  segment: CustomerSegment | null;
  is_active: boolean;
  steps: Array<{
    step_order: number;
    delay_hours: number;
    template_name: string;
    template_content: string;
  }>;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  segment: CustomerSegment;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_for: string | null;
  sent_count: number;
  open_rate: number;
  click_rate: number;
}

export function CommunicationCenter({ onBack }: CommunicationCenterProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [sequences, setSequences] = useState<CommunicationSequence[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [communicationHistory, setCommunicationHistory] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const { toast } = useToast();

  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: "",
    subject: "",
    content: "",
    type: "welcome",
    segment: "general",
    delayHours: 2
  });

  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: "",
    subject: "",
    content: "",
    segment: "general",
    status: "draft"
  });

  // Load data on mount
  useEffect(() => {
    loadSequences();
    loadCommunicationHistory();
  }, []);

  const loadSequences = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_sequences')
        .select(`
          *,
          sequence_steps(
            step_order,
            delay_hours,
            email_templates(name, content)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedSequences = (data || []).map(seq => ({
        id: seq.id,
        name: seq.name,
        description: seq.description,
        trigger_type: seq.trigger_type,
        segment: seq.segment,
        is_active: seq.is_active,
        steps: (seq.sequence_steps || []).map((step: any) => ({
          step_order: step.step_order,
          delay_hours: step.delay_hours,
          template_name: step.email_templates?.name || 'Unknown Template',
          template_content: step.email_templates?.content || ''
        }))
      }));

      setSequences(mappedSequences);
    } catch (error: any) {
      console.error('Error loading sequences:', error);
    }
  };

  const loadCommunicationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_history')
        .select(`
          *,
          leads(name, email, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCommunicationHistory(data || []);
    } catch (error: any) {
      console.error('Error loading communication history:', error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: newTemplate.name,
          subject: newTemplate.subject,
          content: newTemplate.content,
          type: newTemplate.type,
          segment: newTemplate.segment,
          delay_hours: newTemplate.delayHours || 2
        })
        .select()
        .single();

      if (error) throw error;

      const template: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        content: data.content,
        type: data.type,
        segment: data.segment,
        delayHours: data.delay_hours
      };

      setTemplates(prev => [...prev, template]);
      setNewTemplate({ name: "", subject: "", content: "", type: "welcome", segment: "general", delayHours: 2 });
      setIsCreating(false);
      
      toast({
        title: "Template Created",
        description: "Email template has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.content) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name!,
      subject: newCampaign.subject!,
      content: newCampaign.content!,
      segment: newCampaign.segment as CustomerSegment,
      status: 'draft',
      scheduled_for: null,
      sent_count: 0,
      open_rate: 0,
      click_rate: 0
    };

    setCampaigns(prev => [...prev, campaign]);
    setNewCampaign({ name: "", subject: "", content: "", segment: "general", status: "draft" });
    setIsCreatingCampaign(false);
    
    toast({
      title: "Campaign Created",
      description: "Email campaign has been saved as draft.",
    });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast({
        title: "Template Deleted",
        description: "Email template has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleSequence = async (sequenceId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('communication_sequences')
        .update({ is_active: isActive })
        .eq('id', sequenceId);

      if (error) throw error;

      setSequences(prev => prev.map(seq => 
        seq.id === sequenceId ? { ...seq, is_active: isActive } : seq
      ));
      
      toast({
        title: isActive ? "Sequence Activated" : "Sequence Deactivated",
        description: isActive ? "Automation is now active." : "Automation has been paused.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      welcome: "bg-green-100 text-green-800",
      "follow-up": "bg-blue-100 text-blue-800",
      "re-engagement": "bg-orange-100 text-orange-800",
      "post-class": "bg-purple-100 text-purple-800",
      "intro-package": "bg-indigo-100 text-indigo-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      sent: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="soft" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Communication Center</h1>
            <p className="text-muted-foreground">Manage WhatsApp automation and message templates</p>
          </div>
        </div>

        <Tabs defaultValue="sequences" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sequences">Sequences</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tester" className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Tester
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sequences">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Communication Sequences</h2>
                  <p className="text-muted-foreground">Automated customer journey workflows</p>
                </div>
              </div>

              <div className="grid gap-4">
                {sequences.map((sequence) => (
                  <Card key={sequence.id} className="bg-gradient-card border-0 shadow-soft">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {sequence.name}
                            <Badge variant="outline">{sequence.trigger_type}</Badge>
                            {sequence.segment && (
                              <Badge variant="secondary">
                                {CUSTOMER_SEGMENTS.find(s => s.value === sequence.segment)?.label}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{sequence.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={sequence.is_active}
                            onCheckedChange={(checked) => toggleSequence(sequence.id, checked)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {sequence.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Sequence Steps:</p>
                        <div className="grid gap-2">
                          {sequence.steps.map((step, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm bg-background p-2 rounded border">
                              <Badge variant="outline" className="text-xs">
                                {step.delay_hours}h
                              </Badge>
                              <span className="flex-1">{step.template_name}</span>
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Email Campaigns</h2>
                  <p className="text-muted-foreground">One-time marketing campaigns and newsletters</p>
                </div>
                <Button variant="zen" onClick={() => setIsCreatingCampaign(true)}>
                  <Plus className="w-4 h-4" />
                  New Campaign
                </Button>
              </div>

              {/* Create Campaign Form */}
              {isCreatingCampaign && (
                <Card className="bg-gradient-card border-0 shadow-medium">
                  <CardHeader>
                    <CardTitle>Create Email Campaign</CardTitle>
                    <CardDescription>Send targeted marketing messages to specific customer segments</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="campaign-name">Campaign Name *</Label>
                        <Input
                          id="campaign-name"
                          value={newCampaign.name || ""}
                          onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Spring Yoga Challenge 2024"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="campaign-segment">Target Segment</Label>
                        <Select 
                          value={newCampaign.segment} 
                          onValueChange={(value) => setNewCampaign(prev => ({ ...prev, segment: value as CustomerSegment }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CUSTOMER_SEGMENTS.map((segment) => (
                              <SelectItem key={segment.value} value={segment.value}>
                                {segment.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="campaign-subject">Email Subject *</Label>
                      <Input
                        id="campaign-subject"
                        value={newCampaign.subject || ""}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="🧘‍♀️ Join our Spring Yoga Challenge!"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="campaign-content">Email Content *</Label>
                      <Textarea
                        id="campaign-content"
                        value={newCampaign.content || ""}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Dear {{name}},&#10;&#10;We're excited to announce..."
                        rows={8}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {"{{name}}"} for personalization. HTML is supported.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateCampaign} variant="zen">
                        Save as Draft
                      </Button>
                      <Button onClick={() => setIsCreatingCampaign(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Campaigns Grid */}
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-gradient-card border-0 shadow-soft">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {campaign.name}
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{campaign.subject}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {campaign.status === 'draft' && (
                            <Button size="sm" variant="zen">
                              <Send className="w-4 h-4" />
                              Send
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Target Segment</p>
                          <p className="text-muted-foreground">
                            {CUSTOMER_SEGMENTS.find(s => s.value === campaign.segment)?.label}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Recipients</p>
                          <p className="text-muted-foreground">{campaign.sent_count} customers</p>
                        </div>
                        <div>
                          <p className="font-medium">Performance</p>
                          <p className="text-muted-foreground">
                            {campaign.open_rate}% open rate
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-6">
              {/* Create Template Button */}
              <div className="flex justify-end">
                <Button variant="zen" onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4" />
                  New Template
                </Button>
              </div>

              {/* Create Template Form */}
              {isCreating && (
                <Card className="bg-gradient-card border-0 shadow-medium">
                  <CardHeader>
                    <CardTitle>Create WhatsApp Template</CardTitle>
                    <CardDescription>Design personalized WhatsApp messages for your customer journey</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Template Name *</Label>
                        <Input
                          id="name"
                          value={newTemplate.name || ""}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Welcome Message - Seniors"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="type">Template Type *</Label>
                        <Select 
                          value={newTemplate.type} 
                          onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="welcome">Welcome Message</SelectItem>
                            <SelectItem value="follow-up">Follow-up</SelectItem>
                            <SelectItem value="re-engagement">Re-engagement</SelectItem>
                            <SelectItem value="post-class">Post-Class</SelectItem>
                            <SelectItem value="intro-package">Intro Package</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="segment">Customer Segment</Label>
                        <Select 
                          value={newTemplate.segment} 
                          onValueChange={(value) => setNewTemplate(prev => ({ ...prev, segment: value as CustomerSegment }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CUSTOMER_SEGMENTS.map((segment) => (
                              <SelectItem key={segment.value} value={segment.value}>
                                {segment.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="delay">Send Delay (hours)</Label>
                        <Input
                          id="delay"
                          type="number"
                          value={newTemplate.delayHours || ""}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, delayHours: parseInt(e.target.value) || 2 }))}
                          placeholder="2"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">WhatsApp Message Content *</Label>
                      <Textarea
                        id="content"
                        value={newTemplate.content || ""}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Hi {{name}}! 🧘‍♀️&#10;&#10;Welcome to our studio..."
                        rows={8}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {"{{name}}"} for personalization. Emojis and line breaks are supported.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateTemplate} variant="zen">
                        Create Template
                      </Button>
                      <Button onClick={() => setIsCreating(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {CUSTOMER_SEGMENTS.find(s => s.value === template.segment)?.label}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(template)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge className={getTypeColor(template.type)}>
                          {template.type}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {template.delayHours}h
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">Preview:</p>
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            {template.content.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Info Card */}
              <Card className="bg-primary/5 border-primary/20 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <MessageSquare className="w-8 h-8 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-primary mb-2">WhatsApp Automation Setup</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        These templates power the automated WhatsApp sequences. The system automatically personalizes and sends messages based on customer actions.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground mb-1">SREQ-001: Welcome Messages</p>
                          <p>Automated within 2 hours of inquiry</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground mb-1">SREQ-002: Follow-up Sequences</p>
                          <p>3 touchpoints over 7 days for prospects</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground mb-1">SREQ-006: Segmented Messaging</p>
                          <p>Targeted content by customer segment</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground mb-1">SREQ-005: Re-engagement</p>
                          <p>Win-back campaigns for inactive customers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Communication Analytics</h2>
                <p className="text-muted-foreground">Track customer journey and engagement metrics</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Messages Sent</p>
                        <p className="text-2xl font-bold">
                          {communicationHistory.filter(c => c.status === 'sent').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold">
                          {communicationHistory.length > 0 
                            ? Math.round((communicationHistory.filter(c => c.status === 'sent').length / communicationHistory.length) * 100)
                            : 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Sequences</p>
                        <p className="text-2xl font-bold">
                          {sequences.filter(s => s.is_active).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold">
                          {communicationHistory.filter(c => c.status === 'pending').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Communication History */}
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardHeader>
                  <CardTitle>Recent Communication History</CardTitle>
                  <CardDescription>Latest automated messages and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {communicationHistory.slice(0, 10).map((comm) => (
                      <div key={comm.id} className="flex items-center justify-between p-3 bg-background rounded border">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{comm.leads?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{comm.leads?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(comm.status)}>
                            {comm.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(comm.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Journey Tracking */}
              <Card className="bg-primary/5 border-primary/20 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Calendar className="w-8 h-8 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-primary mb-2">Customer Journey Tracking</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Monitor customer interactions across the entire lifecycle from lead to loyal member.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground mb-1">SREQ-003: Intro Package Journey</p>
                          <p>5-step automation over 30 days</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground mb-1">SREQ-004: Post-Class Follow-up</p>
                          <p>Automated within 4 hours of first class</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground mb-1">SREQ-005: Win-back Campaigns</p>
                          <p>Re-engage customers after 90 days inactive</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground mb-1">SREQ-026: Monthly Newsletters</p>
                          <p>Segmented content delivery</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tester">
            <AutomationTester />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}