import React from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface FollowUpSectionProps {
    type: 'email' | 'linkedin';
    followUps: {
        id: number;
        value: string;
    }[];
    onAddFollowUp: () => void;
    onRemoveFollowUp: (id: number) => void;
    onChangeFollowUp: (id: number, value: string) => void;
    campaignType: string;
}

export function FollowUpSection({
    type,
    followUps,
    onAddFollowUp,
    onRemoveFollowUp,
    onChangeFollowUp,
    campaignType
}: FollowUpSectionProps) {
    return (
        <>
            {/* Follow-up Messages */}
            {followUps.map((followUp, index) => (
                <div key={followUp.id} className="relative mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-md font-medium text-gray-400">Follow-up Message {index + 1}</h3>
                        <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => onRemoveFollowUp(followUp.id)}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <Textarea
                        placeholder={`Write your ${type} follow-up message`}
                        value={followUp.value}
                        onChange={(e) => onChangeFollowUp(followUp.id, e.target.value)}
                        className="w-full h-[200px]"
                    />
                </div>
            ))}

            {/* Add Follow-up Button */}
            {campaignType && campaignType !== "Nurturing" && (
                <div className="mt-6">
                    <Button variant="outline" onClick={onAddFollowUp}>
                        <Plus className="h-3 w-3 text-gray-400 mr-2" />
                        Add follow-up message
                    </Button>
                </div>
            )}
        </>
    );
} 