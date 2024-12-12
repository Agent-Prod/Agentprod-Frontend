import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/auth-provider";

export const useSubscription = () => {
    const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchSubscriptionStatus = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URL}v2/pricing-plans/${user.id}`
            );

            const startTime = new Date(res.data.start_time).getTime();
            const currentTime = Date.now();
            const daysPassed = (currentTime - startTime) / (1000 * 60 * 60 * 24);

            if (daysPassed > 30 && res.data.subscription_mode === "Razorpay") {
                await axios.delete(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}v2/pricing-plans/${res.data.id}`
                );
                setIsSubscribed(false);
            } else {
                setIsSubscribed(res.data.subscribed);
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

    return { isSubscribed, loading, error, fetchSubscriptionStatus };
};
