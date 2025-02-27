"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Plus, Info, Loader2 } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

interface PriceData {
    lookup_key: string;
    price_id: string;
    price: number;
    currency: string;
    lead_type: string;
}

interface PricingPlan {
    id: string;
    name: string;
    description: string;
    contactLimit: string;
    mainFeatures: string[];
    additionalFeatures: {
        text: string;
        isNew?: boolean;
    }[];
}

const pricingPlans: PricingPlan[] = [
    {
        id: "company_plan",
        name: "Company Plan",
        description: "Hire digital 24/7 AI SDRs by Agentprod",
        contactLimit: "1000 contacts/month",
        mainFeatures: [
            'AI-created ICP',
            'High-accuracy emails',
            'AI Personalization',
            '1000 Real-time B2B contacts',
            'Autopilot & Copilot Modes'
        ],
        additionalFeatures: [
            { text: 'Unlimited mailboxes', isNew: true },
            { text: 'Unlimited contact storage' },
            { text: 'Unlimited users & clients' },
            { text: 'Centralized inbox' },
            { text: 'Multichannel automation' },
            { text: 'Unlimited email warmup' },
            { text: 'Unlimited emails monthly' },
            { text: '1,000 data search credits' },
            { text: 'Anti-spam & deliverability suite' }
        ]
    },
    {
        id: "founders_plan",
        name: "Founders Plan",
        description: "Hire digital 24/7 AI SDRs by Agentprod",
        contactLimit: "1000 contacts/month",
        mainFeatures: [
            'AI-created ICP',
            'High-accuracy emails',
            'AI Personalization',
            '1000 Real-time B2B contacts',
            'Autopilot & Copilot Modes'
        ],
        additionalFeatures: [
            { text: 'Unlimited mailboxes', isNew: true },
            { text: 'Unlimited contact storage' },
            { text: 'Unlimited users & clients' },
            { text: 'Centralized inbox' },
            { text: 'Multichannel automation' },
            { text: 'Unlimited email warmup' },
            { text: 'Unlimited emails monthly' },
            { text: '1,000 data search credits' },
            { text: 'Anti-spam & deliverability suite' }
        ]
    }
];

function PricingCard() {
    const [prices, setPrices] = useState<PriceData[]>([]);
    const [selectedPrice, setSelectedPrice] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const response = await axiosInstance.get('v2/stripe/prices');
                setPrices(response.data);
                const emailPrice = response.data.find((p: PriceData) => p.lookup_key === 'email_price');
                if (emailPrice) {
                    setSelectedPrice(emailPrice.price_id);
                }
            } catch (error) {
                console.error('Error fetching prices:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrices();
    }, []);

    const handleCheckout = async (planId: string) => {
        try {
            const selectedPriceData = prices.find(p => p.lookup_key === planId);
            if (!selectedPriceData) return;

            const response = await axiosInstance.post('/v2/stripe/checkout', {
                "price_id": selectedPriceData.price_id,
                "lead_type": getPlanName(planId),
                "quantity": 1
            });

            window.location.href = response.data.checkout_url;
        } catch (error) {
            console.error('Error during checkout:', error);
        }
    };

    const getPlanName = (key: string) => {
        const names: { [key: string]: string } = {
            'company_plan': 'Company Plan',
            'founders_plan': 'Founders Plan'
        };
        return names[key] || 'Basic Plan';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading pricing plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex space-x-4">
            {pricingPlans.map((plan) => {
                const priceData = prices.find(p => p.lookup_key === plan.id);
                return (
                    <Card key={plan.id} className="w-[350px] p-6 bg-card border-border">
                        <div className="text-center space-y-1 mb-6">
                            <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>

                        <div className="text-center space-y-1 mb-6">
                            <p className="text-sm text-muted-foreground">Price</p>
                            <div className="flex items-center justify-center">
                                {priceData && (
                                    <span className="text-4xl font-semibold text-foreground">
                                        {priceData.currency.toUpperCase()} {priceData.price.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-center gap-1">
                                <p className="text-xs text-muted-foreground">{plan.contactLimit}</p>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </div>
                        </div>

                        <Button
                            variant="default"
                            className="w-full mb-6"
                            size="default"
                            onClick={() => handleCheckout(plan.id)}
                        >
                            Purchase Selected Plan
                        </Button>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="space-y-2">
                                {plan.mainFeatures.map((feature) => (
                                    <div key={feature} className="flex items-center gap-1">
                                        <Plus className="h-3 w-3 text-primary flex-shrink-0" />
                                        <span className="text-xs text-foreground">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                {plan.additionalFeatures.map((feature) => (
                                    <div key={feature.text} className="flex items-center gap-1">
                                        <Check className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs text-muted-foreground">{feature.text}</span>
                                        {feature.isNew && (
                                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                New
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

function Page() {
    return (
        <div className="h-full flex items-center justify-center py-6">
            <PricingCard />
        </div>
    );
}

export default Page;