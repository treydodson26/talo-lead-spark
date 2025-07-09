import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Target, 
  Clock, 
  CheckCircle,
  BarChart3,
  RefreshCw,
  Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalMessages: number;
  messagesSent: number;
  messagesDelivered: number;
  messagesFailed: number;
  deliveryRate: number;
  leadSources: Array<{ source: string; count: number; percentage: number }>;
  segmentBreakdown: Array<{ segment: string; count: number; percentage: number }>;
  recentActivity: Array<{
    type: string;
    count: number;
    date: string;
  }>;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const { toast } = useToast();

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load leads data
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*');

      if (leadsError) throw leadsError;

      // Load communication history
      const { data: communications, error: commError } = await supabase
        .from('communication_history')
        .select('*');

      if (commError) throw commError;

      // Calculate analytics
      const totalLeads = leads?.length || 0;
      const newLeads = leads?.filter(l => l.status === 'new').length || 0;
      const convertedLeads = leads?.filter(l => l.status === 'converted').length || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      const totalMessages = communications?.length || 0;
      const messagesSent = communications?.filter(c => c.status === 'sent').length || 0;
      const messagesFailed = communications?.filter(c => c.status === 'failed').length || 0;
      const deliveryRate = totalMessages > 0 ? (messagesSent / totalMessages) * 100 : 0;

      // Lead sources analysis
      const sourceMap: Record<string, number> = {};
      leads?.forEach(lead => {
        sourceMap[lead.referral_source] = (sourceMap[lead.referral_source] || 0) + 1;
      });
      
      const leadSources = Object.entries(sourceMap).map(([source, count]) => ({
        source,
        count,
        percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0
      })).sort((a, b) => b.count - a.count);

      // Segment breakdown
      const segmentMap: Record<string, number> = {};
      leads?.forEach(lead => {
        const segment = lead.segment || 'general';
        segmentMap[segment] = (segmentMap[segment] || 0) + 1;
      });

      const segmentBreakdown = Object.entries(segmentMap).map(([segment, count]) => ({
        segment,
        count,
        percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0
      }));

      setAnalytics({
        totalLeads,
        newLeads,
        convertedLeads,
        conversionRate,
        totalMessages,
        messagesSent,
        messagesDelivered: messagesSent, // For WhatsApp, sent = delivered
        messagesFailed,
        deliveryRate,
        leadSources,
        segmentBreakdown,
        recentActivity: [] // Could be enhanced with daily/weekly stats
      });

    } catch (error: any) {
      toast({
        title: "Error Loading Analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runScheduler = async () => {
    try {
      setSchedulerRunning(true);
      
      const { data, error } = await supabase.functions.invoke('automation-scheduler', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Automation Scheduler Completed",
        description: `Processed ${data.queueProcessed} messages, triggered ${data.reengagementTriggered} re-engagement campaigns`,
      });

      // Reload analytics to see updated numbers
      await loadAnalytics();

    } catch (error: any) {
      toast({
        title: "Scheduler Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSchedulerRunning(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No analytics data available</p>
        <Button onClick={loadAnalytics} variant="outline" className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reload Analytics
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Lead conversion and WhatsApp automation performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAnalytics} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={runScheduler} variant="zen" disabled={schedulerRunning}>
            <Play className={`w-4 h-4 mr-2 ${schedulerRunning ? 'animate-spin' : ''}`} />
            Run Automation
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold">{analytics.totalLeads}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-green-600">
                +{analytics.newLeads} new
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-4">
              <Progress value={analytics.conversionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages Sent</p>
                <p className="text-3xl font-bold">{analytics.messagesSent}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-blue-600">
                {analytics.totalMessages} queued
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                <p className="text-3xl font-bold">{analytics.deliveryRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-4">
              <Progress value={analytics.deliveryRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Sources & Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Where your leads are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.leadSources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-primary opacity-${100 - index * 20}`}></div>
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{source.count}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({source.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Lead distribution by segment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.segmentBreakdown.map((segment, index) => (
                <div key={segment.segment} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-secondary opacity-${100 - index * 25}`}></div>
                    <span className="font-medium capitalize">{segment.segment.replace('-', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{segment.count}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({segment.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requirements Status */}
      <Card className="bg-primary/5 border-primary/20 shadow-soft">
        <CardHeader>
          <CardTitle>System Requirements Status</CardTitle>
          <CardDescription>Implementation progress for Talo Yoga automation requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">SREQ-001: Welcome Messages</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Automated within 2 hours ✓
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">SREQ-002: Follow-up Sequences</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                3 touchpoints over 7 days ✓
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">SREQ-005: Re-engagement</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                90-day inactive trigger ✓
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">SREQ-007: WhatsApp</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Business number integration ✓
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">SREQ-008/009: Lead Capture</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                QR code & database storage ✓
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">SREQ-012: Arketa Integration</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Class attendance sync (planned)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}