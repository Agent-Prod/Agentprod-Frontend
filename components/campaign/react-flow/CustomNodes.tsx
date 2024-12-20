import { NodeProps, Handle, Position } from '@xyflow/react';
import { useState } from 'react';

export function EmailNode({ data }: NodeProps) {
  return (
    <div className="px-12 py-4 rounded-full bg-zinc-900 text-white border border-zinc-800
                    flex items-center justify-center min-w-[200px]">
      <Handle type="source" position={Position.Bottom} />
      <span className="text-sm font-medium">{data.label}</span>
    </div>
  );
}

export function DelayNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-2 rounded-lg bg-zinc-900 text-white border border-zinc-800
                    flex items-center gap-2">
      <Handle type="target" position={Position.Top} />
      <div className="w-4 h-4">⏱️</div>
      <span className="text-sm">{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function ActionNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-2 rounded-lg border-2 border-dashed border-zinc-700
                    text-zinc-400 hover:bg-zinc-800/50 cursor-pointer">
      <Handle type="target" position={Position.Top} />
      <span className="text-sm">{data.label}</span>
    </div>
  );
}

export function ActionEndNode({ data }: NodeProps) {
  const [showEnd, setShowEnd] = useState(false);

  if (showEnd) {
    return (
      <div className="px-6 py-2 rounded-lg border-2 border-dashed border-zinc-700
                    text-zinc-400">
        <Handle type="target" position={Position.Top} style={{ background: '#4f4f4f' }} />
        <span className="text-sm">End</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div 
        onClick={() => data.onActionClick?.()}
        className="px-6 py-2 rounded-lg border-2 border-dashed border-zinc-700
                  text-zinc-400 hover:bg-zinc-800/50 cursor-pointer"
      >
        <Handle type="target" position={Position.Top} style={{ background: '#4f4f4f' }} />
        <span className="text-sm">Add action</span>
      </div>
      <div 
        onClick={() => setShowEnd(true)}
        className="px-6 py-2 rounded-lg border-2 border-dashed border-zinc-700
                  text-zinc-400 hover:bg-zinc-800/50 cursor-pointer"
      >
        <span className="text-sm">End</span>
      </div>
    </div>
  );
} 