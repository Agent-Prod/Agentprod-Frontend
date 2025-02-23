import React from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface FollowUpSectionProps {
    type: 'email' | 'linkedin';
    showFirst: boolean;
    showSecond: boolean;
    toggleFirst: () => void;
    toggleSecond: () => void;
    values?: {
        first: string;
        second: string;
    };
    onChangeFirst?: (value: string) => void;
    onChangeSecond?: (value: string) => void;
    campaignType: string;
    button1: boolean;
}

export function FollowUpSection({
    type,
    showFirst,
    showSecond,
    toggleFirst,
    toggleSecond,
    values,
    onChangeFirst,
    onChangeSecond,
    campaignType,
    button1
}: FollowUpSectionProps) {
    return (
        <>
            {/* First Follow-up */}
            {showFirst && (
                <div className="relative mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-md font-medium text-gray-400">Follow-up Message 1</h3>
                        <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={toggleFirst}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <Textarea
                        placeholder={`Write your first ${type} follow-up message`}
                        value={values?.first}
                        onChange={(e) => onChangeFirst?.(e.target.value)}
                        className="w-full h-[200px]"
                    />
                </div>
            )}

            {/* Second Follow-up */}
            {showSecond && (
                <div className="relative mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-md font-medium text-gray-400">Follow-up Message 2</h3>
                        <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={toggleSecond}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <Textarea
                        placeholder={`Write your second ${type} follow-up message`}
                        value={values?.second}
                        onChange={(e) => onChangeSecond?.(e.target.value)}
                        className="w-full h-[200px]"
                    />
                </div>
            )}

            {/* Follow-up Buttons */}
            <div className="mt-6 flex flex-row gap-4">
                {campaignType && campaignType !== "Nurturing" && (
                    <>
                        {!showFirst && (
                            <Button variant="outline" onClick={toggleFirst}>
                                <Plus className="h-3 w-3 text-gray-400 mr-2" />
                                Add first follow-up
                            </Button>
                        )}
                        {showFirst && !showSecond && (
                            <Button variant="outline" onClick={toggleSecond}>
                                <Plus className="h-3 w-3 text-gray-400 mr-2" />
                                Add second follow-up
                            </Button>
                        )}
                    </>
                )}
            </div>
        </>
    );
} 