import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, Users, CheckCircle } from "lucide-react";
import { Lead } from "@/types/lead";

interface LeadCaptureFormProps {
  onLeadSubmitted: (lead: Lead) => void;
}

const referralSources = [
  "Google Search",
  "Social Media",
  "Friend/Family Referral",
  "Existing Member",
  "Walking by the Studio",
  "Website",
  "Event/Workshop",
  "Other"
];

export function LeadCaptureForm({ onLeadSubmitted }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    referralSource: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newLead: Lead = {
        id: Date.now().toString(),
        ...formData,
        submittedAt: new Date(),
        status: 'new'
      };

      onLeadSubmitted(newLead);
      setIsSubmitted(true);
      
      toast({
        title: "Welcome to Talo Yoga!",
        description: "Thank you for your interest. We'll be in touch soon!",
        variant: "default"
      });

      // Reset form after success message
      setTimeout(() => {
        setFormData({ name: "", email: "", phone: "", referralSource: "" });
        setIsSubmitted(false);
      }, 3000);

    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-card shadow-glow border-0">
          <CardContent className="text-center p-8">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Thank You!
              </h2>
              <p className="text-muted-foreground">
                Welcome to the Talo Yoga community. We'll be in touch within 24 hours.
              </p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                <span>Follow us on social media for daily inspiration</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Join our community for exclusive updates</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card shadow-medium border-0">
        <CardHeader className="text-center pb-6">
          <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome to Talo Yoga
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Start your wellness journey with us. Fill out this quick form to get started.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="border-border bg-background/50 focus:bg-background transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="border-border bg-background/50 focus:bg-background transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-medium">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className="border-border bg-background/50 focus:bg-background transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralSource" className="text-foreground font-medium">
                How did you hear about us? *
              </Label>
              <Select
                value={formData.referralSource}
                onValueChange={(value) => handleInputChange("referralSource", value)}
                required
              >
                <SelectTrigger className="border-border bg-background/50 focus:bg-background">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border shadow-medium">
                  {referralSources.map((source) => (
                    <SelectItem key={source} value={source} className="focus:bg-accent">
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              variant="zen"
              size="xl"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Begin My Yoga Journey"}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By submitting this form, you agree to receive communications from Talo Yoga Studio.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}