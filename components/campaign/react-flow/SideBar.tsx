import React from 'react'

interface SideBarProps {
  isEnabled: boolean;
  onActionSelect: (action: { label: string; type: string }) => void;
}

function SideBar({ isEnabled, onActionSelect }: SideBarProps) {
  const actions = [
    { label: 'Send Email', type: 'send_email' },
    { label: 'Send Email Follow-up', type: 'email_followup' },
    { label: 'Send LinkedIn Invite', type: 'linkedin_invite' },
    { label: 'Like LinkedIn Post', type: 'linkedin_like' },
    { label: 'Comment on LinkedIn Post', type: 'linkedin_comment' },
    { label: 'Send LinkedIn Message', type: 'linkedin_message' },
    { label: 'Withdraw Connection Request', type: 'withdraw_request' },
    { label: 'Send LinkedIn Follow-up Message', type: 'linkedin_followup' },
  ]

  return (
    <aside className="p-6 h-full">
      <h2 className="text-xl font-semibold mb-4 pl-2">Actions:</h2>
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => isEnabled && onActionSelect(action)}
            disabled={!isEnabled}
            className={`w-full p-2 text-[13px] text-left rounded-lg 
            transition-all duration-200 font-medium tracking-wide
            border border-transparent
            ${isEnabled 
              ? 'hover:bg-zinc-800/50 hover:border-zinc-700 cursor-pointer' 
              : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default SideBar