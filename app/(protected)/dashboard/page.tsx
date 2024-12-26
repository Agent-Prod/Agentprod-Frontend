/* eslint-disable no-console */
"use client";
import React, { memo, useCallback, useEffect, useState } from "react";
import { LineChartComponent } from "@/components/charts/line-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import DashboardPageHeader from "@/components/layout/dashboard-page-header";
import { useDashboardContext } from "@/context/dashboard-analytics-provider";
import { useMailGraphContext } from "@/context/chart-data-provider";
import { format, parseISO, startOfWeek, addDays } from "date-fns";
import { LoadingCircle } from "@/app/icons";
import type { Campaign, DashboardData } from "@/types/dashboard";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "@/context/auth-provider";
interface TopPerformingCampaignsTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

const LinkedinCampaignsTable = memo(() => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldLoadLinkedInAnalytics, setShouldLoadLinkedInAnalytics] = useState(false);

  const fetchLinkedInAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`v2/campaign/linkedin/`);
      const data = await response.data;
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch LinkedIn analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shouldLoadLinkedInAnalytics) {
      fetchLinkedInAnalytics();
    }
  }, [shouldLoadLinkedInAnalytics]);

  const renderCampaignRow = useCallback((campaign: any) => (
    <TableRow key={campaign?.campaign_name}>
      <TableCell>{campaign?.campaign_name}</TableCell>
      <TableCell className="text-center">{campaign?.connection_sent}</TableCell>
      <TableCell className="text-center">{campaign?.connection_accepted}</TableCell>
      <TableCell className="text-center">{campaign?.connection_withdrawn}</TableCell>
      <TableCell className="text-center">{campaign?.conversations}</TableCell>
      <TableCell className="text-center">{campaign?.posts_liked}</TableCell>
    </TableRow>
  ), []);

  return (
    <div className="space-y-4">
      {!shouldLoadLinkedInAnalytics && (
        <div className="flex justify-end px-6">
          <Button
            onClick={() => setShouldLoadLinkedInAnalytics(true)}
            className="bg-gradient-to-r from-black to-black text-white"
          >
            Load LinkedIn Analytics
          </Button>
        </div>
      )}

      {!shouldLoadLinkedInAnalytics ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <p className="text-muted-foreground text-sm">
            Load analytics data to view LinkedIn campaign performance
          </p>
        </div>
      ) : (
        <Table className="border-collapse [&_tr:hover]:bg-accent/40 transition-colors">
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead className="text-center">Connections Sent</TableHead>
              <TableHead className="text-center">Connections Accepted</TableHead>
              <TableHead className="text-center">Connections Withdrawn</TableHead>
              <TableHead className="text-center">Conversations</TableHead>
              <TableHead className="text-center">Posts Liked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <LoadingCircle />
                </TableCell>
              </TableRow>
            ) : !campaigns?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No LinkedIn campaigns available.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map(renderCampaignRow)
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
});

LinkedinCampaignsTable.displayName = 'LinkedinCampaignsTable';

const TopPerformingCampaignsTable = memo(({ campaigns, isLoading }: TopPerformingCampaignsTableProps) => {
  const router = useRouter();

  const handleRowClick = useCallback((campaign: any, columnName: string) => {
    const filterMap: { [key: string]: string } = {
      'campaign_name': 'ALL',
      'sent_count': 'SENT',
      'delivered_count': 'DELIVERED',
      'open_count': 'OPENED',
      'clicked_count': 'CLICKED',
      'responded': 'REPLIED',
      'spam_count': 'SPAM',
      'bounced_count': 'BOUNCED'
    };

    const filter = filterMap[columnName];
    if (!filter) return;

    const queryParams = new URLSearchParams({
      campaign_id: campaign.campaign_id,
      _filter: filter
    });

    // Navigate to the mail page with the filters
    router.push(`/mail?${queryParams.toString()}`);
  }, [router]);

  const renderCampaignRow = useCallback((campaign: any) => (
    <TableRow key={campaign.campaign_id}>
      <TableCell>
        <span
          className="cursor-pointer hover:underline"
          onClick={() => handleRowClick(campaign, 'campaign_name')}
        >
          {campaign.campaign_name}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => handleRowClick(campaign, 'sent_count')}
        >
          {campaign.sent_count}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => handleRowClick(campaign, 'delivered_count')}
        >
          {campaign.delivered_count}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => handleRowClick(campaign, 'open_count')}
        >
          {campaign.open_count}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => handleRowClick(campaign, 'clicked_count')}
        >
          {campaign.clicked_count}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => handleRowClick(campaign, 'responded')}
        >
          {campaign.responded}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => handleRowClick(campaign, 'spam_count')}
        >
          {campaign.spam_count}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => handleRowClick(campaign, 'bounced_count')}
        >
          {campaign.bounced_count}
        </span>
      </TableCell>
      <TableCell className="text-center">

        {campaign.total_leads}

      </TableCell>
    </TableRow>
  ), [handleRowClick]);

  return (
    <Table className="border-collapse [&_tr:hover]:bg-accent/40 transition-colors">
      <TableHeader>
        <TableRow>
          <TableHead>Campaign Name</TableHead>
          <TableHead className="text-center">Sent</TableHead>
          <TableHead className="text-center">Delivered</TableHead>
          <TableHead className="text-center">Opened</TableHead>
          <TableHead className="text-center">Clicked</TableHead>
          <TableHead className="text-center">Responded</TableHead>
          <TableHead className="text-center">Spam</TableHead>
          <TableHead className="text-center">Bounced</TableHead>
          <TableHead className="text-center">Total Leads</TableHead>

        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              <LoadingCircle />
            </TableCell>
          </TableRow>
        ) : !campaigns?.length ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No top performing campaigns available.
            </TableCell>
          </TableRow>
        ) : (
          campaigns.map(renderCampaignRow)
        )}
      </TableBody>
    </Table>
  );
});

TopPerformingCampaignsTable.displayName = 'TopPerformingCampaignsTable';

interface MailboxHealthProps {
  healthData: Record<string, number>;
  isLoading: boolean;
}

const MailboxHealth = memo(({ healthData, isLoading }: MailboxHealthProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <LoadingCircle />
      </div>
    );
  }

  if (!healthData || Object.keys(healthData).length === 0) {
    return <div className="text-center">No mailbox health data available.</div>;
  }

  return (
    <>
      {Object.entries(healthData).map(([email, health]) => (
        <div key={email} className="space-y-2">
          <p className="text-sm">
            {email} - {health}%
          </p>
          <Progress
            value={health}
            className="h-5 transition-all duration-200 hover:shadow-md [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/80"
          />
        </div>
      ))}
    </>
  );
});

MailboxHealth.displayName = 'MailboxHealth';

const DashboardMetrics = memo(({ dashboardData, isLoading }: {
  dashboardData: DashboardData;
  isLoading: boolean
}) => {
  const metrics = [
    {
      title: "Total Emails Sent",
      value: dashboardData?.emails_sent ?? 0,
      icon: <Icons.mail className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Engaged Leads",
      value: dashboardData?.engaged ?? 0,
      icon: <Icons.users className="h-5 w-5 text-primary transition-transform duration-200 group-hover:scale-110" />
    },
    {
      title: "People Reached",
      value: dashboardData?.total_leads ?? 0,
      icon: <Icons.userPlus className="h-5 w-5 text-primary transition-transform duration-200 group-hover:scale-110" />
    },
    {
      title: "Response Rate",
      value: `${dashboardData?.response_rate ? Math.round(dashboardData.response_rate) : 0}%`,
      icon: <Icons.percent className="h-5 w-5 text-primary transition-transform duration-200 group-hover:scale-110" />
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-2 mt-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="transition-all duration-200 hover:shadow-lg border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-background via-background/90 to-background/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium flex items-center gap-2">
              {metric.icon}
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {isLoading ? <LoadingCircle /> : metric.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

DashboardMetrics.displayName = 'DashboardMetrics';

export default function Page() {
  const {
    dashboardData,
    isLoading,
    analyticsData,
    isAnalyticsLoading,
    fetchDashboardDataIfNeeded,
    fetchAnalyticsDataIfNeeded
  } = useDashboardContext();


  const { mailGraphData, contactsData, fetchDataIfNeeded } = useMailGraphContext();
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(true);

  useEffect(() => {
    fetchDashboardDataIfNeeded();
    fetchDataIfNeeded();
  }, []);

  useEffect(() => {
    if (shouldLoadAnalytics) {
      fetchAnalyticsDataIfNeeded();
    }
  }, [shouldLoadAnalytics]);

  const getWeekDays = () => {
    let weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }).map((_, index) =>
      format(addDays(weekStart, index), "yyyy-MM-dd")
    );
  };

  const allWeekDays = getWeekDays();

  const activeDaysSet = new Set(
    (mailGraphData || []).map((data) => {
      if (!data.date) return null;
      try {
        const parsedDate = parseISO(data.date);
        if (isNaN(parsedDate.getTime())) {
          console.warn(`Invalid date: ${data.date}`);
          return null;
        }
        return format(parsedDate, "yyyy-MM-dd");
      } catch (error) {
        console.error(`Error parsing date: ${data.date}`, error);
        return null;
      }
    })
      .filter(Boolean)
  );
  const router = useRouter();

  return (
    <>
      <DashboardPageHeader />
      <ScrollArea className="h-full scroll-my-36 bg-gradient-to-br from-background via-background/98 to-background/95">
        <div className="flex-1 space-y-4 p-2">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
            <div className="flex flex-col col-span-3 gap-4">
              <Card
                className="cursor-pointer hover:bg-accent/50 transition-colors shadow-sm"
                onClick={() => {
                  const queryParams = new URLSearchParams({
                    _filter: 'TO-APPROVE'
                  });
                  router.push(`/mail?${queryParams.toString()}`);
                }}
              >
                <CardContent className="flex items-center justify-between pt-6">
                  <div className="flex items-center gap-3">
                    <Icons.mail className="h-5 w-5 text-primary" />
                    <p className="font-medium">Emails Pending Approval</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {dashboardData?.pending_approvals || 0}
                  </Badge>
                </CardContent>
              </Card>

              <DashboardMetrics dashboardData={dashboardData} isLoading={isLoading} />
            </div>

            <Card className="col-span-3 shadow-sm">
              <ScrollArea className="h-[20rem]">
                <CardHeader className="sticky top-0 bg-background z-10 pb-2 px-6">
                  <div className="flex justify-between items-center">
                    <CardTitle>Email Campaign</CardTitle>
                    {!shouldLoadAnalytics && (
                      <Button
                        onClick={() => setShouldLoadAnalytics(true)}
                        className="bg-gradient-to-r from-primary to-primary/90 text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
                      >
                        Load Analytics
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-4 pt-0">
                  <div className="relative w-full h-full">
                    {!shouldLoadAnalytics ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <p className="text-muted-foreground text-sm">Load analytics data to view campaign performance</p>
                      </div>
                    ) : (
                      <TopPerformingCampaignsTable
                        campaigns={analyticsData?.map(campaign => ({
                          campaign_id: campaign.campaign_id,
                          sent_count: campaign.sent_count,
                          delivered_count: campaign.delivered_count,
                          clicked_count: campaign.clicked_count,
                          spam_count: campaign.spam_count,
                          bounced_count: campaign.bounced_count,
                          user_id: campaign.user_id,
                          open_count: campaign.open_count,
                          campaign_name: campaign.campaign_name,
                          responded: campaign.responded,
                          engaged_leads: 0,
                          response_rate: (campaign.responded / (campaign.delivered_count + campaign.bounced_count)) * 100,
                          bounce_rate: (campaign.bounced_count / (campaign.delivered_count + campaign.bounced_count)) * 100,
                          open_rate: (campaign.open_count / (campaign.delivered_count + campaign.bounced_count)) * 100,
                          total_leads: campaign.total_leads
                        }))}
                        isLoading={isAnalyticsLoading}
                      />
                    )}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Sending Volume Per Day</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <LineChartComponent
                  mailGraphData={mailGraphData}
                  contactsData={contactsData}
                />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <ScrollArea className="md:h-[26rem]">
                <CardHeader className="sticky top-0 bg-background z-10 pb-2 px-6">
                  <CardTitle>LinkedIn Campaign</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="relative w-full h-full">
                    <LinkedinCampaignsTable />
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>

            <Card className="col-span-1">
              <ScrollArea className="h-[16rem]">
                <CardHeader>
                  <CardTitle>Hot Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center items-center">
                        <LoadingCircle />
                      </div>
                    ) : dashboardData?.hot_leads.length > 0 ? (
                      dashboardData.hot_leads.map((lead: any) => (
                        <div
                          key={lead.name}
                          className="flex items-center cursor-pointer transition-all duration-200 hover:bg-accent/40 p-2 rounded-md backdrop-blur-sm"
                          onClick={() => {
                            const queryParams = new URLSearchParams({
                              search_filter: lead.name.split(' ')[0]
                            });
                            router.push(`/mail?${queryParams.toString()}`);
                          }}
                        >
                          <Avatar className="h-9 w-9 ring-2 ring-primary/10 transition-all duration-200 hover:ring-primary/30">
                            <AvatarImage src={lead.photo_url ?? lead?.organization?.logo_url} alt="Avatar" />
                            <AvatarFallback>
                              {lead.fallback ||
                                (lead.name ? lead.name.charAt(0) : "")}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium leading-none ml-4">{`${lead.name}`}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center">No hot leads available.</div>
                    )}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>

            <div className="col-span-2 grid grid-cols-1 gap-4">
              <Card>
                <ScrollArea className="h-[16rem]">
                  <CardHeader>
                    <CardTitle>Mailbox Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <MailboxHealth healthData={dashboardData?.mailbox_health} isLoading={isLoading} />
                  </CardContent>
                </ScrollArea>
              </Card>

              <Card className="p-4 space-y-8">
                <div className="flex justify-between items-center gap-5 mb-4">
                  <div>
                    <div className="text-lg font-semibold">Email Streak</div>
                    <div className="text-sm text-gray-600">
                      Approve emails today to start a new streak
                    </div>
                  </div>
                  <Icons.zap
                    size={35}
                    className="fill-purple-500 text-purple-500"
                  />
                </div>

                <div className="flex items-end justify-between">
                  {allWeekDays.map((day, index) => {
                    const dayOfWeek = format(parseISO(day), "EEE");
                    const isActive = activeDaysSet.has(day);

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-center text-gray-400"
                      >
                        <span className="text-sm mb-1">{dayOfWeek}</span>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive
                            ? "bg-gradient-to-r from-purple-700 to-purple-400 text-purple-400"
                            : "bg-gray-500"
                            }`}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
            <div className="col-span-3">
            <Card className=" shadow-sm">
              <ScrollArea className="h-[28rem]">
                <CardHeader className="sticky top-0 bg-background z-10 pb-2 px-6">
                  <div className="flex justify-between items-center">
                    <CardTitle>Multi-Channel Campaign</CardTitle>
                    {!shouldLoadAnalytics && (
                      <Button
                        onClick={() => setShouldLoadAnalytics(true)}
                        className="bg-gradient-to-r from-primary to-primary/90 text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
                      >
                        Load Analytics
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-4 pt-0">
                  <div className="relative w-full h-full">
                    {!shouldLoadAnalytics ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <p className="text-muted-foreground text-sm">Load analytics data to view campaign performance</p>
                      </div>
                    ) : (
                      <TopPerformingCampaignsTable
                        campaigns={analyticsData?.map(campaign => ({
                          campaign_id: campaign.campaign_id,
                          sent_count: campaign.sent_count,
                          delivered_count: campaign.delivered_count,
                          clicked_count: campaign.clicked_count,
                          spam_count: campaign.spam_count,
                          bounced_count: campaign.bounced_count,
                          user_id: campaign.user_id,
                          open_count: campaign.open_count,
                          campaign_name: campaign.campaign_name,
                          responded: campaign.responded,
                          engaged_leads: 0,
                          response_rate: (campaign.responded / (campaign.delivered_count + campaign.bounced_count)) * 100,
                          bounce_rate: (campaign.bounced_count / (campaign.delivered_count + campaign.bounced_count)) * 100,
                          open_rate: (campaign.open_count / (campaign.delivered_count + campaign.bounced_count)) * 100,
                          total_leads: campaign.total_leads
                        }))}
                        isLoading={isAnalyticsLoading}
                      />
                    )}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
