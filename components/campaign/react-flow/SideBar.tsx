import React from 'react'

interface SideBarProps {
  onActionClick: (type: string) => void;
}

function SideBar({ onActionClick }: SideBarProps) {
  const actions = [
    { label: 'Send an invite', type: 'invite' },
    { label: 'Message', type: 'message' },
    { label: 'View profile', type: 'profile' },
    { label: 'Endorse skills', type: 'endorse' },
    { label: 'Follow', type: 'follow' },
    { label: 'Like a post', type: 'like' },
  ]

  return (
    <aside className="p-6    h-full ">
      <h2 className="text-xl font-semibold mb-4 pl-2">Actions:</h2>
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => onActionClick(action.type)}
            className="w-full p-2 text-[14px] text-left hover:bg-zinc-800/50 rounded-lg 
            transition-all duration-200 font-medium tracking-wide
            border border-transparent hover:border-zinc-700"
          >
            {action.label}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default SideBar