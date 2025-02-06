"use client";

import React, { useEffect, useRef, useState } from "react";

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
import axios from "axios";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { setCookie, getCookie } from "cookies-next";

export default function ParentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const { width } = useWindowSize();
    const { user } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(true);

    const verificationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const verificationAttemptsRef = useRef(0);
    const MAX_VERIFICATION_ATTEMPTS = 20;
    const hasInitializedRef = useRef(false);


    useEffect(() => {
        if (!user) {
            redirect("/");
            return;
        }
        console.log("user", user);
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
    }, [user]);

    useEffect(() => {
        const checkAndRefreshToken = async () => {
            setIsRefreshing(true);
            const loginTimestamp = localStorage.getItem('login_timestamp');
            const lastLoginTime = loginTimestamp ? new Date(loginTimestamp) : new Date();
            const currentTime = new Date();
            const timeDifference = currentTime.getTime() - lastLoginTime.getTime();
            console.log("loginTimestamp", timeDifference);

            if (timeDifference > 1000 * 60 * 60 * 24 * 5) {
                const refreshToken = getCookie('auth-refresh-token');
                const response = await axiosInstance.post('/v2/users/refresh-token', {
                    refresh_token: refreshToken
                });

                if (response.data?.access_token) {
                    setCookie('auth-token', response.data.access_token, { maxAge: 604800 });
                    setCookie('auth-refresh-token', response.data.refresh_token, { maxAge: 604800 });
                    localStorage.setItem('login_timestamp', new Date().toISOString());
                }
                setIsRefreshing(false);
            }
            setIsRefreshing(false);
        };

        checkAndRefreshToken();

    }, []);



    const startVerification = () => {
        const domain = localStorage.getItem('domainInput');
        if (!domain) {
            toast.error("No domain found. Please enter a domain first.");
            return;
        }

        localStorage.setItem('verificationInProgress', 'true');
        verificationAttemptsRef.current = 0;

        verificationIntervalRef.current = setInterval(async () => {
            if (verificationAttemptsRef.current >= MAX_VERIFICATION_ATTEMPTS) {
                clearInterval(verificationIntervalRef.current!);
                localStorage.removeItem('verificationInProgress');
                toast.error("Domain verification failed after maximum attempts. Please try again later.");
                return;
            }

            verificationAttemptsRef.current++;

            try {
                const response = await axiosInstance.get(`v2/user/${domain}/authenticate`);

                if (!response.data.error) {
                    clearInterval(verificationIntervalRef.current!);
                    localStorage.removeItem('verificationInProgress');
                    toast.success("Domain verified successfully!");
                } else {
                    console.log(`Domain not yet verified, attempt ${verificationAttemptsRef.current} of ${MAX_VERIFICATION_ATTEMPTS}`);
                }
            } catch (error: any) {
                clearInterval(verificationIntervalRef.current!);
                localStorage.removeItem('verificationInProgress');
                toast.error("An error occurred while verifying the domain. Please try again later.");
                console.error("Domain verification error:", error);
            }
        }, 60 * 1000);
    };

    if (isRefreshing) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Header />

            <div className="flex flex-col min-h-screen overflow-hidden md:pt-16">

                <TooltipProvider delayDuration={0}>
                    <ResizablePanelGroup
                        direction="horizontal"
                        onLayout={(sizes: number[]) => {
                            document.cookie = `react-resizable-panels:layout=${JSON.stringify(
                                sizes
                            )}`;
                        }}
                        className="flex-1 items-stretch"
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
                                className={cn(
                                    "transition-all duration-300 ease-in-out",
                                    "border-r border-border"
                                )}
                            >
                                <Nav isCollapsed={isCollapsed} links={navItems} />
                            </ResizablePanel>
                        ) : null}
                        {width > 768 ? (
                            <ResizableHandle
                                withHandle
                                className="bg-border hover:bg-primary/20 transition-colors"
                            />
                        ) : null}
                        <ResizablePanel minSize={70} defaultSize={85}>
                            <ScrollArea className="h-[calc(100vh-4rem)] px-6">
                                <PageHeaderProvider>
                                    <main className="py-2 pb-2 mx-auto">
                                        {children}
                                    </main>
                                </PageHeaderProvider>
                            </ScrollArea>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </TooltipProvider>
            </div>
        </>
    );
}


