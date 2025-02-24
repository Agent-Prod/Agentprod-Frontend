"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { User, Mail, Layout } from "lucide-react";

const navItems = [
  {
    title: "Account Info",
    href: "/settings/account-info",
    icon: User,
  },
  {
    title: "Mailboxes",
    href: "/settings/mailbox",
    icon: Mail,
  },
  {
    title: "Integrations",
    href: "/settings/integration",
    icon: Layout,
  },
  {
    title: "User Subscriptions",
    href: "/settings/user-subscription",
    icon: Layout,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-2 max-w-5xl">
      <nav className="mb-8">
        <div className="border-b">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-4 text-sm font-medium transition-colors hover:text-primary",
                    "border-b-2 -mb-[2px]",
                    pathname === item.href
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}