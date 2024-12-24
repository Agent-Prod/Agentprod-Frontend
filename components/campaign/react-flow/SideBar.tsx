import React, { DragEvent } from 'react';
import { cn } from "@/lib/utils";

interface SideBarProps {
  isEnabled: boolean;
  onActionSelect: (action: { type: string; label: string }) => void;
  existingNodes?: string[];
  onDragStart?: (e: DragEvent<HTMLDivElement>, action: { type: string; label: string }) => void;
  draggedAction?: string | null;
}

function SideBar({
  isEnabled,
  onActionSelect,
  existingNodes = [],
  onDragStart,
  draggedAction
}: SideBarProps) {
  const isActionEnabled = (type: string): boolean => {
    if (existingNodes.length === 0) {
      return ['send_email', 'linkedin_invite', 'linkedin_post', 'inmail'].includes(type);
    }

    switch (type) {
      case 'email_followup':
        return existingNodes.includes('send_email');

      case 'linkedin_message':
        return existingNodes.includes('linkedin_invite') &&
          !existingNodes.includes('withdraw_request');

      case 'linkedin_followup':
        return (existingNodes.includes('linkedin_message') ||
          existingNodes.includes('linkedin_invite')) &&
          !existingNodes.includes('withdraw_request');

      case 'withdraw_request':
        return existingNodes.includes('linkedin_invite') &&
          !existingNodes.includes('linkedin_message');

      case 'send_email':
        return !existingNodes.some(node => node === 'email_followup');

      // These actions are always available after any other action
      case 'linkedin_post':
      case 'inmail':
        return true;

      case 'linkedin_invite':
        return !existingNodes.includes('withdraw_request');

      default:
        return false;
    }
  };

  const actions = [
    { label: 'Send Email', type: 'send_email' },
    { label: 'Send Email Follow-up', type: 'email_followup' },
    { label: 'Send LinkedIn Invite', type: 'linkedin_invite' },
    { label: 'Like and Comment on LinkedIn Post', type: 'linkedin_post' },
    { label: 'Send Inmail', type: 'inmail' },
    { label: 'Send LinkedIn Message', type: 'linkedin_message' },
    { label: 'Withdraw Connection Request', type: 'withdraw_request' },
    { label: 'Send LinkedIn Follow-up Message', type: 'linkedin_followup' },
  ];

  const handleDragStart = (e: DragEvent<HTMLDivElement>, action: { type: string; label: string }) => {
    if (!isEnabled || !isActionEnabled(action.type)) {
      e.preventDefault();
      return;
    }
    onDragStart?.(e, action);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {actions.map((action) => {
          const actionEnabled = isEnabled && isActionEnabled(action.type);

          return (
            <div
              key={action.type}
              draggable={actionEnabled}
              onDragStart={(e) => handleDragStart(e, action)}
              onClick={() => actionEnabled && onActionSelect(action)}
              className={cn(
                "w-full p-3 text-[13px] text-left rounded-lg",
                "transition-all duration-200 font-medium tracking-wide",
                "border border-transparent",
                actionEnabled && "hover:bg-zinc-800/50 hover:border-zinc-700",
                actionEnabled && draggedAction === action.type && "opacity-50 bg-zinc-800/30",
                !actionEnabled && "opacity-50 cursor-not-allowed",
                actionEnabled && "cursor-move"
              )}
              title={!isActionEnabled(action.type) ? 'Required previous action not found' : 'Drag to add to flow'}
            >
              <div className="flex items-center gap-2">
                <span>{action.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SideBar;