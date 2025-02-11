"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/auth-provider";
import axiosInstance from "@/utils/axiosInstance";

interface SubscriptionContextType {
    isSubscribed: boolean | null;
    isLeadLimitReached: boolean;
    loading: boolean;
    error: string | null;
    refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
    const [isLeadLimitReached, setIsLeadLimitReached] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchSubscriptionStatus = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const res = await axiosInstance.get(`v2/pricing-plans`);

            setIsSubscribed(res.data.subscribed);

            if (!res.data.subscribed) {
                const leadsRes = await axiosInstance.get('v2/leads/');
                if (leadsRes.data >= 100) {
                    setIsLeadLimitReached(true);
                } else {
                    setIsLeadLimitReached(false);
                }
            }
        } catch (error: any) {
            console.error("Failed to fetch subscription status:", error);
            setError("Failed to fetch subscription status");
            setIsSubscribed(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptionStatus();
    }, [user]);

    const refreshSubscription = async () => {
        await fetchSubscriptionStatus();
    };

    return (
        <SubscriptionContext.Provider
            value={{
                isSubscribed,
                isLeadLimitReached,
                loading,
                error,
                refreshSubscription
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error("useSubscription must be used within a SubscriptionProvider");
    }
    return context;
}; 