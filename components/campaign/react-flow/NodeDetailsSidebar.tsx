import { Node } from '@xyflow/react';

interface NodeDetailsSidebarProps {
  node: Node;
  onClose: () => void;
  onUpdate: (data: any) => void;
}

function NodeDetailsSidebar({ node, onClose, onUpdate }: NodeDetailsSidebarProps) {
  return (
    <aside className="h-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Node Details</h2>
          <button 
            onClick={onClose}
            className="hover:opacity-75 transition-opacity"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Status</label>
            <select 
              value={node.data.status || 'pending' as any}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ status: e.target.value })}
              className="w-full p-2 rounded border outline-none focus:ring-1"
            >
              <option value="pending">Still not accepted</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Duration</label>
            <input
              type="text"
              value={node.data.duration || '1 day' as any}
              onChange={(e) => onUpdate({ duration: e.target.value })}
              className="w-full p-2 rounded border outline-none focus:ring-1"
            />
          </div>

          <div className="flex gap-2 mt-6">
            <button 
              className="flex-1 p-2 rounded border hover:opacity-75 transition-opacity"
            >
              Add action
            </button>
            <button 
              className="flex-1 p-2 rounded border hover:opacity-75 transition-opacity"
            >
              End
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default NodeDetailsSidebar;