"use client";
import React from "react";
import { Nav } from "@/components/layout/nav/nav";
import { NavInterface } from "@/types";

const navItems: NavInterface[] = [
  {
    category: "Main",
    items: [
      {
        title: "Account Info",
        href: "/settings/account-info",
        label: "Account Info",
        isCollapsible: false,
        icon: "user",
      },
      {
        title: "Mailboxes",
        href: "/settings/mailbox",
        label: "Mailboxes",
        isCollapsible: false,
        icon: "mail",
      },
      {
        title: "Integrations",
        href: "/settings/integration",
        label: "Integrations",
        isCollapsible: false,
        icon: "kanban",
      },
    ],
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <div className="w-52 flex-shrink-0">
        <Nav isCollapsed={false} links={navItems} />
      </div>
      <div className="flex flex-col flex-grow">
        <main className="flex-grow px-5 py-3">{children}</main>
      </div>
    </div>
  );
}