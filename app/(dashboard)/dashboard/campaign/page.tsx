/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { MailIcon, Plus } from "lucide-react";
import Link from "next/link";
import { useCampaignContext } from "@/context/campaign-provider";
import { Icons } from "@/components/icons";
import "react-circular-progressbar/dist/styles.css";
import { UKFlag, USAFlag } from "@/app/icons";
import { useUserContext } from "@/context/user-context";
import { v4 as uuid } from "uuid";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import Image from "next/image";
import { Linkedin } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";


interface CampaignEntry {
  user_id: string;
  campaignId?: string;
  campaign_name: string;
  is_active: boolean;
  campaign_type: string;
  daily_outreach_number?: number;
  start_date?: string;
  end_date?: string;
  selected?: boolean;
  schedule_type: string;
  description?: string;
  additional_details?: string;
  monday_start?: string;
  monday_end?: string;
  tuesday_start?: string;
  tuesday_end?: string;
  wednesday_start?: string;
  wednesday_end?: string;
  thursday_start?: string;
  thursday_end?: string;
  friday_start?: string;
  friday_end?: string;
  id: string;
  contacts?: number;
  channel?: string;
  offering_details?: string[] | string;
  replies?: number;
  meetings_booked?: number;
}

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function CampaignPage() {
  const { campaigns, deleteCampaign, isLoading, setCampaigns } =
    useCampaignContext();
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [recurringCampaignData, setRecurringCampaignData] = useState<any[]>([]);
  const { user } = useUserContext();
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  const BulkActions = () => {
    if (selectedCampaigns.size === 0) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4 flex gap-2 items-center">
        <span className="text-sm text-muted-foreground">
          {selectedCampaigns.size} selected
        </span>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete Selected
        </Button>
      </div>
    );
  };

  useEffect(() => {
    async function fetchRecurringCampaignData() {
      const recurringDataPromises = campaigns
        .filter((campaign) => campaign.schedule_type === "recurring")
        .map(async (campaign) => {
          try {
            const response = await axiosInstance.get(
              `/v2/recurring_campaign_request/${campaign.id}`
            );
            return {
              campaign_id: campaign.id,
              is_active: response.data.is_active,
            };
          } catch (error) {
            console.error(
              `Failed to fetch recurring data for campaign ${campaign.id}`,
              error
            );
            return null;
          }
        });

      const results = await Promise.all(recurringDataPromises);
      const filteredResults = results.filter((result) => result !== null);
      setRecurringCampaignData(filteredResults);
    }

    if (campaigns.length > 0) {
      fetchRecurringCampaignData();
    }
  }, [campaigns]);

  const toggleCampaignIsActive = async (
    campaignId: string,
    isActive: boolean
  ) => {
    const campaign = campaigns.find((campaign) => campaign.id === campaignId);
    const campaignName = campaign ? campaign.campaign_name : "Unknown Campaign";
    try {
      if (campaign?.schedule_type === "recurring") {
        const response = await axiosInstance.put(
          "https://backend.agentprod.com/v2/recurring_campaign_request",
          {
            campaign_id: campaignId,
            is_active: !isActive,
          }
        );
        if (response.status === 200) {
          setRecurringCampaignData((prevData) =>
            prevData.map((item) =>
              item.campaign_id === campaignId
                ? { ...item, is_active: !isActive }
                : item
            )
          );
          toast.success(
            `${campaignName} has been ${!isActive ? "resumed" : "paused"
            } successfully`
          );
        }
      } else {
        if (isActive) {
          const response = await axiosInstance.put(
            `/v2/campaigns/pause/${campaignId}`
          );
          if (response.status === 200) {
            setCampaigns((currentCampaigns) =>
              currentCampaigns.map((campaign) =>
                campaign.id === campaignId
                  ? { ...campaign, is_active: false }
                  : campaign
              )
            );
            toast.success(`${campaignName} has been paused successfully`);
          }
        } else {
          const response = await axiosInstance.put(
            `/v2/campaigns/pause/${campaignId}`
          );
          if (response.status === 200) {
            setCampaigns((currentCampaigns) =>
              currentCampaigns.map((campaign) =>
                campaign.id === campaignId
                  ? { ...campaign, is_active: true }
                  : campaign
              )
            );
            toast.success(`${campaignName} has been resumed successfully`);
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle campaign activity status", error);
      toast.error(`Failed to update ${campaignName}`);
    }
  };

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await axiosInstance.get(
          `v2/campaigns/all/${user.id}?limit=${LIMIT}&offset=${offset}`
        );

        const newCampaigns = response.data.campaigns;
        const total = response.data.total;

        setCampaigns(prevCampaigns =>
          offset === 0 ? newCampaigns : [...prevCampaigns, ...newCampaigns]
        );

        setHasMore(offset + LIMIT < total);

      } catch (error) {
        console.error("Failed to fetch campaigns", error);
      }
    }
    fetchCampaigns();
    localStorage.removeItem("formsTracker");
  }, [setCampaigns, user.id, offset]);

  const handleLoadMore = () => {
    setOffset(prevOffset => prevOffset + LIMIT);
  };

  const displayedCampaigns = campaigns;

  const renderCampaignCard = (campaignItem: CampaignEntry) => (
    <Card key={campaignItem.id}>
      <CardContent className="flex flex-col items-left p-4 gap-4">
        <div className="flex justify-between items-center">
          <div className="relative h-12 w-24 pt-2">
            <UKFlag className="absolute inset-0 z-10 h-9 w-9" />
            <USAFlag className="absolute left-4 top-0 z-10 h-9 w-9" />
          </div>
          <div className="flex gap-4 items-center">
            <p className="text-sm text-muted-foreground">
              Leads = {campaignItem?.contacts || 0}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs dark:text-white/80 text-black -space-y-4 bg-green-400/80 dark:bg-green-400/20 w-max px-4 py-1 rounded-3xl">
            {campaignItem?.campaign_type || "Unknown Type"}
          </div>
          <div className={`text-xs flex items-center gap-1 dark:text-white/80 text-black ${campaignItem?.channel?.toLowerCase() === "linkedin"
            ? "bg-blue-400/80 dark:bg-blue-400/20"
            : "bg-purple-400/80 dark:bg-purple-400/20"
            } w-max px-4 py-1 rounded-3xl`}>
            {campaignItem?.channel?.toLowerCase() === "linkedin" ? (
              <>
                LinkedIn
                <Linkedin className="w-3 h-3" />
              </>
            ) : (
              <>
                Email
                <MailIcon className="w-3 h-3" />
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-medium leading-none truncate w-full max-w-72">
                  {campaignItem?.campaign_name || "Untitled Campaign"}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm font-medium leading-none">
                  {campaignItem?.campaign_name || "Untitled Campaign"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-sm text-muted-foreground truncate">
            {typeof campaignItem?.offering_details === 'string'
              ? campaignItem.offering_details.split('\n')[0]
              : Array.isArray(campaignItem?.offering_details)
                ? campaignItem.offering_details[0]
                : "No details available"}
          </p>
        </div>

        <div className="flex space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Icons.circle className="mr-1 h-3 w-3" />
            Replies: {campaignItem?.replies || 0}
          </div>
          <div className="flex items-center">
            <Icons.star className="mr-1 h-3 w-3" />
            Meetings: {campaignItem?.meetings_booked || 0}
          </div>
        </div>

        <div className="flex gap-4 justify-between items-center">
          {campaignItem?.schedule_type === "recurring" ? (
            <Switch
              checked={
                recurringCampaignData.find(
                  (item) => item.campaign_id === campaignItem.id
                )?.is_active || false
              }
              onCheckedChange={() =>
                campaignItem.id !== undefined &&
                toggleCampaignIsActive(
                  campaignItem.id,
                  recurringCampaignData.find(
                    (item) => item.campaign_id === campaignItem.id
                  )?.is_active
                )
              }
              className="flex-none"
            />
          ) : (
            <Switch
              checked={campaignItem?.is_active}
              onCheckedChange={() =>
                campaignItem.id !== undefined &&
                toggleCampaignIsActive(campaignItem.id, campaignItem.is_active)
              }
              className="flex-none"
            />
          )}

          <div>
            <Button
              variant="ghost"
              onClick={() => {
                setCampaignToDelete(campaignItem.id);
                setShowDeleteDialog(true);
              }}
            >
              <Icons.trash2 size={16} />
            </Button>
            <Button variant={"ghost"}>
              <Link href={`/dashboard/campaign/${campaignItem.id}`}>
                <Icons.pen size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-2 mb-5">
      <Card className="bg-accent px-4 py-6">
        <CardTitle>Send Your Email Campaign</CardTitle>
        <Button className="mt-4">
          <Link
            href={`/dashboard/campaign/${uuid()}`}
            className="flex items-center gap-1"
          >
            <Plus size={16} /> Create Campaign
          </Link>
        </Button>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedCampaigns.size === displayedCampaigns.length}
            onCheckedChange={(checked) => {
              const newSelected = new Set<string>();
              if (checked) {
                displayedCampaigns.forEach((campaign) => newSelected.add(campaign.id));
              }
              setSelectedCampaigns(newSelected);
            }}
          />
          <span className="text-sm text-muted-foreground">Select All</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {!isLoading ? (
          displayedCampaigns.length > 0 ? (
            displayedCampaigns.map(renderCampaignCard)
          ) : (
            <div className="flex flex-col w-[75rem] items-center justify-center">
              <Image
                src="/emptyCampaign.svg"
                alt="empty-campaign"
                width="300"
                height="300"
                className="dark:filter dark:invert mt-16"
              />
              <p className="flex justify-center items-center mt-10 ml-14 text-gray-500">
                No Campaigns Available
              </p>
            </div>
          )
        ) : (
          <div className="flex space-x-5 mt-4 justify-center items-center w-[75rem]">
            <Skeleton className="h-[230px] w-[290px] rounded-xl" />
            <Skeleton className="h-[230px] w-[290px] rounded-xl" />
            <Skeleton className="h-[230px] w-[290px] rounded-xl" />
            <Skeleton className="h-[230px] w-[290px] rounded-xl" />
          </div>
        )}
      </div>

      {hasMore && !isLoading && campaigns.length > 0 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="w-full max-w-xs"
          >
            Show More
          </Button>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setCampaignToDelete(null);
        }}
        onConfirm={async () => {
          if (campaignToDelete) {
            await deleteCampaign(campaignToDelete);
          } else {
            // Bulk delete
            const deletePromises = Array.from(selectedCampaigns).map(deleteCampaign);
            await Promise.all(deletePromises);
            setSelectedCampaigns(new Set());
          }
          setShowDeleteDialog(false);
          setCampaignToDelete(null);
        }}
        title={campaignToDelete ? "Delete Campaign" : "Delete Selected Campaigns"}
        description={
          campaignToDelete
            ? "Are you sure you want to delete this campaign?"
            : `Are you sure you want to delete ${selectedCampaigns.size} campaigns?`
        }
      />

      <BulkActions />
    </div>
  );
}
