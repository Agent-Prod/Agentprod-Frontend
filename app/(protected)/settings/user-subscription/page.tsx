"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Plus, Info } from 'lucide-react';
import axios from 'axios';
import axiosInstance from '@/utils/axiosInstance';

function PricingCard() {
    const handleCheckout = async () => {
        try {
            const response = await axiosInstance.post('/v2/stripe/checkout', {
                "price_id": "price_1Qtw721Tx79DPchiiWNIilqJ",
                "lead_type": "Multi Channel Leads",
                "quantity": 5
            });

            const data = response.data;
            console.log('Checkout successful:', data);
            window.location.href = data.checkout_url;

        } catch (error) {
            console.error('Error during checkout:', error);
        }
    };

    return (
        <Card className="w-[600px] p-8 bg-black/70 border-border">
            <div className="text-center space-y-2 mb-10">
                <h2 className="text-2xl font-semibold text-white">AI SDR</h2>
                <p className="text-muted-foreground">Hire digital 24/7 AI SDRs by Agentprod</p>
            </div>

            <div className="text-center space-y-2 mb-10">
                <p className="text-muted-foreground">Starts from</p>
                <div className="flex items-center justify-center">
                    <span className="text-6xl font-semibold text-white">$300</span>
                </div>
                <div className="space-y-1">
                    <p className="text-xl text-muted-foreground">/month</p>
                    <p className="text-sm text-muted-foreground">Billed annually</p>
                </div>
            </div>

            <div className="mb-10">
                <div className="flex items-center justify-center gap-2">
                    <p className="text-sm text-muted-foreground">500 active contacts/month</p>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </div>
            </div>

            <Button
                variant="default"
                className="w-full mb-10 bg-white text-background hover:bg-white/90"
                size="lg"
                onClick={handleCheckout}
            >
                Contact Sales
            </Button>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className="space-y-4">
                    {[
                        'AI-created ICP',
                        'High-accuracy emails',
                        'AI Personalization',
                        '500 Real-time B2B contacts',
                        'Autopilot & Copilot Modes'
                    ].map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                            <Plus className="h-4 w-4 text-white flex-shrink-0" />
                            <span className="text-white">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Unlimited mailboxes</span>
                        <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded">New</span>
                    </div>
                    {[
                        'Unlimited contact storage',
                        'Unlimited users & clients',
                        'Centralized inbox',
                        'Multichannel automation',
                        'Unlimited email warmup',
                        'Unlimited emails monthly',
                        '1,000 data search credits',
                        'Anti-spam & deliverability suite'
                    ].map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
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