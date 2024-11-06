"use client";
import React, { useState, useEffect } from "react";
import { LineChartComponent } from "@/components/charts/line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LoadingCircle } from "@/app/icons";
import Cookies from "js-cookie";
import axios from "axios";

interface DashboardData {
  emails_sent: number;
  engaged: number;
  meetings_booked: number;
  response_rate: number;
  conversion_funnel: {
    sent: number;
    opened: number;
    cta_clicked: number;
    goal: number;
    'goal/click': number;
    'goal/subscription': number;
  };
  hot_leads: Array<{
    name: string;
    photo_url?: string;
    fallback?: string;
  }>;
  mailbox_health: Record<string, number>;
  top_performing_campaigns: Array<{
    campaign_name: string;
    engaged_leads: number;
    response_rate: number;
    bounce_rate: number | null;
    open_rate: number | null;
  }>;
  email_stats: {
    deliverability_rate: number;
    open_rate: number;
    reply_rate: number;
    positive_email_rate: number;
    negative_email_rate: number;
    conversion_rate: number;
    unsubscribed_rate: number;
  };
}

interface MailGraphData {
  date: string;
  emails: number;
  new_emails: number;
}

export default function Page() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({} as DashboardData);
  const [mailGraphData, setMailGraphData] = useState<MailGraphData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('Authorization');
        if (!token) {
          setError("No authorization token found");
          return;
        }

        const [dashboardResponse, mailGraphResponse] = await Promise.all([
          axios.get<DashboardData>(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/dashboard`,
            {
              headers: { 'Authorization': `Bearer ${token}` },
              withCredentials: true
            }
          ),
          axios.get<MailGraphData[]>(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/mailgraph`,
            {
              headers: { 'Authorization': `Bearer ${token}` },
              withCredentials: true
            }
          )
        ]);

        setDashboardData(dashboardResponse.data);
        setMailGraphData(mailGraphResponse.data);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPercentage = (current: number, previous: number): string => {
    return previous > 0 ? ((current / previous) * 100).toFixed(2) + "%" : "0%";
  };

  const outreachToOpenRate = getPercentage(
    dashboardData?.conversion_funnel?.opened || 0,
    dashboardData?.conversion_funnel?.sent || 0
  );
  const openToCTAClickRate = getPercentage(
    dashboardData?.conversion_funnel?.cta_clicked || 0,
    dashboardData?.conversion_funnel?.opened || 0
  );
  const ctaClickToGoalRate = getPercentage(
    dashboardData?.conversion_funnel?.goal || 0,
    dashboardData?.conversion_funnel?.cta_clicked || 0
  );

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/2">
                <CardTitle className="text-sm font-medium">
                  Total Emails Sent
                </CardTitle>
              </CardHeader>
              <CardContent className="h-1/2 md:mt-2">
                <div className="text-2xl font-bold">
                  {dashboardData?.emails_sent || "0"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/2">
                <CardTitle className="text-sm font-medium">
                  Engaged Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="h-1/2 md:mt-2">
                <div className="text-2xl font-bold">
                  {dashboardData?.engaged || "0"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/2">
                <CardTitle className="text-sm font-medium">
                  Total Meetings Booked (Via Calendly)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-1/2 md:mt-2">
                <div className="text-2xl font-bold">
                  {dashboardData?.meetings_booked || "0"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/2">
                <CardTitle className="text-sm font-medium">
                  Response Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="h-1/2 md:mt-2">
                <div className="text-2xl font-bold">
                  {Math.round(dashboardData?.response_rate) || "0"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/2">
                <CardTitle className="text-sm font-medium">
                  Cost Per Click
                </CardTitle>
              </CardHeader>
              <CardContent className="h-1/2 md:mt-2">
                <div className="text-2xl font-bold">
                  {dashboardData?.conversion_funnel?.["goal/click"] !==
                  undefined
                    ? Number(
                        dashboardData.conversion_funnel["goal/click"]
                      ).toFixed(2)
                    : "0.00"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/2">
                <CardTitle className="text-sm font-medium">
                  Cost Per Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="h-1/2 md:mt-2">
                <div className="text-2xl font-bold">
                  {dashboardData?.conversion_funnel?.["goal/subscription"] !==
                  undefined
                    ? Number(
                        dashboardData.conversion_funnel["goal/subscription"]
                      ).toFixed(2)
                    : "0.00"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-2">
            <ScrollArea className="h-[20rem]">
              <CardHeader>
                <CardTitle>Hot Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center">
                      <LoadingCircle />
                    </div>
                  ) : dashboardData?.hot_leads?.length > 0 ? (
                    dashboardData?.hot_leads?.map((lead: any) => (
                      <div key={lead.name} className="flex items-center">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={lead.photo_url} alt="Avatar" />
                          <AvatarFallback>
                            {lead.fallback || lead.name.charAt(0)}
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
            <ScrollArea className="h-[20rem]">
              <CardHeader>
                <CardTitle>Mailbox Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <LoadingCircle />
                  </div>
                ) : dashboardData &&
                  Object.keys(dashboardData.mailbox_health).length > 0 ? (
                  Object.entries(dashboardData.mailbox_health).map(
                    ([email, health], index) => (
                      <div key={index}>
                        <p className="text-sm">
                          {email} - {health}%
                        </p>
                        <Progress value={health} className="h-5 mt-2" />
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center">
                    No mailbox health data available.
                  </div>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NAME</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        ENGAGED LEADS
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        RESPONSE RATE
                      </TableHead>
                      <TableHead className="text-right">BOUNCE RATE</TableHead>
                      <TableHead className="text-right">OPEN RATE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          <LoadingCircle />
                        </TableCell>
                      </TableRow>
                    ) : dashboardData?.top_performing_campaigns.length > 0 ? (
                      dashboardData.top_performing_campaigns.map(
                        (campaign, index) => (
                          <TableRow key={index}>
                            <TableCell>{campaign.campaign_name}</TableCell>
                            <TableCell className="hidden sm:table-cell text-center">
                              {Math.round(campaign.engaged_leads)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-center">
                              {Math.round(campaign.response_rate)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-center">
                              {campaign.bounce_rate === null
                                ? "0%"
                                : `${Math.round(campaign.bounce_rate)}%`}
                            </TableCell>
                            <TableCell className="text-center">
                              {campaign.open_rate === null
                                ? "0%"
                                : `${Math.round(campaign.open_rate)}%`}
                            </TableCell>
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No top performing campaigns available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </ScrollArea>
          </Card>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center flex-col gap-24">
                <div className="transform rotate-[-90deg] mt-20 w-full">
                  <Progress
                    value={
                      dashboardData.conversion_funnel?.sent < 100
                        ? dashboardData.conversion_funnel?.sent
                        : dashboardData.conversion_funnel?.sent > 100
                        ? 100
                        : 0
                    }
                    className="h-2 w-40"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">
                    {dashboardData.conversion_funnel?.sent || 0}
                  </p>
                  <p className="text-xs text-gray-500">Outreach</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p>{outreachToOpenRate}</p>
                <Icons.arrowRight size={20} />
              </div>

              <div className="flex items-center flex-col gap-24">
                <div className="transform rotate-[-90deg] mt-20 w-full">
                  <Progress
                    value={
                      dashboardData.conversion_funnel?.opened < 100
                        ? dashboardData.conversion_funnel?.opened
                        : dashboardData.conversion_funnel?.opened > 100
                        ? 100
                        : 0
                    }
                    className="h-2 w-40"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">
                    {dashboardData.conversion_funnel?.opened || 0}
                  </p>
                  <p className="text-xs text-gray-500">Open</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p>{openToCTAClickRate}</p>
                <Icons.arrowRight size={20} />
              </div>

              <div className="flex items-center flex-col gap-24">
                <div className="transform rotate-[-90deg] mt-20 w-full">
                  <Progress
                    value={
                      dashboardData.conversion_funnel?.cta_clicked < 100
                        ? dashboardData.conversion_funnel?.cta_clicked
                        : dashboardData.conversion_funnel?.cta_clicked > 100
                        ? 100
                        : 0
                    }
                    className="h-2 w-40"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">
                    {dashboardData.conversion_funnel?.cta_clicked || 0}
                  </p>
                  <p className="text-xs text-gray-500">Reply</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p>{ctaClickToGoalRate}</p>
                <Icons.arrowRight size={20} />
              </div>

              <div className="flex items-center flex-col gap-24">
                <div className="transform rotate-[-90deg] mt-20 w-full">
                  <Progress
                    value={
                      dashboardData.conversion_funnel?.goal < 100
                        ? dashboardData.conversion_funnel?.goal
                        : dashboardData.conversion_funnel?.goal > 100
                        ? 100
                        : 0
                    }
                    className="h-2 w-40"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">
                    {dashboardData.conversion_funnel?.goal || 0}
                  </p>
                  <p className="text-xs text-gray-500">Demo scenario</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <ScrollArea className="h-[18.5rem]">
              <CardHeader className="px-7">
                <CardTitle>Email Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          <LoadingCircle />
                        </TableCell>
                      </TableRow>
                    ) : dashboardData?.email_stats ? (
                      <>
                        <TableRow>
                          <TableCell>Deliverability Rate</TableCell>
                          <TableCell className="text-right">
                            {Math.round(
                              dashboardData.email_stats.deliverability_rate
                            )}
                            %
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Open Rate</TableCell>
                          <TableCell className="text-right">
                            {Math.round(dashboardData.email_stats.open_rate)}%
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Reply Rate</TableCell>
                          <TableCell className="text-right">
                            {Math.round(dashboardData.email_stats.reply_rate)}%
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Positive Reply Rate</TableCell>
                          <TableCell className="text-right">
                            {Math.round(
                              dashboardData.email_stats.positive_email_rate
                            )}
                            %
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Negative Reply Rate</TableCell>
                          <TableCell className="text-right">
                            {Math.round(
                              dashboardData.email_stats.negative_email_rate
                            )}
                            %
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Conversion Rate</TableCell>
                          <TableCell className="text-right">
                            {Math.round(
                              dashboardData.email_stats.conversion_rate
                            )}
                            %
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Unsubscribe Rate</TableCell>
                          <TableCell className="text-right">
                            {Math.round(
                              dashboardData.email_stats.unsubscribed_rate
                            )}
                            %
                          </TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          No email statistics available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
