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

  const createInviteFlow = (baseX: number = 250, baseY: number = 100) => {
    const newNodes = [
      {
        id: 'invite-main',
        type: 'default',
        data: { 
          label: 'Send an invite',
          icon: '💌',
        },
        position: { x: baseX, y: baseY },
        style: { background: 'transparent' },
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
        style: { background: 'transparent' },
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
        style: { background: 'transparent' },
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
        style: { background: 'transparent' },
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
        style: { background: 'transparent' },
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
        style: { background: 'transparent' },
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
        style: { background: 'transparent' },
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
        style: { background: 'transparent' },
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
        style: { background: 'transparent' },
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
        style: { background: 'transparent' },
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
        style: { background: 'transparent' },
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

  const handleCreateNode = (type: string) => {
    switch(type) {
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

        break;
      case 'like':

        break;
      default:
        break;
    }
  };

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
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
          // nodeTypes={}
          defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
          fitView
        >
        
          <Background />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className='w-[300px]'>
          <NodeDetailsSidebar 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)}
            onUpdate={(node) => {
              const updatedNodes = nodes.map((n) => {
                if (n.id === node.id) {
                  return { ...n, data: { ...n.data, ...node.data } };
                }
                return n;
              });
              setNodes(updatedNodes);
            }}
          />
        </div>
      )}
    </div>
  );
}



export default Omni;