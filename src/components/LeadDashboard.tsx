import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Users, Mail, Phone, Calendar, Download, MessageSquare, CheckCircle, BarChart3 } from "lucide-react";
import { Lead, LeadStatus, LEAD_STATUSES } from "@/types/lead";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

interface LeadDashboardProps {
  leads: Lead[];
  onBack: () => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function LeadDashboard({ leads, onBack, onUpdateLeadStatus }: LeadDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.referralSource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const exportLeads = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Referral Source', 'Submitted At'],
      ...leads.map(lead => [
        lead.name,
        lead.email,
        lead.phone,
        lead.referralSource,
        formatDate(lead.submittedAt)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talo-yoga-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      "Google Search": "bg-blue-100 text-blue-800",
      "Social Media": "bg-purple-100 text-purple-800",
      "Friend/Family Referral": "bg-green-100 text-green-800",
      "Existing Member": "bg-primary/10 text-primary",
      "Walking by the Studio": "bg-orange-100 text-orange-800",
      "Website": "bg-cyan-100 text-cyan-800",
      "Event/Workshop": "bg-pink-100 text-pink-800",
      "Other": "bg-gray-100 text-gray-800"
    };
    return colors[source] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="soft" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Back to Form
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lead Dashboard</h1>
            <p className="text-muted-foreground">Manage prospects and track automation performance</p>
          </div>
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leads">Lead Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <div className="space-y-6">
              {/* Export Button */}
              <div className="flex justify-end">
                <Button variant="zen" onClick={exportLeads} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{leads.length}</p>
                        <p className="text-sm text-muted-foreground">Total Leads</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {leads.filter(lead => {
                            const today = new Date();
                            const leadDate = new Date(lead.submittedAt);
                            return leadDate.toDateString() === today.toDateString();
                          }).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Today</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/50 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {leads.filter(lead => {
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return new Date(lead.submittedAt) >= weekAgo;
                          }).length}
                        </p>
                        <p className="text-sm text-muted-foreground">This Week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value: LeadStatus | "all") => setStatusFilter(value)}>
                  <SelectTrigger className="w-48 bg-background border-border">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border shadow-medium">
                    <SelectItem value="all">All Status</SelectItem>
                    {LEAD_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Leads List */}
              <div className="grid gap-4">
                {filteredLeads.length === 0 ? (
                  <Card className="bg-gradient-card border-0 shadow-soft">
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {leads.length === 0 ? "No leads yet" : "No leads found"}
                      </h3>
                      <p className="text-muted-foreground">
                        {leads.length === 0 
                          ? "Leads will appear here once someone fills out the form"
                          : "Try adjusting your search terms"
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredLeads.map((lead) => (
                    <Card key={lead.id} className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1">
                             <div className="flex items-start justify-between mb-3">
                               <div>
                                 <h3 className="text-lg font-semibold text-foreground">{lead.name}</h3>
                                 <p className="text-sm text-muted-foreground">
                                   Submitted on {formatDate(lead.submittedAt)}
                                 </p>
                               </div>
                               <div className="flex gap-2">
                                 <Badge className={LEAD_STATUSES.find(s => s.value === lead.status)?.color || "bg-gray-100 text-gray-800"}>
                                   {LEAD_STATUSES.find(s => s.value === lead.status)?.label || "Unknown"}
                                 </Badge>
                                 <Badge className={getSourceColor(lead.referralSource)}>
                                   {lead.referralSource}
                                 </Badge>
                               </div>
                             </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                                  {lead.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                                  {lead.phone}
                                </a>
                              </div>
                            </div>
                          </div>
                          
                           <div className="flex flex-col gap-2">
                             <div className="flex gap-2">
                               <Button variant="soft" size="sm" asChild>
                                 <a href={`mailto:${lead.email}`}>
                                   <Mail className="w-4 h-4" />
                                   Email
                                 </a>
                               </Button>
                               <Button variant="outline" size="sm" asChild>
                                 <a href={`tel:${lead.phone}`}>
                                   <Phone className="w-4 h-4" />
                                   Call
                                 </a>
                               </Button>
                             </div>
                             
                             {/* Status Quick Actions */}
                             <div className="flex gap-1 flex-wrap">
                               {LEAD_STATUSES.filter(status => status.value !== lead.status).map((status) => (
                                 <Button
                                   key={status.value}
                                   variant="outline"
                                   size="sm"
                                   onClick={() => onUpdateLeadStatus(lead.id, status.value)}
                                   className="text-xs h-7 px-2"
                                 >
                                   {status.value === 'contacted' && <MessageSquare className="w-3 h-3 mr-1" />}
                                   {status.value === 'converted' && <CheckCircle className="w-3 h-3 mr-1" />}
                                   {status.label}
                                 </Button>
                               ))}
                             </div>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}