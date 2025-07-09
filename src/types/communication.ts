export type CustomerSegment = "prenatal" | "seniors" | "young-professionals" | "general";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: "welcome" | "follow-up" | "re-engagement" | "post-class" | "intro-package";
  segment?: CustomerSegment;
  delayHours?: number;
}

export interface CommunicationHistory {
  id: string;
  leadId: string;
  type: "email" | "sms" | "call";
  templateId?: string;
  subject?: string;
  content: string;
  sentAt: Date;
  status: "sent" | "failed" | "pending";
}

export interface CommunicationSequence {
  id: string;
  name: string;
  description: string;
  triggerType: "new-lead" | "intro-purchase" | "first-class" | "inactive-90-days";
  segment?: CustomerSegment;
  templates: {
    templateId: string;
    delayHours: number;
    order: number;
  }[];
  isActive: boolean;
}

export const CUSTOMER_SEGMENTS: { value: CustomerSegment; label: string; description: string }[] = [
  { value: "prenatal", label: "Prenatal", description: "Expecting mothers and prenatal yoga" },
  { value: "seniors", label: "Seniors 60+", description: "Students over 60 years old" },
  { value: "young-professionals", label: "Young Professionals", description: "Working professionals under 35" },
  { value: "general", label: "General", description: "All other students" },
];