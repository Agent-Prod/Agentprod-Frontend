import { NodeProps, Handle, Position } from '@xyflow/react';
import { useState } from 'react';

export function EmailNode({ data }: NodeProps) {
  return (
    <div className="px-12 py-4 rounded-full bg-zinc-900 text-white border border-zinc-800
                    flex items-center justify-center min-w-[200px]">
      <Handle type="source" position={Position.Bottom} />
      <span className="text-sm font-medium">{data.label as string}</span>
    </div>
  );
}

export function DelayNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-2 rounded-lg bg-zinc-900 text-white border border-zinc-800
                    flex items-center gap-2">
      <Handle type="target" position={Position.Top} />
      <div className="w-4 h-4">⏱️</div>
      <span className="text-sm">{data.label as string}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function ActionNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-2 rounded-lg border-2 border-dashed border-zinc-700
                    text-zinc-400 hover:bg-zinc-800/50 cursor-pointer">
      <Handle type="target" position={Position.Top} />
      <span className="text-sm">{data.label as string}</span>
    </div>
  );
}

