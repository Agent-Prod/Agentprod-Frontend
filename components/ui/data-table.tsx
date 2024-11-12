/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { CampaignEntry, useCampaignContext } from "@/context/campaign-provider";
import axiosInstance from "@/utils/axiosInstance";
import { useUserContext } from "@/context/user-context";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  simple?: boolean;
  onDelete?: (id: string) => void;
  onSearch?: (value: string) => void;
  onCampaignSelect?: (campaignId: string | null) => void;
  onSelectionChange?: (selectedRows: TData[]) => void;
  selectedLeadIds?: Set<string>;
  currentPageData?: TData[];
  totalLeads?: number;
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  searchKey,
  simple,
  onDelete,
  onSearch,
  onCampaignSelect,
  onSelectionChange,
  selectedLeadIds = new Set(),
  currentPageData = [],
  totalLeads,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<{
    campaignName: string;
    campaignId: string;
  } | null>(null);
  // const { campaigns } = useCampaignContext();
  const [campaigns, setCampaigns] = useState<CampaignEntry[]>([]);
  // Initialize row selection state based on selectedLeadIds
  const rowSelection = React.useMemo(() => {
    const selection: RowSelectionState = {};
    data.forEach((item, index) => {
      if (selectedLeadIds.has(item.id)) {
        selection[index] = true;
      }
    });
    return selection;
  }, [data, selectedLeadIds]);

  const { user } = useUserContext();

  useEffect(() => {
    const fetchCampaigns = async () => {
      const campaigns = await axiosInstance.get(`v2/campaigns/names/${user.id}`);
      setCampaigns(campaigns.data.campaigns);
    };
    fetchCampaigns();
  }, []);

  const handleRowSelectionChange = useCallback(
    (updaterOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      let newSelection: RowSelectionState;
      
      if (typeof updaterOrValue === 'function') {
        newSelection = updaterOrValue(rowSelection);
      } else {
        newSelection = updaterOrValue;
      }

      // Get all currently visible rows
      const visibleRows = table.getRowModel().rows;
      const selectedRows = visibleRows
        .filter((row, index) => newSelection[index])
        .map(row => row.original);

      if (onSelectionChange) {
        onSelectionChange(selectedRows);
      }
    },
    [onSelectionChange]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: handleRowSelectionChange,
    state: {
      globalFilter,
      rowSelection,
    },
    enableRowSelection: !simple,
    enableMultiRowSelection: !simple,
  });

  useEffect(() => {
    if (table.getPageCount() > 0) {
      table.setPageSize(10);
    }
  }, [table]);

  useEffect(() => {
    if (onSearch) {
      onSearch(globalFilter);
    }
  }, [globalFilter, onSearch]);

  const rows = table.getRowModel().rows;

  const allCampaigns = campaigns.map((campaign) => ({
    campaignName: campaign.campaign_name,
    campaignId: campaign.id,
    additionalInfo: campaign.additional_details,
  }));

  const handleCampaignSelect = (
    campaign: { campaignName: string; campaignId: string } | null
  ) => {
    setSelectedCampaign(campaign);
    if (onCampaignSelect) {
      onCampaignSelect(campaign ? campaign.campaignId : null);
    }
  };

  return (
    <>
      <div className="flex space-x-5 items-center">
        <Input
          placeholder={`Search ${searchKey}...`}
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="w-full md:max-w-sm my-3"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <span>
                {selectedCampaign
                  ? selectedCampaign.campaignName
                  : "Select Campaign"}
              </span>
              <ChevronDown size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleCampaignSelect(null)}>
                <p className="cursor-pointer">All Campaigns</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[400px] w-full rounded-md border p-2">
                {allCampaigns?.map((campaignItem) => (
                  <DropdownMenuItem
                    key={campaignItem.campaignId}
                    onClick={() => handleCampaignSelect(campaignItem)}
                  >
                    <p className="cursor-pointer">
                      {campaignItem.campaignName}{" "}
                      {campaignItem.additionalInfo &&
                        `- ${campaignItem.additionalInfo}`}
                    </p>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="rounded-md border h-[50vh]">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {!simple && rows.length > 0 && (
        <div className="flex-1 text-sm text-muted-foreground pt-4">
          {selectedLeadIds.size} of{" "}
          {totalLeads} row(s) selected.
        </div>
      )}
    </>
  );
}