import ThemeToggle from "@/components/layout/ThemeToggle/theme-toggle";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./nav/mobile-sidebar";
import { UserNav } from "./user-nav";
import { AccountSwitcher } from "./account-switcher";
import { accounts } from "@/constants/data";
import { LeadProfileSheet } from "../lead-profile-sheet";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20">
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="hidden md:block">
          <div
            className={cn(
              "flex h-[52px] items-center justify-center px-2"
            )}
          >
            <AccountSwitcher
              accounts={accounts}
            />
          </div>
        </div>
        <div className={cn("block md:!hidden")}>
          <MobileSidebar />
        </div>

        <div className="flex items-center gap-2">
          <UserNav />
          <ThemeToggle />
          <LeadProfileSheet />
        </div>
      </nav>
    </div>
  );
}
