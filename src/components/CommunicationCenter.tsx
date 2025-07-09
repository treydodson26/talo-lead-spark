import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Mail, MessageSquare, Edit, Trash2, Clock } from "lucide-react";
import { EmailTemplate, CustomerSegment, CUSTOMER_SEGMENTS } from "@/types/communication";
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

export function CommunicationCenter({ onBack }: CommunicationCenterProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const { toast } = useToast();

  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: "",
    subject: "",
    content: "",
    type: "welcome",
    segment: "general",
    delayHours: 2
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const template: EmailTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name!,
      subject: newTemplate.subject!,
      content: newTemplate.content!,
      type: newTemplate.type as any,
      segment: newTemplate.segment as CustomerSegment,
      delayHours: newTemplate.delayHours || 2
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: "", subject: "", content: "", type: "welcome", segment: "general", delayHours: 2 });
    setIsCreating(false);
    
    toast({
      title: "Template Created",
      description: "Email template has been saved successfully.",
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: "Template Deleted",
      description: "Email template has been removed.",
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      welcome: "bg-green-100 text-green-800",
      "follow-up": "bg-blue-100 text-blue-800",
      "re-engagement": "bg-orange-100 text-orange-800",
      "post-class": "bg-purple-100 text-purple-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="soft" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Communication Center</h1>
              <p className="text-muted-foreground">Manage email templates and automated sequences</p>
            </div>
          </div>
          <Button variant="zen" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" />
            New Template
          </Button>
        </div>

        {/* Create Template Form */}
        {isCreating && (
          <Card className="bg-gradient-card border-0 shadow-medium mb-6">
            <CardHeader>
              <CardTitle>Create Email Template</CardTitle>
              <CardDescription>Design personalized emails for your customer journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={newTemplate.name || ""}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Welcome Email - Seniors"
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
                      <SelectItem value="welcome">Welcome Email</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="re-engagement">Re-engagement</SelectItem>
                      <SelectItem value="post-class">Post-Class</SelectItem>
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
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={newTemplate.subject || ""}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Welcome to Talo Yoga Studio!"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Email Content *</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content || ""}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Hi {{name}},&#10;&#10;Welcome to our studio..."
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{name}}"} for personalization. More variables: {"{{email}}"}, {"{{phone}}"}
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
                    <p className="text-sm font-medium text-foreground">Subject:</p>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                  </div>
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
        <Card className="bg-primary/5 border-primary/20 shadow-soft mt-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <MessageSquare className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-primary mb-2">Automated Communication Setup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These templates will be used for automated customer engagement sequences. To enable email automation, 
                  you'll need to connect to an email service provider.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-1">SREQ-001: Welcome Emails</p>
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
    </div>
  );
}