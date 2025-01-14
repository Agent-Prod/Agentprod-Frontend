/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// hooks/useCreateCampaign.tsx
import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from "react";
import axiosInstance from "@/utils/axiosInstance";
import { DashboardData } from "@/types/dashboard";
import { useAuth } from "./auth-provider";

type HotLead = {
  id: string;
  photo_url: string;
  fallback: string;
  name: string;
  company: string;
};

type TopPerformingCampaign = {
  campaign_name: string;
  engaged_leads: number;
  response_rate: number;
  bounce_rate: number;
  open_rate: number;
};

type EmailStats = {
  open_rate: number;
  reply_rate: number;
  conversion_rate: number;
  unsubscribed_rate: number;
  deliverability_rate: number;
  negative_email_rate: number;
  positive_email_rate: number;
};

type AnalyticsData = {
  campaign_id: string;
  delivered_count: number;
  clicked_count: number;
  spam_count: number;
  bounced_count: number;
  user_id: string;
  open_count: number;
  campaign_name: string;
  responded: number;
  sent_count: number;
  total_leads: number;
}[];

type OmniAnalyticsData = {
  campaign_id: string;
  campaign_name: string;
  total_leads: number;
  emails_sent: number;
  linkedin_requests_sent: number;
  linkedin_requests_accepted: number;
  total_replies: number;
  likes_and_comments: number;
  sequences_completed: number;
}[];

type LinkedInAnalyticsData = {
  campaign_name: string;
  connection_sent: number;
  connection_accepted: number;
  connection_withdrawn: number;
  conversations: number;
  posts_liked: number;
  id: string;
}[];

interface DashboardContextType {
  dashboardData: DashboardData;
  analyticsData: AnalyticsData;
  omniAnalyticsData: OmniAnalyticsData;
  isLoading: boolean;
  isAnalyticsLoading: boolean;
  isOmniAnalyticsLoading: boolean;
  linkedInAnalyticsData: LinkedInAnalyticsData;
  isLinkedInAnalyticsLoading: boolean;
  setDashboardData: (dashboardData: DashboardData) => void;
  fetchDashboardDataIfNeeded: () => Promise<void>;
  fetchAnalyticsDataIfNeeded: () => Promise<void>;
  fetchOmniAnalyticsDataIfNeeded: () => Promise<void>;
  fetchLinkedInAnalyticsDataIfNeeded: () => Promise<void>;
}

const defaultDashboardState: DashboardContextType = {
  dashboardData: {
    id: 0,
    user_id: "",
    total_leads: 0,
    pending_approvals: 0,
    emails_sent: null,
    engaged: null,
    meetings_booked: null,
    response_rate: 0,
    hot_leads: [],
    mailbox_health: {},
    conversion_funnel: {
      sent: 0,
      opened: 0,
      cta_clicked: 0,
      goal: 0,
      'goal/click': 0,
      'goal/subscription': 0
    },
    top_performing_campaigns: [],
    email_stats: {
      open_rate: 0,
      reply_rate: 0,
      conversion_rate: 0,
      unsubscribed_rate: 0,
      deliverability_rate: 0,
      negative_email_rate: 0,
      positive_email_rate: 0,
    },
    linkedin_data: [
      {
        campaigns: [],
        connections_sent: 0,
        connections_withdrawn: 0,
        connections_accepted: 0,
      },
    ],
    linkedin_account_status: [],
  },
  analyticsData: [],
  omniAnalyticsData: [],
  isLoading: false,
  isAnalyticsLoading: false,
  isOmniAnalyticsLoading: false,
  linkedInAnalyticsData: [],
  isLinkedInAnalyticsLoading: false,
  setDashboardData: () => { },
  fetchDashboardDataIfNeeded: async () => { },
  fetchAnalyticsDataIfNeeded: async () => { },
  fetchOmniAnalyticsDataIfNeeded: async () => { },
  fetchLinkedInAnalyticsDataIfNeeded: async () => { },
};

const DashboardContext = createContext<DashboardContextType>(
  defaultDashboardState
);

interface Props {
  children: ReactNode;
}

export const DashboardProvider: React.FunctionComponent<Props> = ({
  children,
}) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>(
    defaultDashboardState.dashboardData
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>([]);
  const [hasDashboardLoaded, setHasDashboardLoaded] = useState(false);
  const [hasAnalyticsLoaded, setHasAnalyticsLoaded] = useState(false);
  const [omniAnalyticsData, setOmniAnalyticsData] = useState<OmniAnalyticsData>([]);
  const [isOmniAnalyticsLoading, setIsOmniAnalyticsLoading] = React.useState(false);
  const [hasOmniAnalyticsLoaded, setHasOmniAnalyticsLoaded] = useState(false);
  const [linkedin_account_status, setLinkedinAccountStatus] = useState<string[]>([]);
  const [linkedInAnalyticsData, setLinkedInAnalyticsData] = useState<LinkedInAnalyticsData>([]);
  const [isLinkedInAnalyticsLoading, setIsLinkedInAnalyticsLoading] = useState(false);
  const [hasLinkedInAnalyticsLoaded, setHasLinkedInAnalyticsLoaded] = useState(false);

  const fetchDashboardDataIfNeeded = async () => {
    if (!user?.id || hasDashboardLoaded) return;

    setIsLoading(true);
    try {
      const dashboardResponse = await axiosInstance.get<DashboardData>(
        `v2/dashboard/`
      );

      if (dashboardResponse.data) {
        setDashboardData(dashboardResponse.data);
      }
      setHasDashboardLoaded(true);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalyticsDataIfNeeded = async () => {
    if (!user?.id || hasAnalyticsLoaded) return;

    setIsAnalyticsLoading(true);
    try {
      const analyticsResponse = await axiosInstance.get<AnalyticsData>(
        `v2/campaign/analytics/`
      );

      if (analyticsResponse.data) {
        setAnalyticsData(analyticsResponse.data);
      }
      setHasAnalyticsLoaded(true);
    } catch (error: any) {
      console.error("Error fetching analytics data:", error);
      setError(error.message || "Failed to load analytics data.");
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  const fetchOmniAnalyticsDataIfNeeded = async () => {
    if (!user?.id || hasOmniAnalyticsLoaded) return;

    setIsOmniAnalyticsLoading(true);
    try {
      const omniAnalyticsResponse = await axiosInstance.get<OmniAnalyticsData>(
        `v2/campaign/omni/analytics/`
      );

      setOmniAnalyticsData(omniAnalyticsResponse.data);
      setHasOmniAnalyticsLoaded(true);
    } catch (error: any) {
      console.error("Error fetching omni analytics data:", error);
      setError(error.message || "Failed to load omni analytics data.");
    } finally {
      setIsOmniAnalyticsLoading(false);
    }
  };

  const fetchLinkedInAnalyticsDataIfNeeded = async () => {
    if (!user?.id || hasLinkedInAnalyticsLoaded) return;

    setIsLinkedInAnalyticsLoading(true);
    try {
      const response = await axiosInstance.get<LinkedInAnalyticsData>(
        `v2/campaign/linkedin/`
      );

      if (response.data) {
        setLinkedInAnalyticsData(response.data);
      }
      setHasLinkedInAnalyticsLoaded(true);
    } catch (error: any) {
      console.error("Error fetching LinkedIn analytics data:", error);
      setError(error.message || "Failed to load LinkedIn analytics data.");
    } finally {
      setIsLinkedInAnalyticsLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      dashboardData,
      analyticsData,
      omniAnalyticsData,
      isLoading,
      isAnalyticsLoading,
      isOmniAnalyticsLoading,
      linkedInAnalyticsData,
      isLinkedInAnalyticsLoading,
      setDashboardData,
      fetchDashboardDataIfNeeded,
      fetchAnalyticsDataIfNeeded,
      fetchOmniAnalyticsDataIfNeeded,
      fetchLinkedInAnalyticsDataIfNeeded,
    }),
    [
      dashboardData,
      analyticsData,
      omniAnalyticsData,
      isLoading,
      isAnalyticsLoading,
      isOmniAnalyticsLoading,
      hasDashboardLoaded,
      hasAnalyticsLoaded,
      hasOmniAnalyticsLoaded,
      linkedInAnalyticsData,
      isLinkedInAnalyticsLoading,
      hasLinkedInAnalyticsLoaded
    ]
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => useContext(DashboardContext);
