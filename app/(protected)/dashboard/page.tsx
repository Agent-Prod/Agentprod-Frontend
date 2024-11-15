/* eslint-disable no-console */
"use client";
import React, { memo, useCallback } from "react";
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

interface TopPerformingCampaignsTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

const TopPerformingCampaignsTable = memo(({ campaigns, isLoading }: TopPerformingCampaignsTableProps) => {
  const renderCampaignRow = useCallback((campaign: Campaign) => (
    <TableRow key={campaign.campaign_name}>
      <TableCell>{campaign.campaign_name}</TableCell>
      <TableCell className="hidden sm:table-cell text-center">
        {Math.round(campaign.engaged_leads)}
      </TableCell>
      <TableCell className="hidden sm:table-cell text-center">
        {Math.round(campaign.response_rate)}
      </TableCell>
      <TableCell className="text-center">
        {campaign.bounce_rate === null ? "0%" : `${Math.round(campaign.bounce_rate)}%`}
      </TableCell>
      <TableCell className="text-center">
        {campaign.open_rate === null ? "0%" : `${Math.round(campaign.open_rate)}%`}
      </TableCell>
    </TableRow>
  ), []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign Name</TableHead>
          <TableHead className="hidden sm:table-cell text-center">Engaged Leads</TableHead>
          <TableHead className="hidden sm:table-cell text-center">Response Rate</TableHead>
          <TableHead className="text-center">Bounce Rate</TableHead>
          <TableHead className="text-center">Open Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
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
          <Progress value={health} className="h-5" />
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
      value: dashboardData?.emails_sent ?? 0
    },
    {
      title: "Engaged Leads",
      value: dashboardData?.engaged ?? 0
    },
    {
      title: "Total Meetings Booked",
      value: dashboardData?.meetings_booked ?? 0
    },
    {
      title: "Response Rate",
      value: dashboardData?.response_rate ? Math.round(dashboardData.response_rate) : 0
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 mt-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-1/2 md:mt-2">
            <div className="text-2xl font-bold">
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
  const { dashboardData, isLoading } = useDashboardContext();
  const { mailGraphData } = useMailGraphContext();

  const recentActivities: any[] = [];

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

  return (
    <>
      <DashboardPageHeader />
      <ScrollArea className="h-full scroll-my-36">
        <div className="flex-1 space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
            <div className="flex flex-col col-span-4">
              <Card>
                <CardContent className="flex items-center gap-5 pt-6">
                  <div className="flex items-center gap-2">
                    <Icons.mail />
                    <p className="font-medium">Emails Pending Approval</p>
                  </div>
                  <Badge variant={"secondary"}>
                    {dashboardData?.pending_approvals || 0}
                  </Badge>
                </CardContent>
              </Card>

              <DashboardMetrics dashboardData={dashboardData} isLoading={isLoading} />
            </div>

            <Card className="col-span-2">
              <ScrollArea className="lg:h-56 md:h-[26rem]">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src="/path/to/default/avatar.png"
                            alt="Avatar"
                          />
                          <AvatarFallback>
                            {activity.client.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {activity.client}
                            <span className="text-muted-foreground">
                              {" "}
                              {activity.body}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(), "PPpp")}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No recent activities</p>
                  )}
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
                <LineChartComponent mailGraphData={mailGraphData} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <ScrollArea className="h-[26rem]">
                <CardHeader className="px-7">
                  <CardTitle>Top Performing Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <TopPerformingCampaignsTable
                      campaigns={dashboardData?.top_performing_campaigns}
                      isLoading={isLoading}
                    />
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>

            <Card className="col-span-2">
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
                      dashboardData.hot_leads.map((lead) => (
                        <div key={lead.name} className="flex items-center">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={lead.photo_url} alt="Avatar" />
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

            <Card className="col-span-2">
              <ScrollArea className="lg:h-56 md:h-[26rem]">
                <CardHeader>
                  <CardTitle>Mailbox Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <MailboxHealth healthData={dashboardData?.mailbox_health} isLoading={isLoading} />
                </CardContent>
              </ScrollArea>
            </Card>

            <Card className="col-span-2 p-4 space-y-16">
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
        </div>
      </ScrollArea>
    </>
  );
}
