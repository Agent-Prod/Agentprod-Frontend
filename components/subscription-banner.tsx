import { memo } from "react";

interface SubscriptionBannerProps {
    isSubscribed: boolean;
    isLeadLimitReached: boolean;
    showOnlyLimitBanner?: boolean;
}

const SubscriptionBanner = memo(({ isSubscribed, isLeadLimitReached, showOnlyLimitBanner }: SubscriptionBannerProps) => {
    if (isSubscribed) return null;

    if (showOnlyLimitBanner && !isSubscribed) {
        return (
            <div className={`w-full p-4 border rounded-xl ${isLeadLimitReached
                && "bg-red-100 border-red-400"

                }`}>
                <p className={`text - sm font - medium text - center ${isLeadLimitReached
                    && "text-red-900"
                    } `}>
                    {isLeadLimitReached && "Your trial account has reached the limit of 100 free leads. Contact us at founders@agentprod.com to reach out to more leads!"}
                </p>
            </div >
        );
    }


    return (
        <div className={`w-full p-4 border rounded-xl ${isLeadLimitReached
            ? "bg-red-100 border-red-400"
            : "bg-amber-100 border-amber-400"
            } `}>
            <p className={`text - sm font - medium text - center ${isLeadLimitReached
                ? "text-red-900"
                : "text-amber-900"
                } `}>
                {isLeadLimitReached ? (
                    <>
                        Your trial account has reached the limit of 100 free leads. Contact us at{' '}
                        <a
                            href="mailto:founders@agentprod.com"
                            className="text-blue-700 hover:text-blue-900 underline font-semibold"
                        >
                            founders@agentprod.com
                        </a>
                        {' '}to reach out to more leads!
                    </>
                ) : (
                    <>
                        You're on a free trial! Enjoy 100 LinkedIn outreach leads for the next 10 days. Need more? Contact us at{' '}
                        <a
                            href="mailto:founders@agentprod.com"
                            className="text-blue-700 hover:text-blue-900 underline font-semibold"
                        >
                            founders@agentprod.com
                        </a>
                        {' '}to scale your outreach!
                    </>
                )}
            </p>
        </div>
    );
});

SubscriptionBanner.displayName = 'SubscriptionBanner';

export default SubscriptionBanner; 