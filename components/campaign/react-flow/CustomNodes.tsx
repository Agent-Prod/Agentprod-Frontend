import { NodeProps, Handle, Position } from '@xyflow/react';
import { useState } from 'react';
import { X } from 'lucide-react';

export function EmailNode({ data, id }: NodeProps<any>) {
  const isChildNode = id.includes('-') && id.split('-').length > 1;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <div className="group relative">
      <div className="px-16 py-4 rounded-full bg-white text-foreground 
                    border border-border shadow-lg backdrop-blur-sm
                    flex items-center justify-center min-w-[200px] relative
                    transition-all duration-200 hover:border-zinc-600
                    dark:bg-zinc-800 dark:border-zinc-600/50 dark:text-zinc-100">
        {isChildNode && (
          <Handle
            type="target"
            position={Position.Top}
            className="!bg-muted !w-3 !h-3 hover:!bg-muted/80 transition-colors"
          />
        )}

        <span className="text-lg font-medium">{data.label as string}</span>

        <button
          onClick={handleDelete}
          className="absolute -right-3 -top-3 p-1.5 rounded-full bg-background 
                    border border-border opacity-0 group-hover:opacity-100
                    transition-all duration-200 hover:bg-red-500/20 hover:border-red-500
                    hover:text-red-500 shadow-lg dark:bg-zinc-900/95 dark:border-zinc-700"
        >
          <X size={14} />
        </button>

        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-muted !w-3 !h-3 hover:!bg-muted/80 transition-colors"
        />
      </div>
    </div>
  );
}

export function DelayNode({ data, id }: NodeProps<any>) {
  const [isEditing, setIsEditing] = useState(false);
  const [days, setDays] = useState(() => {
    const isParentNode = !id.includes('-') || id.split('-').length === 2;
    const initialDays = isParentNode ? 0 : (data.label?.split(' ')[0] || 1);
    return typeof initialDays === 'number' ? initialDays : parseInt(initialDays);
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
      className="px-8 py-3 rounded-lg bg-white text-foreground 
                border border-border shadow-lg backdrop-blur-sm
                flex items-center gap-3 min-w-[140px] cursor-pointer 
                transition-all duration-200 hover:border-zinc-600
                dark:bg-zinc-800 dark:border-zinc-600/50 dark:text-zinc-100">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-muted !w-3 !h-3 hover:!bg-muted/80 transition-colors"
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
            min="0"
            max="7"
            className="w-12 bg-muted text-foreground text-lg font-medium 
                      rounded px-1 outline-none border border-border
                      focus:border-zinc-500"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-lg font-medium">{days}</span>
        )}
        <span className="text-lg font-medium">day{days !== 1 ? 's' : ''}</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-muted !w-3 !h-3 hover:!bg-muted/80 transition-colors"
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
      <div className="px-12 py-3 rounded-lg border-2 border-border
                    text-muted-foreground min-w-[120px] text-center
                    transition-all duration-200 hover:border-zinc-600
                    dark:border-zinc-600/50 dark:hover:border-zinc-500">
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-muted !w-3 !h-3 hover:!bg-muted/80 transition-colors"
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
    <div className="flex items-center gap-1">
      <div
        onClick={handleActionClick}
        className="px-8 py-3 rounded-l-lg border-2 border-dashed border-border
                  text-muted-foreground hover:bg-accent cursor-pointer
                  transition-all duration-200 hover:border-zinc-600
                  dark:border-zinc-600/50 dark:hover:border-zinc-500
                  dark:hover:bg-zinc-700/50">
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-zinc-600 !w-3 !h-3 hover:!bg-zinc-500 transition-colors"
        />
        <span className="text-lg">Add action</span>
      </div>

      <div
        onClick={() => setShowEnd(true)}
        className="px-8 py-3 rounded-r-lg border-2 border-dashed border-border
                  text-muted-foreground hover:bg-accent cursor-pointer
                  transition-all duration-200 hover:border-zinc-600
                  dark:border-zinc-600/50 dark:hover:border-zinc-500
                  dark:hover:bg-zinc-700/50">
        <span className="text-lg">End</span>
      </div>
    </div>
  );
}

export function LinkedInNode({ data, id }: NodeProps<any>) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <div className="group relative">
      <div className="px-16 py-4 rounded-full bg-zinc-900/95 text-white 
                    border border-zinc-700 shadow-lg backdrop-blur-sm
                    flex items-center justify-center min-w-[200px] relative
                    transition-all duration-200 hover:border-zinc-600">
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-zinc-600 !w-3 !h-3 hover:!bg-zinc-500 transition-colors"
        />

        <span className="text-lg font-medium">{data.label as string}</span>

        <button
          onClick={handleDelete}
          className="absolute -right-3 -top-3 p-1.5 rounded-full bg-zinc-900/95 
                    border border-zinc-700 opacity-0 group-hover:opacity-100
                    transition-all duration-200 hover:bg-red-500/20 hover:border-red-500
                    hover:text-red-500 shadow-lg"
        >
          <X size={14} />
        </button>

        <Handle
          id="source-left"
          type="source"
          position={Position.Left}
          className="!bg-zinc-600 !w-3 !h-3 hover:!bg-zinc-500 transition-colors !left-0"
        />

        <Handle
          id="source-right"
          type="source"
          position={Position.Right}
          className="!bg-zinc-600 !w-3 !h-3 hover:!bg-zinc-500 transition-colors !right-0"
        />
      </div>
    </div>
  );
}

