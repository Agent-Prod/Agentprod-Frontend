import React from 'react'

interface SideBarProps {
  isEnabled: boolean;
  onActionSelect: (action: { type: string; label: string }) => void;
  existingNodes?: string[];
}

function SideBar({ isEnabled, onActionSelect, existingNodes = [] }: SideBarProps) {
  const isActionEnabled = (type: string): boolean => {
    switch (type) {
      case 'email_followup':
        return existingNodes.includes('send_email');
      case 'linkedin_message':
      case 'linkedin_followup':
        return existingNodes.includes('linkedin_invite');
      case 'withdraw_request':
        return existingNodes.includes('linkedin_invite');
      default:
        return true;
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
  ]

  return (
    <aside className="p-6 h-full">
      <h2 className="text-xl font-semibold mb-4 pl-2">Actions:</h2>
      <div className="flex flex-col gap-2">
        {actions.map((action) => {
          const actionEnabled = isEnabled && isActionEnabled(action.type);
          
          return (
            <button
              key={action.type}
              onClick={() => actionEnabled && onActionSelect(action)}
              className={`w-full p-2 text-[13px] text-left rounded-lg 
              transition-all duration-200 font-medium tracking-wide
              border border-transparent
              ${actionEnabled
                  ? 'hover:bg-zinc-800/50 hover:border-zinc-700 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
                }`}
              title={!isActionEnabled(action.type) ? 'Required previous action not found' : ''}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </aside>
  )
}

export default SideBar