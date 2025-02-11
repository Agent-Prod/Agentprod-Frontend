/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { AudienceTableClient } from "@/components/tables/audience-table/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/context/lead-user";
import { LucideUsers2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-provider";
import SubscriptionBanner from "@/components/subscription-banner";
import { useSubscription } from "@/context/subscription-provider";
const DEBOUNCE_DELAY = 300;

export default function Page() {
  const { setLeads } = useLeads();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null
  );
  const size = 10;
  const { isSubscribed, isLeadLimitReached } = useSubscription();

  const { user } = useAuth();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchLeads = useCallback(
    async (pageToFetch: number) => {
      if (!user?.id) return;

      setLoading(true);
      console.log(`Fetching page ${pageToFetch}`);
      try {
        const response = await axiosInstance.get(`v2/lead/all/`, {
          params: {
            page: pageToFetch,
            size,
            search_filter: searchFilter,
            campaign_id: selectedCampaignId,
          },
        });
        console.log("API Response:", response.data);
        setLeads(response.data.items);
        setTotalLeads(response.data.total);
        setTotalPages(Math.ceil(response.data.total / size));
      } catch (error) {
        console.error("Error fetching leads:", error);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    },
    [user, size, searchFilter, selectedCampaignId, setLeads]
  );

  const debouncedFetchLeads = useCallback(
    (pageToFetch: number) => {
      console.log(`Debounce triggered for page ${pageToFetch}`);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        console.log(
          `Executing fetchLeads after debounce for page ${pageToFetch}`
        );
        fetchLeads(pageToFetch);
      }, DEBOUNCE_DELAY);
    },
    [fetchLeads]
  );

  useEffect(() => {
    console.log(`Effect triggered. Current page: ${page}`);
    debouncedFetchLeads(page);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedFetchLeads, page, searchFilter, selectedCampaignId]);

  const handlePageChange = useCallback((newPage: number) => {
    console.log(`Changing to page ${newPage}`);
    setPage(newPage);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await axiosInstance.delete(`v2/lead/${id}`);
        toast.success("Lead deleted successfully");
        debouncedFetchLeads(page);
      } catch (error) {
        console.error("Error deleting lead:", error);
        toast.error("Failed to delete lead. Please try again.");
      }
    },
    [debouncedFetchLeads, page]
  );

  const handleSearch = useCallback((value: string) => {
    setSearchFilter(value);
    setPage(1);
  }, []);

  const handleCampaignSelect = useCallback((campaignId: string | null) => {
    setSelectedCampaignId(campaignId);
    setPage(1);
  }, []);

  if (loading && totalLeads === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center">
          <Skeleton className="w-full h-12 rounded-lg" />
        </div>
        <Separator />
        <Skeleton className="w-full h-[calc(100vh-10rem)] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(!isSubscribed && isLeadLimitReached) && (
        <SubscriptionBanner
          isSubscribed={isSubscribed ?? false}
          isLeadLimitReached={isLeadLimitReached ?? false}
          showOnlyLimitBanner={true}
        />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LucideUsers2 className="h-5 w-5" />
          <div>
            <h1 className="font-semibold text-lg">
              Leads <span className="text-muted-foreground">({totalLeads})</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              All leads found by Sally and uploaded by you.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <main>
        <AudienceTableClient
          isContacts={true}
          onDelete={handleDelete}
          onSearch={handleSearch}
          onCampaignSelect={handleCampaignSelect}
        />
      </main>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
