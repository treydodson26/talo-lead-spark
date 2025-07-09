import { useState, useEffect } from "react";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { LeadDashboard } from "@/components/LeadDashboard";
import { CustomerDashboard } from "@/components/CustomerDashboard";
import { ClientImport } from "@/components/ClientImport";
import { QRCodeManagement } from "@/components/QRCodeManagement";
import { CommunicationCenter } from "@/components/CommunicationCenter";
import { Button } from "@/components/ui/button";
import { BarChart3, QrCode, MessageSquare, Database, Users, Upload } from "lucide-react";
import { useSupabaseLeads } from "@/hooks/useSupabaseLeads";
import { useToast } from "@/hooks/use-toast";
import { Lead, LeadStatus } from "@/types/lead";

const Index = () => {
  const { leads, addLead, updateLeadStatus, migrateLocalStorageData, loading } = useSupabaseLeads();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<"form" | "dashboard" | "customers" | "import" | "qr" | "communication">("form");
  const [migrationComplete, setMigrationComplete] = useState(false);

  // Check for localStorage data and migrate on component mount
  useEffect(() => {
    const checkAndMigrate = async () => {
      const savedLeads = localStorage.getItem('talo-yoga-leads');
      if (savedLeads && !migrationComplete) {
        const result = await migrateLocalStorageData();
        if (result.migrated > 0) {
          toast({
            title: "Data Migrated Successfully",
            description: `${result.migrated} leads have been migrated to the database with automated WhatsApp sequences enabled.`,
          });
        }
        setMigrationComplete(true);
      }
    };
    
    checkAndMigrate();
  }, [migrateLocalStorageData, migrationComplete, toast]);

  const handleLeadSubmitted = async (leadData: Omit<Lead, 'id' | 'status'>) => {
    try {
      await addLead(leadData);
      toast({
        title: "Lead Captured Successfully",
        description: "Welcome WhatsApp message has been automatically queued for delivery.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  const showDashboard = () => {
    setCurrentView("dashboard");
  };

  const showCustomers = () => {
    setCurrentView("customers");
  };

  const showImport = () => {
    setCurrentView("import");
  };

  const showQR = () => {
    setCurrentView("qr");
  };

  const showCommunication = () => {
    setCurrentView("communication");
  };

  const showForm = () => {
    setCurrentView("form");
  };

  if (currentView === "dashboard") {
    return <LeadDashboard leads={leads} onBack={showForm} onUpdateLeadStatus={updateLeadStatus} />;
  }

  if (currentView === "customers") {
    return <CustomerDashboard onBack={showForm} />;
  }

  if (currentView === "import") {
    return <ClientImport onBack={showForm} />;
  }

  if (currentView === "qr") {
    return <QRCodeManagement onBack={showForm} />;
  }

  if (currentView === "communication") {
    return <CommunicationCenter onBack={showForm} />;
  }

  return (
    <div className="relative">
      <LeadCaptureForm onLeadSubmitted={handleLeadSubmitted} />
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 space-y-3">
        <Button
          variant="outline"
          size="lg"
          onClick={showImport}
          className="gap-2 shadow-glow bg-background border-border hover:bg-accent"
        >
          <Upload className="w-5 h-5" />
          Import CSV
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={showCommunication}
          className="gap-2 shadow-glow bg-background border-border hover:bg-accent"
        >
          <MessageSquare className="w-5 h-5" />
          Communications
        </Button>
        
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
          variant="outline"
          size="lg"
          onClick={showCustomers}
          className="gap-2 shadow-glow bg-background border-border hover:bg-accent"
        >
          <Users className="w-5 h-5" />
          Customers
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
