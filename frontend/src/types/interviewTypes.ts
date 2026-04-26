export interface Interview {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled";
  meetingLink?: string;
}