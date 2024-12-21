import { NodeProps, Handle, Position } from '@xyflow/react';
import { useState } from 'react';


export function EmailNode({ data, id }: NodeProps<any>) {
  const isChildNode = id.includes('-') && id.split('-').length > 1;

  return (
    <div className="px-16 py-4 rounded-full bg-zinc-900 text-white border border-zinc-800
                    flex items-center justify-center min-w-[200px] relative">
      {isChildNode && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#4f4f4f', width: '8px', height: '8px' }}
        />
      )}

      <span className="text-lg font-medium">{data.label as string}</span>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#4f4f4f',
          width: '8px',
          height: '8px',
        }}
      />
    </div>
  );
}

export function DelayNode({ data, id }: NodeProps<any>) {
  const [isEditing, setIsEditing] = useState(false);
  const [days, setDays] = useState(() => {
    const initialDays = data.label?.split(' ')[0];
    return initialDays ? parseInt(initialDays) : 1;
  });

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setDays(value);
    if (data.onChange) {
      data.onChange(id, value);
    }
  };

  return (
    <div
      onClick={() => !isEditing && setIsEditing(true)}
      className="px-8 py-3 rounded-lg bg-zinc-900 text-white border border-zinc-800
                flex items-center gap-3 min-w-[140px] cursor-pointer hover:bg-zinc-800/50"
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#4f4f4f', width: '8px', height: '8px' }}
      />
      <div className="w-6 h-6">⏱️</div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            type="number"
            value={days}
            onChange={handleDayChange}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            autoFocus
            min="1"
            className="w-12 bg-zinc-800 text-white text-lg font-medium 
                      rounded px-1 outline-none border border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-lg font-medium">
            {days}
          </span>
        )}
        <span className="text-lg font-medium">day{days > 1 ? 's' : ''}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#4f4f4f', width: '8px', height: '8px' }}
      />
    </div>
  );
}

export function DelayNode1({ data, id }: NodeProps<any>) {
  const [isEditing, setIsEditing] = useState(false);
  const [days, setDays] = useState(() => {
    const initialDays = data.label?.split(' ')[0];
    return initialDays ? parseInt(initialDays) : 1;
  });

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setDays(value);
    if (data.onChange) {
      data.onChange(id, value);
    }
  };

  return (
    <div
      onClick={() => !isEditing && setIsEditing(true)}
      className="px-8 py-3 rounded-lg bg-zinc-900 text-white border border-zinc-800
                flex items-center gap-3 min-w-[140px] cursor-pointer hover:bg-zinc-800/50"
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#4f4f4f', width: '8px', height: '8px' }}
      />
      <div className="w-6 h-6">⏱️</div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            type="number"
            value={days}
            onChange={handleDayChange}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            autoFocus
            min="1"
            className="w-12 bg-zinc-800 text-white text-lg font-medium 
                      rounded px-1 outline-none border border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-lg font-medium">
            {days}
          </span>
        )}
        <span className="text-lg font-medium">day{days > 1 ? 's' : ''}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#4f4f4f', width: '8px', height: '8px' }}
      />
    </div>
  );
}

export function ActionNode({ data }: NodeProps<any>) {
  const [showEnd, setShowEnd] = useState(false);

  if (showEnd) {
    return (
      <div className="px-12 py-3 rounded-lg border-2 border-zinc-700
                    text-zinc-400 min-w-[120px] text-center">
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#4f4f4f', width: '8px', height: '8px' }}
        />
        <span className="text-lg">End</span>
      </div>
    );
  }

  const handleActionClick = () => {
    if (data.onActionClick) {
      data.onActionClick();
    }
  };

  return (
    <div className="flex items-center">
      <div
        onClick={handleActionClick}
        className="px-8 py-3 rounded-l-lg border-2 border-dashed border-zinc-700
                  text-zinc-400 hover:bg-zinc-800/50 cursor-pointer"
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#4f4f4f', width: '8px', height: '8px' }}
        />
        <span className="text-lg">Add action</span>
      </div>

      {/* Separator */}
      <div className="h-[calc(100%-4px)] w-[2px] bg-zinc-700 mx-[-1px]" />

      <div
        onClick={() => setShowEnd(true)}
        className="px-8 py-3 rounded-r-lg border-2 border-dashed border-zinc-700
                  text-zinc-400 hover:bg-zinc-800/50 cursor-pointer"
      >
        <span className="text-lg">End</span>
      </div>
    </div>
  );
}

export function LinkedInNode({ data, id }: NodeProps<any>) {
  return (
    <div className="px-16 py-4 rounded-full bg-zinc-900 text-white border border-zinc-800
                    flex items-center justify-center min-w-[200px] relative">
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#4f4f4f', width: '8px', height: '8px' }}
      />

      <span className="text-lg font-medium">{data.label as string}</span>

      <Handle
        id="source-left"
        type="source"
        position={Position.Left}
        style={{
          background: '#4f4f4f',
          width: '8px',
          height: '8px',
          top: '50%'
        }}
      />

      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
        style={{
          background: '#4f4f4f',
          width: '8px',
          height: '8px',
          top: '50%'
        }}
      />
    </div>
  );
}

