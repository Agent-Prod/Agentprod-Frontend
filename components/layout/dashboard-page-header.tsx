"use client";
import React, { useEffect } from "react";
import { usePageHeader } from "../../context/page-header";
import { Separator } from "../ui/separator";
import { usePathname } from "next/navigation";
import { pageTitleConfig, matchPathname } from "@/constants/headers"; // Adjust import as needed

export default function DashboardPageHeader() {
  const { setTitle, setHidden, hidden, title } = usePageHeader();
  const pathname = usePathname();

  useEffect(() => {
    // Attempt to find a matching config for the current pathname
    const currentPageConfig = pageTitleConfig.find((config) =>
      matchPathname(pathname, config.pathname)
    );

    if (currentPageConfig) {
      setTitle(currentPageConfig.title);
      setHidden(currentPageConfig.hidden);
    }
  }, [pathname, setTitle, setHidden]);

  return (
    <>
      {hidden ? null : (
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {title === "Settings" && <p className="text-sm text-muted-foreground pt-1">Manage your account settings and set e-mail preferences.</p>}
          <Separator className="mt-3 mb-3" />
        </div>
      )}
    </>
  );
}
