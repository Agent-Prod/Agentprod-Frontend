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
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const nodeTypes = {
    emailNode: EmailNode,
    delayNode: DelayNode,
    actionNode: ActionNode,
  };

  const handleInitialActionSelect = (action: { type: string; label: string }) => {
    const template = nodeTemplates[action.type];
    if (!template) return;

    // Add template nodes with centered positioning
    const newNodes = template.nodes.map((node, index) => ({
      ...node,
      id: `${node.id}-${Date.now()}`,
      position: {
        x: 250, // Center position
        y: index * 150, // Stack vertically
      },
    }));

    // Add template edges
    const newEdges = template.edges.map(edge => ({
      ...edge,
      id: `${edge.id}-${Date.now()}`,
      source: newNodes.find(n => n.id.includes(edge.source.split('-')[0]))?.id,
      target: newNodes.find(n => n.id.includes(edge.target.split('-')[0]))?.id,
    }));

    setNodes(newNodes);
    setEdges(newEdges);
    setIsActionsEnabled(false);
  };

  const handleActionClick = (nodeId?: string) => {
    setIsActionsEnabled(true);
    setActiveNodeId(nodeId || null);
  };

  const handleActionSelect = (action: { type: string; label: string }) => {
    if (!activeNodeId) return;

    // Find the parent delay node
    const parentNode = nodes.find(node => 
      edges.some(edge => edge.target === activeNodeId && edge.source === node.id)
    );

    if (!parentNode) return;

    // Get the template
    const template = nodeTemplates[action.type];
    if (!template) return;

    // Calculate new positions based on parent node
    const newNodes = template.nodes.map((node, index) => ({
      ...node,
      id: `${node.id}-${Date.now()}`, // Ensure unique IDs
      position: {
        x: parentNode.position.x,
        y: parentNode.position.y + 150 + (index * 150), // Stack vertically
      },
    }));

    // Create new edges
    const newEdges = [
      // Connect parent delay to new email node
      {
        id: `e-${Date.now()}-1`,
        source: parentNode.id,
        target: newNodes[0].id,
        type: 'smoothstep',
        label: 'Still not accepted',
        style: { stroke: '#4f4f4f', strokeWidth: 2 },
        labelStyle: { fill: '#9f9f9f', fontSize: 12 },
        labelBgStyle: { fill: '#18181b' },
      },
      // Connect template nodes
      ...template.edges.map(edge => ({
        ...edge,
        id: `${edge.id}-${Date.now()}`,
        source: newNodes.find(n => n.id.includes(edge.source.split('-')[0]))?.id,
        target: newNodes.find(n => n.id.includes(edge.target.split('-')[0]))?.id,
      })),
    ];

    // Remove the original action node
    setNodes(nodes => nodes
      .filter(node => node.id !== activeNodeId)
      .concat(newNodes)
    );

    // Remove edges to the original action node and add new edges
    setEdges(edges => edges
      .filter(edge => edge.target !== activeNodeId)
      .concat(newEdges)
    );

    setIsActionsEnabled(false);
    setActiveNodeId(null);
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
          onActionSelect={activeNodeId ? handleActionSelect : handleInitialActionSelect}
        />
      </div>
      
      <div className='w-full min-h-[700px] border dark:border-white/20 border-zinc-800/30 relative'>
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              onActionClick: () => handleActionClick(node.id),
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

        >
          <Background />
        </ReactFlow>
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              onClick={() => handleActionClick()}
              className="px-8 py-3 rounded-lg border-2 border-dashed border-zinc-700
                        text-zinc-400 hover:bg-zinc-800/50 cursor-pointer"
            >
              <span className="text-lg">Add action</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



export default Omni;