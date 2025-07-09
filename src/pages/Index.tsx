import { useState } from "react";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { LeadDashboard } from "@/components/LeadDashboard";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useLeadStorage } from "@/hooks/useLeadStorage";
import { Lead, LeadStatus } from "@/types/lead";

const Index = () => {
  const { leads, addLead, updateLeadStatus } = useLeadStorage();
  const [currentView, setCurrentView] = useState<"form" | "dashboard">("form");

  const handleLeadSubmitted = (leadData: Omit<Lead, 'id' | 'status'>) => {
    addLead(leadData);
  };

  const showDashboard = () => {
    setCurrentView("dashboard");
  };

  const showForm = () => {
    setCurrentView("form");
  };

  if (currentView === "dashboard") {
    return <LeadDashboard leads={leads} onBack={showForm} onUpdateLeadStatus={updateLeadStatus} />;
  }

  return (
    <div className="relative">
      <LeadCaptureForm onLeadSubmitted={handleLeadSubmitted} />
      
      {/* Floating Dashboard Access Button */}
      <div className="fixed bottom-4 right-4">
        <Button
          variant="zen"
          size="lg"
          onClick={showDashboard}
          className="gap-2 shadow-glow"
        >
          <BarChart3 className="w-5 h-5" />
          View Dashboard
          {leads.length > 0 && (
            <span className="bg-primary-foreground text-primary text-xs px-2 py-1 rounded-full font-bold">
              {leads.length}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Index;
