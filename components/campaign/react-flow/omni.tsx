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
import NodeDetailsSidebar from './NodeDetailsSidebar';

function Omni() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Common node style
  const nodeStyle = {
    background: 'transparent',
    border: '2px solid #6b7280',
    borderRadius: '8px',
    padding: '10px',
  };

  const createInviteFlow = (baseX: number = 250, baseY: number = 100) => {
    const newNodes = [
      {
        id: 'invite-main',
        type: 'default',
        data: { 
          label: 'Send an invite',
          icon: '💌',
          status: 'pending',
          duration: '1 day'
        },
        position: { x: baseX, y: baseY },
        style: nodeStyle
      },
      {
        id: 'invite-pending',
        type: 'default',
        data: { 
          label: '1 day',
          status: 'Still not accepted',
          duration: '1 day',
        },
        position: { x: baseX - 150, y: baseY + 100 },
        style: nodeStyle
      },
      {
        id: 'invite-accepted',
        type: 'default',
        data: { 
          label: '1 day',
          status: 'Accepted',
          duration: '1 day',
        },
        position: { x: baseX + 150, y: baseY + 100 },
        style: nodeStyle
      },
    ];

    const newEdges = [
      {
        id: 'edge-main-pending',
        source: 'invite-main',
        target: 'invite-pending',
        label: 'Still not accepted',
        type: 'smoothstep',
      },
      {
        id: 'edge-main-accepted',
        source: 'invite-main',
        target: 'invite-accepted',
        label: 'Accepted',
        type: 'smoothstep',
      },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const createMessageFlow = (baseX: number = 250, baseY: number = 100) => {
    const newNodes = [
      {
        id: 'message-main',
        type: 'default',
        data: { 
          label: 'Message',
          icon: '✉️',
        },
        position: { x: baseX, y: baseY },
        style: nodeStyle
      },
      {
        id: 'message-sent',
        type: 'default',
        data: { 
          label: '2 days',
          status: 'No reply',
          duration: '2 days',
        },
        position: { x: baseX - 150, y: baseY + 100 },
        style: nodeStyle
      },
      {
        id: 'message-replied',
        type: 'default',
        data: { 
          label: '1 day',
          status: 'Replied',
          duration: '1 day',
        },
        position: { x: baseX + 150, y: baseY + 100 },
        style: nodeStyle
      },
    ];

    const newEdges = [
      {
        id: 'edge-message-sent',
        source: 'message-main',
        target: 'message-sent',
        label: 'No reply',
        type: 'smoothstep',
      },
      {
        id: 'edge-message-replied',
        source: 'message-main',
        target: 'message-replied',
        label: 'Replied',
        type: 'smoothstep',
      },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const createProfileFlow = (baseX: number = 250, baseY: number = 100) => {
    const newNodes = [
      {
        id: 'profile-main',
        type: 'default',
        data: { 
          label: 'View profile',
          icon: '👤',
        },
        position: { x: baseX, y: baseY },
        style: nodeStyle
      },
      {
        id: 'profile-viewed',
        type: 'default',
        data: { 
          label: '3 days',
          status: 'Viewed',
          duration: '3 days',
        },
        position: { x: baseX, y: baseY + 100 },
        style: nodeStyle
      }
    ];

    const newEdges = [
      {
        id: 'edge-profile-viewed',
        source: 'profile-main',
        target: 'profile-viewed',
        label: 'Viewed',
        type: 'smoothstep',
      }
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const createEndorseFlow = (baseX: number = 250, baseY: number = 100) => {
    const newNodes = [
      {
        id: 'endorse-main',
        type: 'default',
        data: { 
          label: 'Endorse skills',
          icon: '👍',
        },
        position: { x: baseX, y: baseY },
        style: nodeStyle
      },
      {
        id: 'endorse-pending',
        type: 'default',
        data: { 
          label: '2 days',
          status: 'Not reciprocated',
          duration: '2 days',
        },
        position: { x: baseX - 150, y: baseY + 100 },
        style: nodeStyle
      },
      {
        id: 'endorse-reciprocated',
        type: 'default',
        data: { 
          label: '1 day',
          status: 'Reciprocated',
          duration: '1 day',
        },
        position: { x: baseX + 150, y: baseY + 100 },
        style: nodeStyle
      }
    ];

    const newEdges = [
      {
        id: 'edge-endorse-pending',
        source: 'endorse-main',
        target: 'endorse-pending',
        label: 'Not reciprocated',
        type: 'smoothstep',
      },
      {
        id: 'edge-endorse-reciprocated',
        source: 'endorse-main',
        target: 'endorse-reciprocated',
        label: 'Reciprocated',
        type: 'smoothstep',
      }
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const createFollowFlow = (baseX: number = 250, baseY: number = 100) => {
    const newNodes = [
      {
        id: 'follow-main',
        type: 'default',
        data: { 
          label: 'Follow',
          icon: '➡️',
          status: 'pending',
          duration: '1 day'
        },
        position: { x: baseX, y: baseY },
        style: nodeStyle
      },
      {
        id: 'follow-pending',
        type: 'default',
        data: { 
          label: '2 days',
          status: 'Not following back',
          duration: '2 days',
        },
        position: { x: baseX - 150, y: baseY + 100 },
        style: nodeStyle
      },
      {
        id: 'follow-reciprocated',
        type: 'default',
        data: { 
          label: '1 day',
          status: 'Following back',
          duration: '1 day',
        },
        position: { x: baseX + 150, y: baseY + 100 },
        style: nodeStyle
      }
    ];

    const newEdges = [
      {
        id: 'edge-follow-pending',
        source: 'follow-main',
        target: 'follow-pending',
        label: 'Not following back',
        type: 'smoothstep',
      },
      {
        id: 'edge-follow-reciprocated',
        source: 'follow-main',
        target: 'follow-reciprocated',
        label: 'Following back',
        type: 'smoothstep',
      }
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const createLikeFlow = (baseX: number = 250, baseY: number = 100) => {
    const newNodes = [
      {
        id: 'like-main',
        type: 'default',
        data: { 
          label: 'Like a post',
          icon: '❤️',
          status: 'pending',
          duration: '1 day'
        },
        position: { x: baseX, y: baseY },
        style: nodeStyle
      },
      {
        id: 'like-pending',
        type: 'default',
        data: { 
          label: '2 days',
          status: 'Not liked back',
          duration: '2 days',
        },
        position: { x: baseX - 150, y: baseY + 100 },
        style: nodeStyle
      },
      {
        id: 'like-reciprocated',
        type: 'default',
        data: { 
          label: '1 day',
          status: 'Liked back',
          duration: '1 day',
        },
        position: { x: baseX + 150, y: baseY + 100 },
        style: nodeStyle
      }
    ];

    const newEdges = [
      {
        id: 'edge-like-pending',
        source: 'like-main',
        target: 'like-pending',
        label: 'Not liked back',
        type: 'smoothstep',
      },
      {
        id: 'edge-like-reciprocated',
        source: 'like-main',
        target: 'like-reciprocated',
        label: 'Liked back',
        type: 'smoothstep',
      }
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleCreateNode = (type: string) => {
    switch (type) {
      case 'invite':
        createInviteFlow();
        break;
      case 'message':
        createMessageFlow();
        break;
      case 'profile':
        createProfileFlow();
        break;
      case 'endorse':
        createEndorseFlow();
        break;
      case 'follow':
        createFollowFlow();
        break;
      case 'like':
        createLikeFlow();
        break;
      default:
        // Default node creation if needed
        const newNode = {
          id: `${type}-${Date.now()}`,
          type: 'default',
          position: { x: Math.random() * 500, y: Math.random() * 300 },
          data: { 
            label: type.charAt(0).toUpperCase() + type.slice(1),
            status: 'pending',
            duration: '1 day'
          },
          style: {
            background: 'transparent',
            border: '2px solid #6b7280',
            borderRadius: '8px',
            padding: '10px',
          }
        };
        setNodes((nds) => [...nds, newNode]);
    }
  };

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const onNodeUpdate = (nodeId: string, newData: any) => {
    if (newData.status === 'deleted') {
      setEdges((eds) => 
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setSelectedNode(null);
      return;
    }

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              ...newData
            }
          };
          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return node;
      })
    );
  };

  return (
    <div className='w-full flex'>
      <div className='w-[300px]'>
        <SideBar onActionClick={handleCreateNode} />
      </div>
      
      <div className='w-full min-h-[700px] border dark:border-white/20 border-zinc-800/30'>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
          fitView
        >
          <Background />
        </ReactFlow>
      </div>

      <div className='w-[300px] border-l dark:border-white/20 border-zinc-800/30'>
        <NodeDetailsSidebar 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)}
          onUpdate={onNodeUpdate}
          onCreateNode={handleCreateNode}
        />
      </div>
    </div>
  );
}



export default Omni;