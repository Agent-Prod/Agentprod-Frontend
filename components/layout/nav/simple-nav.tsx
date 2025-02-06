"use client";

import { NavItem } from "@/types";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";

export default function SimpleNav({ nav }: { nav: NavItem }) {
  const Icon = Icons[nav.icon || "arrowRight"];
  const path = usePathname();

  const navContent = React.useMemo(() => (
    <Link
      href={nav.href || "/"}
      className="no-underline hover:no-underline text-inherit"
      id={nav.id}
    >
      <span
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
          path === nav.href
            ? "bg-primary text-accent hover:bg-primary hover:text-accent"
            : "text-foreground",
          nav.disabled && "cursor-not-allowed opacity-80"
        )}

      >
        <Icon className="mr-2 h-4 w-4" />
        <span>{nav.title}</span>
      </span>
    </Link>
  ), [nav.href, nav.title, path]);

  return navContent;
}
