import React, { DragEvent } from 'react';
import { cn } from "@/lib/utils";

interface SideBarProps {
  isEnabled: boolean;
  onActionSelect: (action: { type: string; label: string }) => void;
  existingNodes?: string[];
  onDragStart?: (e: DragEvent<HTMLDivElement>, action: { type: string; label: string }) => void;
  draggedAction?: string | null;
  channel?: string;
}

export const actions = [
  { label: 'Send First Email', type: 'first_email' },
  { label: 'Send Follow-up Email', type: 'follow_up_email' },
  { label: 'Send LinkedIn Connection', type: 'linkedin_connection' },
  // { label: 'Send LinkedIn InMail', type: 'linkedin_inmail' },
  { label: 'Send LinkedIn Message', type: 'linkedin_message' },
  { label: 'Send LinkedIn Follow-up', type: 'linkedin_followup' },
  { label: 'Like and Comment on Post', type: 'like_post' },
  { label: 'Mark as Lost', type: 'mark_as_lost' },
  { label: 'Withdraw Connection Request', type: 'withdraw_request' },
];

function SideBar({
  isEnabled,
  onActionSelect,
  existingNodes = [],
  onDragStart,
  draggedAction,
  channel
}: SideBarProps) {
  const isActionEnabled = (type: string): boolean => {
    if (existingNodes.length === 0) {
      return ['first_email', 'linkedin_connection', 'linkedin_inmail', 'linkedin_message', 'like_post'].includes(type);
    }

    switch (type) {
      case 'follow_up_email':
        return true;

      case 'withdraw_request':
        return existingNodes.includes('linkedin_connection') &&
          !existingNodes.includes('mark_as_lost');

      case 'mark_as_lost':
        return existingNodes.includes('linkedin_connection') &&
          !existingNodes.includes('withdraw_request');

      case 'first_email':
        return !existingNodes.some(node => node === 'follow_up_email');

      case 'like_post':
        return true;

      case 'linkedin_connection':
        return !existingNodes.includes('withdraw_request');

      case 'linkedin_inmail':
        return true;

      case 'linkedin_message':
        return true;

      default:
        return false;
    }
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, action: { type: string; label: string }) => {
    if (!isEnabled || !isActionEnabled(action.type)) {
      e.preventDefault();
      return;
    }
    onDragStart?.(e, action);
  };

  const visibleActions = actions.filter(action => {
    if (channel === 'mail') {
      return ['first_email', 'follow_up_email', 'mark_as_lost'].includes(action.type);
    } else if (channel === 'Linkedin') {
      return ['linkedin_connection', 'linkedin_message', 'like_post', 'mark_as_lost', 'withdraw_request', 'linkedin_followup'].includes(action.type);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {visibleActions.map((action) => {
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