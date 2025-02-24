import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Plus, Info } from 'lucide-react';

function PricingCard() {
    return (
        <Card className="w-[600px] p-6 bg-background border-border">

            <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">AI SDR</h2>
                <p className="text-muted-foreground">Hire digital 24/7 AI SDRs by Agentprod</p>
            </div>

            <div className="text-center mb-8">
                <p className="text-muted-foreground">Starts from</p>
                <div className="flex items-center justify-center">
                    <span className="text-[56px] font-semibold text-white">$300</span>
                </div>
                <p className="text-xl text-muted-foreground">/month</p>
                <p className="text-sm text-muted-foreground">Billed annually</p>
            </div>


            <div className="mb-8">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">500 active contacts/month</p>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </div>
            </div>


            <Button variant="default" className="w-full mb-8 bg-white text-background hover:bg-white/90" size="lg">
                Contact Sales
            </Button>


            <div className="space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-white" />
                        <span className="text-white">AI-created ICP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-white" />
                        <span className="text-white">High-accuracy emails</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-white" />
                        <span className="text-white">AI Personalization</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-white" />
                        <span className="text-white">500 Real-time B2B contacts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-white" />
                        <span className="text-white">Autopilot & Copilot Modes</span>
                    </div>
                </div>


                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Unlimited mailboxes</span>
                        <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded">New</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Unlimited contact storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Unlimited users & clients</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Centralized inbox</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Multichannel automation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Unlimited email warmup</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Unlimited emails monthly</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">1,000 data search credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Anti-spam & deliverability suite</span>
                    </div>
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