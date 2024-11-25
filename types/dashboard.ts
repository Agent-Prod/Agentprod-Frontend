export interface ConversionFunnel {
  sent: number;
  opened: number;
  cta_clicked: number;
  goal: number;
  "goal/click": number;
  "goal/subscription": number;
}

export interface EmailStats {
  open_rate: number;
  reply_rate: number;
  conversion_rate: number;
  unsubscribed_rate: number;
  deliverability_rate: number;
  negative_email_rate: number;
  positive_email_rate: number;
}

export interface HotLead {
  id: string;
  name: string;
  photo_url?: string;
  fallback?: string;
  company?: string;
}

export interface Campaign {
  campaign_name: string;
  engaged_leads: number;
  response_rate: number;
  bounce_rate: number | null;
  open_rate: number | null;
  total_leads: number;
}

export interface LinkedinData {
  campaigns: Campaign[];
  connections_sent: number;
  connections_withdrawn: number;
  connections_accepted: number;
}

export interface DashboardData {
  id: number;
  user_id: string;
  pending_approvals: number;
  emails_sent: number | null;
  engaged: number | null;
  meetings_booked: number | null;
  response_rate: number;
  hot_leads: HotLead[];
  mailbox_health: Record<string, number>;
  conversion_funnel: ConversionFunnel;
  top_performing_campaigns: Campaign[];
  email_stats: EmailStats;
  linkedin_data: LinkedinData[];
  total_leads: number;
}
