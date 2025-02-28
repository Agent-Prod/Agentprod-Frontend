"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Plus, Info, Loader2 } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import { useSubscription, userPlan } from '@/context/subscription-provider';
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
        contactLimit: "300 contacts/month",
        mainFeatures: [
            'AI-created ICP',
            'High-accuracy emails',
            'AI Personalization',
            '300 Real-time B2B contacts',
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
            { text: '300 data search credits' },
            { text: 'Anti-spam & deliverability suite' }
        ]
    }
];

function PricingCard() {
    const [prices, setPrices] = useState<PriceData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const response = await axiosInstance.get('v2/stripe/prices');
                setPrices(response.data);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => {
                const priceData = prices.find(p => p.lookup_key === plan.id);
                const isFoundersPlan = plan.id === "founders_plan";

                return (
                    <Card
                        key={plan.id}
                        className={`overflow-hidden border relative transition-all duration-300 
                            ${isFoundersPlan ? 'border-primary/50 shadow-md' : 'border-border'} 
                            hover:shadow-xl hover:border-primary/30 hover:translate-y-[-4px]`}
                    >
                        {!isFoundersPlan && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground py-1 px-3 text-xs font-medium transform rotate-0 shadow-sm rounded-bl-md">
                                MOST POPULAR
                            </div>
                        )}

                        <div className="p-8">
                            <div className="space-y-3 mb-6">
                                <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                {priceData && (
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-bold text-foreground">
                                            {priceData.currency.toUpperCase()} {priceData.price.toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center mt-3">
                                    <div className="flex items-center text-xs text-muted-foreground bg-muted/80 px-3 py-1.5 rounded-full">
                                        <span>{plan.contactLimit}</span>
                                        <Info className="h-3 w-3 ml-1.5 cursor-help" />
                                    </div>
                                </div>
                            </div>

                            {!useSubscription ? (
                                <Button
                                    variant={isFoundersPlan ? "default" : "outline"}
                                    className={`w-full mb-8 font-medium transition-all duration-200 
                                        ${isFoundersPlan ? 'shadow-sm hover:shadow-md' : 'hover:bg-primary/10'}`}
                                    size="lg"
                                    onClick={() => handleCheckout(plan.id)}
                                >
                                    Get Started
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    className={`w-full mb-8 font-medium transition-all duration-200 
                                        ${userPlan() === plan.id ? 'bg-green-500 text-white' : ''}`}
                                    size="lg"
                                    disabled={true}
                                >
                                    {userPlan() === plan.id ? 'Current Plan' : 'Get Started'}
                                </Button>
                            )}

                            <div className="space-y-5">
                                <h3 className="text-sm font-semibold text-foreground">What`s included:</h3>

                                <div className="space-y-3.5">
                                    {plan.mainFeatures.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <div className="rounded-full bg-primary/15 p-1 mt-0.5">
                                                <Plus className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-border pt-5 mt-5">
                                    <div className="space-y-3.5">
                                        {plan.additionalFeatures.map((feature) => (
                                            <div key={feature.text} className="flex items-start gap-3 group">
                                                <div className="rounded-full bg-muted p-1 mt-0.5 group-hover:bg-primary/10 transition-colors duration-200">
                                                    <Check className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                                                        {feature.text}
                                                    </span>
                                                    {feature.isNew && (
                                                        <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
                                                            NEW
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div >
    );
}

function Page() {
    return (
        <div className="container py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-3">Choose Your Plan</h1>
                <p className="text-muted-foreground max-w-lg mx-auto text-base">
                    Select the perfect plan for your business needs and scale your outreach with AI-powered SDRs
                </p>
            </div>
            <PricingCard />

            <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                    Need a custom plan? <a href="#" className="text-primary hover:underline font-medium">Contact our sales team</a>
                </p>
            </div>
        </div>
    );
}

export default Page;