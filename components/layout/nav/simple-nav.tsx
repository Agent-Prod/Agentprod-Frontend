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

  return (
    <div key={nav.label}>
      <Link
        href={nav.href || "/"}
        className="no-underline hover:no-underline text-inherit"
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
          <span className="flex items-center">
            {nav.title}
            {nav.beta && (
              <span className="ml-2 rounded-full px-2 py-1 text-xs font-semibold text-white/70 border-white/80 border">
                Beta
              </span>
            )}
          </span>
          {nav.isCollapsible && (
            <ChevronsUpDown className="h-4 w-4 ml-auto text-muted-foreground" />
          )}
        </span>
      </Link>

      <div className="bg-accent rounded-b-md">
        {path.includes(nav.href!) && nav.isCollapsible
          ? nav.subNavs?.map((subLink) => {
            const SubLinkIcon = Icons[subLink.icon || "arrowRight"];
            return (
              <Link
                key={subLink.label}
                href={subLink.href || "/"}
                className="no-underline hover:no-underline text-inherit"
              >
                <span
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    path === subLink.href
                      ? "bg-primary text-accent hover:bg-primary hover:text-accent"
                      : "text-foreground",
                    subLink.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  <SubLinkIcon className="mr-2 h-4 w-4" />
                  {subLink.title}
                </span>
              </Link>
            );
          })
          : null}
      </div>
    </div>
  );
}
