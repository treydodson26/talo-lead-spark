import { CustomerSegment } from './communication';

export type LeadStatus = "new" | "contacted" | "in-progress" | "converted" | "lost";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  referralSource: string;
  submittedAt: Date;
  status: LeadStatus;
  segment?: CustomerSegment;
  notes?: string;
  lastContactedAt?: Date;
}

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { value: "in-progress", label: "In Progress", color: "bg-purple-100 text-purple-800" },
  { value: "converted", label: "Converted", color: "bg-green-100 text-green-800" },
  { value: "lost", label: "Lost", color: "bg-red-100 text-red-800" },
];