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
import { useUserContext } from "@/context/user-context";
import { toast } from "sonner";

const DEBOUNCE_DELAY = 300; // milliseconds

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

  const { user } = useUserContext();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchLeads = useCallback(
    async (pageToFetch: number) => {
      if (!user?.id) return;

      setLoading(true);
      console.log(`Fetching page ${pageToFetch}`);
      try {
        const response = await axiosInstance.get(`v2/lead/all/${user.id}`, {
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
      <>
        <div className="flex gap-8">
          <div className="flex gap-2">
            <div>
              <Skeleton className="w-[76rem] h-[50px] rounded-lg" />
            </div>
          </div>
        </div>
        <Separator className="mt-2" />
        <main className="mt-2">
          <Skeleton className="w-[76rem] h-[30rem] rounded-lg" />
        </main>
      </>
    );
  }

  return (
    <>
      <div className="flex gap-8">
        <div className="flex gap-2">
          <div>
            <div className="flex gap-2 font-bold">
              <span>
                <LucideUsers2 />
              </span>
              Leads({totalLeads})
            </div>
            <div className="text-muted-foreground text-xs">
              All leads found by Sally and uploaded by you.
            </div>
          </div>
        </div>
      </div>
      <main>
        <AudienceTableClient
          isContacts={true}
          onDelete={handleDelete}
          onSearch={handleSearch}
          onCampaignSelect={handleCampaignSelect}
        />
      </main>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
