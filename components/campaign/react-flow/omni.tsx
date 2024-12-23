"use client"
import React, { useState, useCallback, useEffect } from 'react';
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
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SideBar from './SideBar';
import { PlusCircle, Undo2, Redo2, Trash2 } from 'lucide-react';
import { nodeTemplates } from './nodeTemplates';
import { EmailNode, DelayNode, ActionNode, LinkedInNode, DelayNode1 } from './CustomNodes';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CustomEdge extends Edge {
  sourceHandle?: string;
}

interface NodeData extends Record<string, unknown> {
  label?: string;
  days?: number;
  isEnd?: boolean;
  onChange?: (id: string, days: number) => void;
  onActionClick?: () => void;
  onEndClick?: () => void;
}

interface FlowData {
  nodes: Node<NodeData>[];
  edges: CustomEdge[];
}

function Omni() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const [isActionsEnabled, setIsActionsEnabled] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<{ nodes: Node<NodeData>[]; edges: CustomEdge[]; }[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const nodeTypes = {
    emailNode: EmailNode,
    delayNode: DelayNode,
    actionNode: ActionNode,
    linkedInNode: LinkedInNode,
    delayNode1: DelayNode1,
  } as const;

  const isHistoryNavigationRef = React.useRef(false);

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
      newEdges = template.edges.map((edge) => {
        let sourceNode, targetNode;

        if (edge.id.startsWith('linkedin-left')) {
          sourceNode = edge.source === 'linkedin-invite'
            ? newNodes[0]
            : newNodes[1];
          targetNode = edge.target.includes('delay')
            ? newNodes[1]
            : newNodes[2];
        } else {
          sourceNode = edge.source === 'linkedin-invite'
            ? newNodes[0]
            : newNodes[3];
          targetNode = edge.target.includes('delay')
            ? newNodes[3]
            : newNodes[4];
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

    const parentNode = nodes.find(node =>
      edges.some(edge => edge.target === activeNodeId && edge.source === node.id)
    );

    if (!parentNode) return;

    const template = nodeTemplates[action.type];
    if (!template) return;

    const newNodes = template.nodes.map((node, index) => ({
      ...node,
      id: `${node.id}-${Date.now()}-${index}`,
      position: {
        x: parentNode.position.x + (node.position.x - template.nodes[0].position.x),
        y: parentNode.position.y + node.position.y + 150,
      },
    }));

    let connectingEdges: CustomEdge[] = [];

    if (action.type === 'linkedin_invite') {
      connectingEdges = [
        {
          id: `e-connecting-parent-${Date.now()}`,
          source: parentNode.id,
          target: newNodes[0].id,
          type: 'smoothstep',
          style: {
            stroke: '#4f4f4f',
            strokeWidth: 2,
            opacity: 0.8
          },
        }
      ];

      const newEdges = template.edges.map(edge => {
        let sourceNode, targetNode;

        if (edge.id.startsWith('linkedin-left')) {
          sourceNode = edge.source === 'linkedin-invite'
            ? newNodes[0]
            : newNodes[1];
          targetNode = edge.target.includes('delay')
            ? newNodes[1]
            : newNodes[2];
        } else {
          sourceNode = edge.source === 'linkedin-invite'
            ? newNodes[0]
            : newNodes[3];
          targetNode = edge.target.includes('delay')
            ? newNodes[3]
            : newNodes[4];
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

      setNodes(nodes => nodes
        .filter(node => node.id !== activeNodeId)
        .concat(newNodes as Node<NodeData>[])
      );

      setEdges(edges => edges
        .filter(edge => edge.target !== activeNodeId)
        .concat([...connectingEdges, ...newEdges])
      );
    } else {
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

      setNodes(nodes => nodes
        .filter(node => node.id !== activeNodeId)
        .concat(newNodes as Node<NodeData>[])
      );

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

  const handleSaveFlow = async () => {
    try {
      const sortedNodes = [...nodes]
        .filter(node => !['delayNode', 'actionNode'].includes(node.type as string))
        .sort((a, b) => a.position.y - b.position.y);

      const steps: Record<string, any> = {};
      let stepCounter = 0;

      const processPath = (startNode: Node, pathNodes: Node[]): number[] => {
        const sequence: number[] = [];
        let currentNode = startNode;

        while (currentNode) {
          const nodeIndex = sortedNodes.indexOf(currentNode);
          if (nodeIndex !== -1) {
            sequence.push(nodeIndex);
          }

          const outgoingEdges = edges.filter(edge => edge.source === currentNode.id);
          const nextDelayNode = nodes.find(n => outgoingEdges[0]?.target === n.id);
          if (!nextDelayNode) break;

          const nextActionNode = nodes.find(n =>
            edges.some(e => e.source === nextDelayNode.id && e.target === n.id)
          );

          if (nextActionNode?.type === 'actionNode') {
            break;
          }

          currentNode = nextActionNode as any;
        }

        return sequence;
      };

      sortedNodes.forEach((node, index) => {
        const outgoingEdges = edges.filter(edge => edge.source === node.id);
        const incomingEdges = edges.filter(edge => edge.target === node.id);
        const nextNode = nodes.find(n => outgoingEdges[0]?.target === n.id);

        const delay = incomingEdges.length === 0 ? 0 : (nextNode?.data?.days || 0);

        if (node.type === 'linkedInNode') {
          const leftEdge = edges.find(e => e.sourceHandle === 'source-left' && e.source === node.id);
          const rightEdge = edges.find(e => e.sourceHandle === 'source-right' && e.source === node.id);

          const leftDelayNode = nodes.find(n => n.id === leftEdge?.target);
          const rightDelayNode = nodes.find(n => n.id === rightEdge?.target);

          const leftPathFirstNode = nodes.find(n =>
            edges.some(e => e.source === leftDelayNode?.id && e.target === n.id && !['delayNode', 'actionNode'].includes(n.type as string))
          );
          const rightPathFirstNode = nodes.find(n =>
            edges.some(e => e.source === rightDelayNode?.id && e.target === n.id && !['delayNode', 'actionNode'].includes(n.type as string))
          );

          const notAcceptedPath = leftPathFirstNode ? processPath(leftPathFirstNode, sortedNodes) : [];
          const acceptedPath = rightPathFirstNode ? processPath(rightPathFirstNode, sortedNodes) : [];

          steps[stepCounter] = {
            action_type: (node.data.label?.toLowerCase() as string).replace(/ /g, '_'),
            next_steps: {
              accepted: acceptedPath[0] || null,
              declined: null,
              default: notAcceptedPath[0] || null
            },
            delay: `${delay}d`,
          };
        } else {
          const outgoingEdges = edges.filter(edge => edge.source === node.id);
          const nextDelayNode = nodes.find(n => outgoingEdges[0]?.target === n.id);
          const nextActionNode = nodes.find(n =>
            edges.some(e => e.source === nextDelayNode?.id && e.target === n.id)
          );

          const nextStepIndex = nextActionNode?.type === 'actionNode' || !sortedNodes[index + 1]
            ? null
            : stepCounter + 1;

          steps[stepCounter] = {
            action_type: (node.data.label?.toLowerCase() as string).replace(/ /g, '_'),
            next_steps: {
              default: nextStepIndex
            },
            delay: `${delay}d`
          };
        }

        stepCounter++;
      });

      const flowData = {
        steps_config: {
          steps
        },
        flow_data: {
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: {
              label: node.data.label,
              days: node.data.days,
              isEnd: node.data.isEnd
            }
          })),
          edges: edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            type: edge.type,
            style: edge.style
          }))
        }
      };

      const response = await fetch('/api/campaigns/flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData),
      });

      if (!response.ok) {
        throw new Error('Failed to save flow');
      }

      toast.success('Flow saved successfully');
      console.log('Flow data:', JSON.stringify(flowData, null, 2));
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save flow');
    }
  };

  const handleUndo = useCallback(() => {
    if (nodes.length > 0) {
      const actionNodes = [...nodes]
        .filter(node => node.type === 'emailNode')
        .sort((a, b) => b.position.y - a.position.y);

      if (actionNodes.length > 1) {
        const lastActionNode = actionNodes[0];
        const nodesToRemove = new Set<string>();

        const connectedDelay = nodes.find(node =>
          node.type === 'delayNode' &&
          edges.some(edge =>
            edge.source === lastActionNode.id &&
            edge.target === node.id
          )
        );

        nodesToRemove.add(lastActionNode.id);
        if (connectedDelay) {
          nodesToRemove.add(connectedDelay.id);
        }

        const connectedAction = nodes.find(node =>
          node.type === 'actionNode' &&
          edges.some(edge =>
            edge.source === (connectedDelay?.id || lastActionNode.id) &&
            edge.target === node.id
          )
        );

        if (connectedAction) {
          nodesToRemove.add(connectedAction.id);
        }

        const updatedNodes = nodes.filter(node => !nodesToRemove.has(node.id));
        const updatedEdges = edges.filter(edge =>
          !nodesToRemove.has(edge.source) && !nodesToRemove.has(edge.target)
        );

        const previousEmailNode = actionNodes[1];
        const previousDelayNode = nodes.find(node =>
          node.type === 'delayNode' &&
          edges.some(edge =>
            edge.source === previousEmailNode.id &&
            edge.target === node.id
          )
        );

        if (previousDelayNode) {
          const actionNode: Node<NodeData> = {
            id: `action-${Date.now()}`,
            type: 'actionNode',
            position: {
              x: previousEmailNode.position.x,
              y: previousDelayNode.position.y + 150,
            },
            data: {}
          };

          const actionEdge: CustomEdge = {
            id: `e-${Date.now()}`,
            source: previousDelayNode.id,
            target: actionNode.id,
            type: 'smoothstep',
            style: {
              stroke: '#4f4f4f',
              strokeWidth: 2,
              opacity: 0.8
            }
          };

          isHistoryNavigationRef.current = true;
          setNodes([...updatedNodes, actionNode]);
          setEdges([...updatedEdges, actionEdge]);
          setCurrentHistoryIndex(prev => prev - 1);
        }
      } else if (actionNodes.length === 1) {
        const firstEmailNode = actionNodes[0];
        const firstDelay = nodes.find(node =>
          node.type === 'delayNode' &&
          edges.some(edge => edge.source === firstEmailNode.id && edge.target === node.id)
        );

        const nodesToKeep = new Set([firstEmailNode.id]);
        if (firstDelay) nodesToKeep.add(firstDelay.id);

        const updatedNodes = nodes.filter(node => nodesToKeep.has(node.id));
        const updatedEdges = edges.filter(edge =>
          nodesToKeep.has(edge.source) && nodesToKeep.has(edge.target)
        );

        setNodes(updatedNodes);
        setEdges(updatedEdges);
      }
    }
  }, [nodes, edges, currentHistoryIndex]);

  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const nextState = history[currentHistoryIndex + 1];
      isHistoryNavigationRef.current = true;
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setCurrentHistoryIndex(prev => prev + 1);
    }
  }, [currentHistoryIndex, history]);

  useEffect(() => {
    if (isHistoryNavigationRef.current) {
      isHistoryNavigationRef.current = false;
      return;
    }

    if (nodes.length === 0 && edges.length === 0) {
      setHistory([]);
      setCurrentHistoryIndex(-1);
      return;
    }

    const newState = { nodes, edges };
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  }, [nodes, edges]);

  const handleClearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setHistory([]);
    setCurrentHistoryIndex(-1);
    toast.success("Canvas cleared");
  }, [setNodes, setEdges]);

  const getExistingNodeTypes = useCallback(() => {
    return nodes
      .filter(node => node.type === 'emailNode' || node.type === 'linkedInNode')
      .map(node => {
        // Convert node labels to types
        const label = node.data.label?.toLowerCase().replace(/ /g, '_');
        switch (label) {
          case 'send_email':
            return 'send_email';
          case 'send_linkedin_invite':
            return 'linkedin_invite';
          default:
            return label;
        }
      });
  }, [nodes]);

  return (
    <div className='w-full flex flex-col'>
      <div className='w-full flex'>
        <div className='w-[300px]'>
          <SideBar
            isEnabled={isActionsEnabled}
            onActionSelect={activeNodeId ? handleActionSelect : handleInitialActionSelect}
            existingNodes={getExistingNodeTypes().filter((type): type is string => type !== undefined)}
          />
        </div>

        <div className='w-full min-h-[700px] border dark:border-white/20 border-zinc-800/30 relative'>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={nodes.length === 0}
              className="w-8 h-8"
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRedo}
              disabled={currentHistoryIndex === history.length - 1}
              className="w-8 h-8"
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearCanvas}
              disabled={nodes.length === 0}
              className="w-8 h-8"
              title="Clear Canvas"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

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
            nodeTypes={nodeTypes as NodeTypes}
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

      <div className="w-full flex justify-end p-4 border-t dark:border-white/20 border-zinc-800/30">
        <Button
          onClick={handleSaveFlow}
          disabled={nodes.length === 0}
          className="px-6"
        >
          Save Flow
        </Button>
      </div>
    </div>
  );
}

export default Omni;