"use client";

import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import {
  leadColumns,
  contactsColumn,
  selectContactsColumn,
  DeleteAction,
} from "./columns";
import { Lead, Contact, useLeads } from "@/context/lead-user";
import { ColumnDef } from "@tanstack/react-table";

interface AudienceTableClientProps {
  isContacts?: boolean;
  checkboxes?: boolean;
  onDelete?: (id: string) => void;
  onSearch?: (value: string) => void;
  onCampaignSelect?: (campaignId: string | null) => void;
  onSelectionChange?: (selectedRows: any) => void;
  selectedLeadIds?: any;
  currentPageData?: any;
  totalLeads?: number;
}

export const AudienceTableClient: React.FC<AudienceTableClientProps> = ({
  isContacts = true,
  checkboxes = false,
  onDelete,
  onSearch,
  onCampaignSelect,
  onSelectionChange,
  selectedLeadIds,
  currentPageData,
  totalLeads,
}) => {
  const { leads } = useLeads();

  const addDeleteColumn = (columns: ColumnDef<Lead, any>[]) => {
    if (onDelete) {
      return [
        ...columns,
        {
          id: "actions",
          cell: ({ row }: { row: any }) => (
            <DeleteAction leadId={row.original.id} onDelete={onDelete} />
          ),
        },
      ];
    }
    return columns;
  };

  if (isContacts) {
    const contactColumns = checkboxes ? selectContactsColumn : contactsColumn;
    const columnsWithOptionalDelete = addDeleteColumn(contactColumns);
    return (
      <div className="space-y-4">
        <Separator className="my-1" />
        <DataTable<Lead, Contact>
          searchKey="name"
          columns={columnsWithOptionalDelete}
          data={leads as Lead[]}
          simple={!checkboxes}
          onDelete={onDelete}
          onSearch={onSearch}
          onCampaignSelect={onCampaignSelect}
          onSelectionChange={onSelectionChange}
          selectedLeadIds={selectedLeadIds}
          currentPageData={currentPageData}
          totalLeads={totalLeads}
        />
      </div>
    );
  } else {
    const leadColumnsWithOptionalDelete = addDeleteColumn(leadColumns);
    return (
      <div className="space-y-2">
        <Separator className="my-1" />
        <DataTable<Lead, Contact>
          searchKey="name"
          columns={leadColumnsWithOptionalDelete}
          data={leads as Lead[]}
          simple={true}
          onDelete={onDelete}
          onSearch={onSearch}
          onCampaignSelect={onCampaignSelect}
          onSelectionChange={onSelectionChange}
        />
      </div>
    );
  }
};
