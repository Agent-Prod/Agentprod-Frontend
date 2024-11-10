"use client";
import React, { useEffect, useState, useRef } from "react";
import Header from "@/components/layout/header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Nav } from "@/components/layout/nav/nav";
import { navItems } from "@/constants/data";
import { TooltipProvider } from "@/components/ui/tooltip";
import useWindowSize from "@/hooks/useWindowSize";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/auth-provider";
import { redirect } from "next/navigation";
import { PageHeaderProvider } from "@/context/page-header";
import { useMailbox } from "@/context/mailbox-provider";
import WarningBanner from "@/components/payment/WarningBanner";
import axios from "axios";
import { useSubscription } from "@/hooks/userSubscription";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useUserContext } from "@/context/user-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { width } = useWindowSize();
  const { user } = useUserContext();
  const { isSubscribed } = useSubscription();
  const { isContextBarOpen } = useMailbox();

  const [isVerifying, setIsVerifying] = useState(false);
  const verificationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const verificationAttemptsRef = useRef(0);
  const MAX_VERIFICATION_ATTEMPTS = 20;
  const hasInitializedRef = useRef(false);



  useEffect(() => {
    

    if (!hasInitializedRef.current) {
      const storedVerificationState = localStorage.getItem('verificationInProgress');
      if (storedVerificationState === 'true') {
        startVerification();
      }
      hasInitializedRef.current = true;
    }

    return () => {
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
      }
    };
  }, []);

  const startVerification = () => {
    const domain = localStorage.getItem('domainInput');
    if (!domain) {
      toast.error("No domain found. Please enter a domain first.");
      return;
    }

    setIsVerifying(true);
    localStorage.setItem('verificationInProgress', 'true');
    verificationAttemptsRef.current = 0;

    verificationIntervalRef.current = setInterval(async () => {
      if (verificationAttemptsRef.current >= MAX_VERIFICATION_ATTEMPTS) {
        clearInterval(verificationIntervalRef.current!);
        setIsVerifying(false);
        localStorage.removeItem('verificationInProgress');
        toast.error("Domain verification failed after maximum attempts. Please try again later.");
        return;
      }

      verificationAttemptsRef.current++;

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}v2/user/${domain}/authenticate`);
        
        if (!response.data.error) {
          clearInterval(verificationIntervalRef.current!);
          setIsVerifying(false);
          localStorage.removeItem('verificationInProgress');
          toast.success("Domain verified successfully!");
        } else {
          console.log(`Domain not yet verified, attempt ${verificationAttemptsRef.current} of ${MAX_VERIFICATION_ATTEMPTS}`);
        }
      } catch (error: any) {
        clearInterval(verificationIntervalRef.current!);
        setIsVerifying(false);
        localStorage.removeItem('verificationInProgress');
        toast.error("An error occurred while verifying the domain. Please try again later.");
        console.error("Domain verification error:", error);
      }
    }, 60 * 1000); 
  };

  return (
    <>
      <Header />
      <div className="flex h-screen overflow-hidden md:pt-16 ">
        <TooltipProvider delayDuration={0}>
          <ResizablePanelGroup
            direction="horizontal"
            onLayout={(sizes: number[]) => {
              document.cookie = `react-resizable-panels:layout=${JSON.stringify(
                sizes
              )}`;
            }}
            className="h-full items-stretch"
          >
            {width > 768 ? (
              <ResizablePanel
                defaultSize={15}
                collapsedSize={5}
                collapsible={true}
                minSize={5}
                onCollapse={() => {
                  setIsCollapsed(true);
                  document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                    true
                  )}`;
                }}
                onExpand={() => {
                  setIsCollapsed(false);
                  document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                    false
                  )}`;
                }}
                className={cn("transition-all duration-300 ease-in-out")}
              >
                <Nav isCollapsed={isCollapsed} links={navItems} />
              </ResizablePanel>
            ) : null}
            {width > 768 ? <ResizableHandle withHandle /> : null}
            <ResizablePanel minSize={70} defaultSize={85}>
              <ScrollArea className="h-screen">
                <PageHeaderProvider>
                  {/* {isSubscribed === false && <WarningBanner />} */}
                  <main className="px-4 pb-20">{children}</main>
                </PageHeaderProvider>
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TooltipProvider>
      </div>
    </>
  );
}
