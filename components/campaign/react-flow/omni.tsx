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
import { EmailNode, DelayNode, ActionNode, LinkedInNode, DelayNode1 } from './CustomNodes';

// Define the edge type with sourceHandle
interface CustomEdge extends Edge {
  sourceHandle?: string;
}

// Update NodeData interface to extend Record<string, unknown>
interface NodeData extends Record<string, unknown> {
  label?: string;
  days?: number;
  isEnd?: boolean;
  onChange?: (id: string, days: number) => void;
  onActionClick?: () => void;
  onEndClick?: () => void;
}

function Omni() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const [isActionsEnabled, setIsActionsEnabled] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const nodeTypes = {
    emailNode: EmailNode,
    delayNode: DelayNode,
    actionNode: ActionNode,
    linkedInNode: LinkedInNode,
    delayNode1: DelayNode1,
  } as const;

  const handleInitialActionSelect = (action: { type: string; label: string }) => {
    const template = nodeTemplates[action.type];
    if (!template) return;

    const newNodes = template.nodes.map((node) => ({
      ...node,
      id: `${node.id}-${Date.now()}`,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
      data: {
        ...node.data,
        label: node.data.label || '',
      },
    }));

    let newEdges;

    if (action.type === 'linkedin_invite') {
      // Special handling for LinkedIn template edges
      newEdges = template.edges.map((edge) => {
        let sourceNode, targetNode;

        // Handle left branch edges
        if (edge.id.startsWith('linkedin-left')) {
          sourceNode = edge.source === 'linkedin-invite'
            ? newNodes[0]  // LinkedIn node
            : newNodes[1]; // Left delay node
          targetNode = edge.target.includes('delay')
            ? newNodes[1]  // Left delay node
            : newNodes[2]; // Left action node
        }
        // Handle right branch edges
        else {
          sourceNode = edge.source === 'linkedin-invite'
            ? newNodes[0]  // LinkedIn node
            : newNodes[3]; // Right delay node
          targetNode = edge.target.includes('delay')
            ? newNodes[3]  // Right delay node
            : newNodes[4]; // Right action node
        }

        return {
          ...edge,
          id: `${edge.id}-${Date.now()}`,
          source: sourceNode?.id || '',
          target: targetNode?.id || '',
          sourceHandle: edge.sourceHandle,
          style: {
            stroke: '#4f4f4f',
            strokeWidth: 2,
            opacity: 0.8
          },
        } as CustomEdge;
      });
    } else {
      // Regular handling for other templates
      newEdges = template.edges.map((edge) => {
        const sourceNode = newNodes.find((n) =>
          n.id.includes(edge.source.split('-')[0])
        );
        const targetNode = newNodes.find((n) =>
          n.id.includes(edge.target.split('-')[0])
        );

        return {
          ...edge,
          id: `${edge.id}-${Date.now()}`,
          source: sourceNode?.id || '',
          target: targetNode?.id || '',
          sourceHandle: edge.sourceHandle,
          style: {
            stroke: '#4f4f4f',
            strokeWidth: 2,
            opacity: 0.8
          },
        } as CustomEdge;
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setIsActionsEnabled(false);
  };

  const handleActionClick = (nodeId?: string) => {
    setIsActionsEnabled(true);
    setActiveNodeId(nodeId || null);
  };

  const handleActionSelect = (action: { type: string; label: string }) => {
    if (!activeNodeId) {
      handleInitialActionSelect(action);
      return;
    }

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
      id: `${node.id}-${Date.now()}-${index}`,
      position: {
        x: parentNode.position.x + (node.position.x - template.nodes[0].position.x),
        y: parentNode.position.y + node.position.y + 150,
      },
    }));

    // Create connecting edges based on template type
    let connectingEdges: CustomEdge[] = [];

    if (action.type === 'linkedin_invite') {
      // For LinkedIn template, create single connecting edge from parent to LinkedIn node
      connectingEdges = [
        {
          id: `e-connecting-parent-${Date.now()}`,
          source: parentNode.id,
          target: newNodes[0].id, // Connect to LinkedIn node
          type: 'smoothstep',
          style: {
            stroke: '#4f4f4f',
            strokeWidth: 2,
            opacity: 0.8
          },
        }
      ];

      // Create edges between new nodes
      const newEdges = template.edges.map(edge => {
        let sourceNode, targetNode;
        
        // Handle left branch edges
        if (edge.id.startsWith('linkedin-left')) {
          sourceNode = edge.source === 'linkedin-invite'
            ? newNodes[0]  // LinkedIn node
            : newNodes[1]; // Left delay node
          targetNode = edge.target.includes('delay')
            ? newNodes[1]  // Left delay node
            : newNodes[2]; // Left action node
        } 
        // Handle right branch edges
        else {
          sourceNode = edge.source === 'linkedin-invite'
            ? newNodes[0]  // LinkedIn node
            : newNodes[3]; // Right delay node
          targetNode = edge.target.includes('delay')
            ? newNodes[3]  // Right delay node
            : newNodes[4]; // Right action node
        }

        return {
          ...edge,
          id: `${edge.id}-${Date.now()}`,
          source: sourceNode?.id || '',
          target: targetNode?.id || '',
          sourceHandle: edge.sourceHandle,
          style: {
            stroke: '#4f4f4f',
            strokeWidth: 2,
            opacity: 0.8
          },
        } as CustomEdge;
      });

      // Remove the original action node and its incoming edge
      setNodes(nodes => nodes
        .filter(node => node.id !== activeNodeId)
        .concat(newNodes)
      );

      // Remove old edges and add new ones including the connecting edges
      setEdges(edges => edges
        .filter(edge => edge.target !== activeNodeId)
        .concat([...connectingEdges, ...newEdges])
      );
    } else {
      // For other templates, create single connecting edge
      connectingEdges = [
        {
          id: `e-connecting-${Date.now()}`,
          source: parentNode.id,
          target: newNodes[0].id,
          type: 'smoothstep',
          style: {
            stroke: '#4f4f4f',
            strokeWidth: 2,
            opacity: 0.8
          },
        },
      ];

      // Create edges between new nodes
      const newEdges = template.edges.map(edge => {
        const sourceNode = newNodes.find(n =>
          n.id.includes(edge.source.split('-')[0])
        );
        const targetNode = newNodes.find(n =>
          n.id.includes(edge.target.split('-')[0])
        );

        return {
          ...edge,
          id: `${edge.id}-${Date.now()}`,
          source: sourceNode?.id || '',
          target: targetNode?.id || '',
          sourceHandle: edge.sourceHandle,
          style: {
            stroke: '#4f4f4f',
            strokeWidth: 2,
            opacity: 0.8
          },
        } as CustomEdge;
      });

      // Remove the original action node and its incoming edge
      setNodes(nodes => nodes
        .filter(node => node.id !== activeNodeId)
        .concat(newNodes)
      );

      // Remove old edges and add new ones including the connecting edges
      setEdges(edges => edges
        .filter(edge => edge.target !== activeNodeId)
        .concat([...connectingEdges, ...newEdges])
      );
    }

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

  const handleDelayChange = useCallback((nodeId: string, days: number) => {
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
  }, []);

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