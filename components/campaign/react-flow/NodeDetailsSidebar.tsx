import { Node } from '@xyflow/react';

interface NodeDetailsSidebarProps {
  node?: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, newData: any) => void;
  onCreateNode?: (type: string) => void;
}

function NodeDetailsSidebar({ node, onClose, onUpdate, onCreateNode }: NodeDetailsSidebarProps) {
  const nodeTypes = [
    { type: 'input', label: 'Input Node', className: 'border-blue-500' },
    { type: 'default', label: 'Default Node', className: 'border-gray-500' },
    { type: 'output', label: 'Output Node', className: 'border-red-500' }
  ];

  const nodeProperties = [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'duration', label: 'Duration', type: 'text' },
    { key: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ]},
    { key: 'assignee', label: 'Assignee', type: 'text' },
    { key: 'dueDate', label: 'Due Date', type: 'date' }
  ];

  const renderField = (property: any) => {
    switch (property.type) {
      case 'textarea':
        return (
          <textarea
            defaultValue={node?.data[property.key] || ''}
            onChange={(e) => onUpdate(node!.id, { [property.key]: e.target.value })}
            className="w-full p-2 rounded border outline-none focus:ring-1 bg-zinc-900 min-h-[100px]"
          />
        );
      case 'select':
        return (
          <select
            value={node?.data[property.key] || ''}
            onChange={(e) => onUpdate(node!.id, { [property.key]: e.target.value })}
            className="w-full p-2 rounded border outline-none focus:ring-1 bg-zinc-900"
          >
            {property.options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            defaultValue={node?.data[property.key] || ''}
            onChange={(e) => onUpdate(node!.id, { [property.key]: e.target.value })}
            className="w-full p-2 rounded border outline-none focus:ring-1 bg-zinc-900"
          />
        );
      default:
        return (
          <input
            type="text"
            defaultValue={node?.data[property.key] || ''}
            onChange={(e) => onUpdate(node!.id, { [property.key]: e.target.value })}
            className="w-full p-2 rounded border outline-none focus:ring-1 bg-zinc-900"
          />
        );
    }
  };

  return (
    <aside className="h-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {node ? `${node.data.label} Details` : 'Add Node'}
          </h2>
          {node && (
            <button onClick={onClose} className="hover:opacity-75 transition-opacity">
              ✕
            </button>
          )}
        </div>

        {!node ? (
          <div className="space-y-3">
            {nodeTypes.map((nodeType) => (
              <button
                key={nodeType.type}
                onClick={() => onCreateNode?.(nodeType.type)}
                className={`w-full p-3 rounded border-2 ${nodeType.className} 
                  hover:bg-zinc-800/50 transition-all duration-200
                  text-center font-medium`}
              >
                {nodeType.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {nodeProperties.map((property) => (
              <div key={property.key}>
                <label className="block text-sm mb-2">{property.label}</label>
                {renderField(property)}
              </div>
            ))}

            <div className="flex gap-2 mt-6">
              <button 
                className="flex-1 p-2 rounded border hover:opacity-75 transition-opacity bg-green-600 text-white"
                onClick={() => onUpdate(node.id, { status: 'completed' })}
              >
                Complete
              </button>
              <button 
                className="flex-1 p-2 rounded border hover:opacity-75 transition-opacity bg-red-500 text-white"
                onClick={() => onUpdate(node.id, { status: 'deleted' })}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default NodeDetailsSidebar;