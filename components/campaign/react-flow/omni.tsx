"use client"
import React, { useState, useCallback } from 'react';
import { 
  ReactFlow,
  Controls, 
  Background,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SideBar from './SideBar';
import { PlusCircle } from 'lucide-react';
import { nodeTemplates } from './nodeTemplates';
import { EmailNode, DelayNode, ActionNode } from './CustomNodes';

function Omni() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [isActionsEnabled, setIsActionsEnabled] = useState(false);

  const nodeTypes = {
    emailNode: EmailNode,
    delayNode: DelayNode,
    actionNode: ActionNode,
  };

  const handleActionClick = () => {
    setIsActionsEnabled(true);
  };

  const handleEndClick = (nodeId: string) => {
    setNodes(nodes => nodes.map(node => 
      node.id === nodeId 
        ? {
            ...node,
            data: { ...node.data, isEnd: true },
          }
        : node
    ));
  };

  const handleActionSelect = (action: { label: string; type: string }) => {
    const template = nodeTemplates[action.type];
    if (template) {
      setNodes(template.nodes);
      setEdges(template.edges);
      setIsActionsEnabled(false);
    }
  };

  const handleDelayChange = (nodeId: string, days: number) => {
    setNodes(nodes => nodes.map(node => 
      node.id === nodeId 
        ? {
            ...node,
            data: { 
              ...node.data, 
              label: `${days} day${days > 1 ? 's' : ''}`,
              days 
            }
          }
        : node
    ));
  };

  return (
    <div className='w-full flex'>
      <div className='w-[300px]'>
        <SideBar 
          isEnabled={isActionsEnabled} 
          onActionSelect={handleActionSelect}
        />
      </div>
      
      <div className='w-full min-h-[700px] border dark:border-white/20 border-zinc-800/30 relative'>
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              onActionClick: () => handleActionClick(),
              onEndClick: () => handleEndClick(node.id),
              onChange: handleDelayChange,
            },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            style: { stroke: '#4f4f4f', strokeWidth: 2 },
            type: 'smoothstep',
          }}
          fitView
        >
          <Background />
        </ReactFlow>
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              onClick={handleActionClick}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 
                        rounded-lg px-8 py-3 text-zinc-500 dark:text-zinc-400
                        hover:bg-zinc-100 dark:hover:bg-zinc-800/50 
                        transition-colors cursor-pointer">
              Add action
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



export default Omni;