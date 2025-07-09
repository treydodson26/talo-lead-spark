import { useState } from "react";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { LeadDashboard } from "@/components/LeadDashboard";
import { QRCodeManagement } from "@/components/QRCodeManagement";
import { Button } from "@/components/ui/button";
import { BarChart3, QrCode } from "lucide-react";
import { useLeadStorage } from "@/hooks/useLeadStorage";
import { Lead, LeadStatus } from "@/types/lead";

const Index = () => {
  const { leads, addLead, updateLeadStatus } = useLeadStorage();
  const [currentView, setCurrentView] = useState<"form" | "dashboard" | "qr">("form");

  const handleLeadSubmitted = (leadData: Omit<Lead, 'id' | 'status'>) => {
    addLead(leadData);
  };

  const showDashboard = () => {
    setCurrentView("dashboard");
  };

  const showQR = () => {
    setCurrentView("qr");
  };

  const showForm = () => {
    setCurrentView("form");
  };

  if (currentView === "dashboard") {
    return <LeadDashboard leads={leads} onBack={showForm} onUpdateLeadStatus={updateLeadStatus} />;
  }

  if (currentView === "qr") {
    return <QRCodeManagement onBack={showForm} />;
  }

  return (
    <div className="relative">
      <LeadCaptureForm onLeadSubmitted={handleLeadSubmitted} />
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 space-y-3">
        <Button
          variant="outline"
          size="lg"
          onClick={showQR}
          className="gap-2 shadow-glow bg-background border-border hover:bg-accent"
        >
          <QrCode className="w-5 h-5" />
          QR Codes
        </Button>
        
        <Button
          variant="zen"
          size="lg"
          onClick={showDashboard}
          className="gap-2 shadow-glow"
        >
          <BarChart3 className="w-5 h-5" />
          Dashboard
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
