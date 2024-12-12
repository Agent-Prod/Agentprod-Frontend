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
import { Badge } from "@/components/ui/badge";


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
  const [localLoading, setLocalLoading] = useState(true);
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
      const recurringCampaigns = campaigns.filter(
        (campaign) => campaign.schedule_type === "recurring"
      );

      if (recurringCampaigns.length === 0) return;

      const campaignsToFetch = recurringCampaigns.filter(
        (campaign) => !recurringCampaignData.some(
          (data) => data.campaign_id === campaign.id
        )
      );

      if (campaignsToFetch.length === 0) return;

      const recurringDataPromises = campaignsToFetch.map(async (campaign) => {
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

      setRecurringCampaignData(prevData => [
        ...prevData,
        ...filteredResults
      ]);
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
      const response = await axiosInstance.put(
        `/v2/campaigns/pause/${campaignId}`
      );

      if (response.status === 200) {
        setCampaigns((currentCampaigns) =>
          currentCampaigns.map((campaign) =>
            campaign.id === campaignId
              ? { ...campaign, is_active: !isActive }
              : campaign
          )
        );

        toast.success(`${campaignName} has been ${isActive ? "paused" : "resumed"} successfully`);

        if (campaign?.schedule_type === "recurring") {
          const recurringResponse = await axiosInstance.get(
            `/v2/recurring_campaign_request/${campaignId}`
          );

          if (recurringResponse.data) {
            setRecurringCampaignData((prevData) =>
              prevData.map((item) =>
                item.campaign_id === campaignId
                  ? { ...item, is_active: recurringResponse.data.is_active }
                  : item
              )
            );
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
      setLocalLoading(true);
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
      } finally {
        setLocalLoading(false);
      }
    }
    fetchCampaigns();
    localStorage.removeItem("formsTracker");
  }, [setCampaigns, offset]);

  const handleLoadMore = () => {
    setOffset(prevOffset => prevOffset + LIMIT);
  };

  const displayedCampaigns = campaigns;

  const renderCampaignCard = (campaignItem: CampaignEntry) => (
    <Card key={campaignItem.id} className="transition-all duration-200 hover:shadow-lg hover:border-primary/20">
      <CardContent className="flex flex-col p-6 gap-4">
        <div className="flex justify-between items-center">
          <div className="relative h-12 w-24">
            <UKFlag className="absolute inset-0 z-10 h-9 w-9 transition-transform hover:scale-110" />
            <USAFlag className="absolute left-4 top-0 z-20 h-9 w-9 transition-transform hover:scale-110" />
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            Leads: {campaignItem?.contacts || 0}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${campaignItem?.is_active
              ? 'bg-green-500 animate-pulse'
              : 'bg-red-500'
              }`} />
            <span className="text-sm font-medium">
              {campaignItem?.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {campaignItem?.schedule_type === "recurring" &&
            recurringCampaignData.find(item => item.campaign_id === campaignItem.id)?.is_active === false && (
              <Badge
                variant="completed"
                className="px-2 py-1 text-xs font-medium flex items-center gap-1.5"
              >
                Completed
              </Badge>
            )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
            {campaignItem?.schedule_type === "recurring" ? "Recurring" : "One-time"}
          </Badge>
          <Badge
            variant="outline"
            className={campaignItem?.channel?.toLowerCase() === "linkedin"
              ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
              : "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300"
            }
          >
            {campaignItem?.channel?.toLowerCase() === "linkedin" ? (
              <div className="flex items-center gap-1">
                <Linkedin className="w-3 h-3" />
                LinkedIn
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <MailIcon className="w-3 h-3" />
                Email
              </div>
            )}
          </Badge>
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

        <div className="flex justify-between items-center mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Icons.circle className="h-4 w-4 text-primary" />
            <span className="text-sm">Replies: {campaignItem?.replies || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.star className="h-4 w-4 text-primary" />
            <span className="text-sm">Meetings: {campaignItem?.meetings_booked || 0}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-between items-center">
          <Switch
            checked={campaignItem?.is_active}
            onCheckedChange={() =>
              campaignItem.id !== undefined &&
              toggleCampaignIsActive(campaignItem.id, campaignItem.is_active)
            }
            className="flex-none"
          />

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
            <Link href={`/campaign/${campaignItem.id}`}>
              <Button variant={"ghost"}>
                <Icons.pen size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card className="bg-gradient-to-r from-accent to-accent/50 px-6 py-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Start Your Campaign</CardTitle>
            <p className="text-muted-foreground">Create and manage your campaigns efficiently</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Link href={`/campaign/${uuid()}`} className="flex items-center gap-2">
              <Plus size={16} /> Create Campaign
            </Link>
          </Button>
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {localLoading ? (
          <div className="flex space-x-5 mt-4 justify-center items-center w-[75rem]">
            <Skeleton className="h-[230px] w-[290px] rounded-xl" />
            <Skeleton className="h-[230px] w-[290px] rounded-xl" />
            <Skeleton className="h-[230px] w-[290px] rounded-xl" />
            <Skeleton className="h-[230px] w-[290px] rounded-xl" />
          </div>
        ) : displayedCampaigns.length > 0 ? (
          displayedCampaigns.map(renderCampaignCard)
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Image
              src="/emptyCampaign.svg"
              alt="No campaigns"
              width="300"
              height="300"
              className="dark:filter dark:invert mb-8"
            />
            <h3 className="text-xl font-semibold mb-2">No Campaigns Available</h3>
            <p className="text-muted-foreground mb-6">Create your first campaign to get started</p>
            <Button asChild>
              <Link href={`/campaign/${uuid()}`}>
                <Plus className="mr-2 h-4 w-4" /> Create Campaign
              </Link>
            </Button>
          </div>
        )}
      </div>

      {hasMore && !localLoading && campaigns.length > 0 && (
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
