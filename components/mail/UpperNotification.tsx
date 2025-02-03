"use client"
import { useMailbox } from '@/context/mailbox-provider';
import axiosInstance from '@/utils/axiosInstance';
import { Check, LinkedinIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

function UpperNotification({ connection_sent_time, connection_accepted_time, linkedin_url, name, message_sent_with_invite, invite_message, linkedin_sender_name }:
    { connection_sent_time: string, connection_accepted_time: string, linkedin_url: string, name: string, message_sent_with_invite: string, invite_message: string, linkedin_sender_name: string }) {

    const formatDate = (dateString: string) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";

        const now = new Date();

        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        };

        const time = new Intl.DateTimeFormat("en-US", timeOptions).format(date);

        const dateOptions: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "short",
        };

        if (date.getFullYear() !== now.getFullYear()) {
            dateOptions.year = "numeric";
        }

        const formattedDate = new Intl.DateTimeFormat("en-GB", dateOptions).format(
            date
        );

        const isToday = date.toDateString() === now.toDateString();
        const isTomorrow =
            date.toDateString() ===
            new Date(now.setDate(now.getDate() + 1)).toDateString();
        const isYesterday =
            date.toDateString() ===
            new Date(now.setDate(now.getDate() - 2)).toDateString();

        if (isToday) {
            return `${time}, Today`;
        } else if (isTomorrow) {
            return `${time}, Tomorrow`;
        } else if (isYesterday) {
            return `${time}, Yesterday`;
        } else {
            return `${time}, ${formattedDate}`;
        }
    };

    return (
        <div>
            {connection_sent_time && (
                <div className="flex items-center gap-3">
                    <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
                        <LinkedinIcon className="h-4 w-4 text-gray-400 ml-2 mr-2" />
                    </div>
                    <p className="ml-1 text-xs">
                        {name} has been sent a connection request from {linkedin_sender_name || linkedin_url}
                    </p>
                    <span className="text-gray-400 text-xs">
                        {formatDate(connection_sent_time)}
                    </span>

                </div>
            )}
            {connection_accepted_time && (
                <div className="flex items-center gap-3 my-2">
                    <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
                        <Check className="h-4 w-4 text-gray-400 ml-2 mr-2" />
                    </div>
                    <p className="ml-1 text-xs">
                        {name} has accepted your connection request from {linkedin_sender_name || linkedin_url}
                    </p>
                    <span className="text-gray-400 text-xs">
                        {formatDate(connection_accepted_time)}
                    </span>
                </div>
            )}

            {(connection_accepted_time && message_sent_with_invite) && (
                <div className="flex items-center gap-3 my-2">
                    <div className="h-[30px] w-[30px] bg-gray-800 rounded-full items-center justify-center flex text-center">
                        <Check className="h-4 w-4 text-gray-400 ml-2 mr-2" />
                    </div>
                    <p className="ml-1 text-xs">
                        Linkedin Invite Message: <span className="text-gray-400">{invite_message}</span>
                    </p>

                </div>
            )}
        </div>
    )
}

export default UpperNotification