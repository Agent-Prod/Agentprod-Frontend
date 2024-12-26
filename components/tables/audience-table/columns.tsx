"use client";
import { ColumnDef } from "@tanstack/react-table";
import { NameAction } from "./name-action";
import { Lead } from "@/context/lead-user";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const DeleteAction = ({
  leadId,
  onDelete,
}: {
  leadId: string;
  onDelete: (id: string) => void;
}) => {
  return (
    <Button
      variant="ghost"
      onClick={() => onDelete(leadId)}
      className="p-2 rounded-xl"
    >
      <Trash className="h-4 w-4" />
    </Button>
  );
};

const DEFAULT_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+";

export const leadColumns: ColumnDef<Lead>[] = [
  {
    accessorKey: "photo_url",
    header: "AVATAR",
    cell: ({ row }) => (
      <Image
        src={row.original.photo_url ?? DEFAULT_AVATAR}
        alt={`Avatar for ${row.original.name}`}
        width={40}
        height={40}
        style={{ borderRadius: "50%" }}
      />
    ),
  },
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => <NameAction data={row.original} />,
  },
  {
    accessorKey: "title",
    header: "ROLE",
  },
  {
    accessorFn: (row) =>
      row.employment_history?.[0]?.organization_name ?? row.company,
    header: "COMPANY",
    cell: ({ row }) => {
      const companyName =
        row.original.employment_history?.[0]?.organization_name ??
        row.original.company;
      return <span>{companyName}</span>;
    },
  },
];

export const contactsColumn: ColumnDef<Lead>[] = [
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => (
      <div key={row.id} className="flex items-center gap-3">
        <Avatar className="h-6 w-6">
          <AvatarImage
            src={row.original.photo_url ?? row.original?.organization?.logo_url}
            alt={`Avatar for ${row.original.name}`}
          />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <NameAction data={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "ROLE",
    cell: ({ row }) => (
      <div className="truncate max-w-[200px]" title={row.original.title}>
        {row.original.title}
      </div>
    ),
  },
  {
    accessorFn: (row) =>
      row.employment_history?.[0]?.organization_name ?? row.company,
    header: "COMPANY",
    cell: ({ row }) => {
      const companyName =
        row.original.employment_history?.[0]?.organization_name ??
        row.original.company;
      return (
        <div className="truncate max-w-[200px]" title={companyName}>
          {companyName}
        </div>
      );
    },
  },
  {
    header: "WorkFlow Builder",
    accessorFn: (row) => row.sequence_count ?? 0,
    cell: ({ row }) => (
      <div className="text-muted-foreground flex items-center gap-[2px]">
        {[...Array(Math.min(Number(row.original.sequence_count) || 0, 15))].map((_, index) => (
          <div key={index} className="text-pink-500 text-sm font-bold">|</div>
        ))}
        {(Number(row.original.sequence_count) || 0) > 15 && (
          <span className="text-xs text-pink-500 ml-1">+{(Number(row.original.sequence_count) || 0) - 15}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "last_contacted",
    header: "LAST CONTACTED",
  },
];
export const selectContactsColumn: ColumnDef<Lead>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => <NameAction data={row.original} />,
  },
  {
    accessorKey: "title",
    header: "ROLE",
  },
  {
    accessorFn: (row) =>
      row.employment_history?.[0]?.organization_name ?? row.company,
    header: "COMPANY",
    cell: ({ row }) => {
      const companyName =
        row.original.employment_history?.[0]?.organization_name ??
        row.original.company;
      return <span>{companyName}</span>;
    },
  },
  {
    accessorKey: "last_replied",
    header: "RESPONDED",
  },
  {
    accessorKey: "last_contacted",
    header: "LAST CONTACTED",
  },
];
