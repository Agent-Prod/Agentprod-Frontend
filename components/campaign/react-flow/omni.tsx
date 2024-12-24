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
import { PlusCircle, Undo2, Redo2, Trash2, Mail, Linkedin } from 'lucide-react';
import { nodeTemplates } from './nodeTemplates';
import { EmailNode, DelayNode, ActionNode, LinkedInNode, DelayNode1 } from './CustomNodes';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragEvent } from 'react';
import { cn } from "@/lib/utils";

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
  onDelete?: (id: string) => void;
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
  const [draggedAction, setDraggedAction] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
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

  const calculateNodePosition = (delayNode: Node, template: any) => {
    // Calculate center alignment based on the delay node
    const centerX = delayNode.position.x;

    // For LinkedIn nodes that have multiple paths, adjust x position
    const isLinkedInNode = template.nodes[0].type === 'linkedInNode';
    const xOffset = isLinkedInNode ? -100 : 0; // Adjust LinkedIn nodes slightly to the left

    return {
      x: centerX + xOffset,
      y: delayNode.position.y + 200, // Increased vertical spacing
    };
  };

  const handleActionSelect = (action: { type: string; label: string }) => {
    if (!nodes.length) {
      handleInitialActionSelect(action);
      return;
    }

    const lastActionNode = [...nodes]
      .filter(node => !['delayNode', 'actionNode'].includes(node.type as string))
      .reduce((prev, current) =>
        prev.position.y > current.position.y ? prev : current
      );

    if (!lastActionNode) return;

    const delayNode = nodes.find(node =>
      node.type === 'delayNode' &&
      edges.some(edge => edge.source === lastActionNode.id && edge.target === node.id)
    );

    if (!delayNode) return;

    const actionNodeToRemove = nodes.find(node =>
      node.type === 'actionNode' &&
      edges.some(edge => edge.source === delayNode.id && edge.target === node.id)
    );

    if (actionNodeToRemove) {
      setNodes(nodes => nodes.filter(node => node.id !== actionNodeToRemove.id));
      setEdges(edges => edges.filter(edge => edge.target !== actionNodeToRemove.id));
    }

    const template = nodeTemplates[action.type];
    if (!template) return;

    const basePosition = calculateNodePosition(delayNode, template);

    if (action.type === 'linkedin_invite') {
      // Create LinkedIn invite node
      const linkedInNode = {
        ...template.nodes[0],
        id: `linkedin-invite-${Date.now()}`,
        position: basePosition,
        data: {
          ...template.nodes[0].data,
          label: template.nodes[0].data.label || '',
        }
      };

      // Create left path (not accepted)
      const leftDelayNode = {
        ...template.nodes[1],
        id: `delay-left-${Date.now()}`,
        position: {
          x: basePosition.x - 200,
          y: basePosition.y + 150
        },
        data: {
          ...template.nodes[1].data,
          label: '1 day',
          days: 1
        }
      };

      const leftActionNode = {
        ...template.nodes[2],
        id: `action-left-${Date.now()}`,
        position: {
          x: basePosition.x - 200,
          y: basePosition.y + 250
        },
        data: {
          ...template.nodes[2].data,
        }
      };

      // Create right path (accepted)
      const rightDelayNode = {
        ...template.nodes[3],
        id: `delay-right-${Date.now()}`,
        position: {
          x: basePosition.x + 200,
          y: basePosition.y + 150
        },
        data: {
          ...template.nodes[3].data,
          label: '1 day',
          days: 1
        }
      };

      const rightActionNode = {
        ...template.nodes[4],
        id: `action-right-${Date.now()}`,
        position: {
          x: basePosition.x + 200,
          y: basePosition.y + 250
        },
        data: {
          ...template.nodes[4].data,
        }
      };

      // Create edges
      const connectingEdge: CustomEdge = {
        id: `e-connecting-${Date.now()}`,
        source: delayNode.id,
        target: linkedInNode.id,
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        }
      };

      const leftPathEdge: CustomEdge = {
        id: `e-left-${Date.now()}`,
        source: linkedInNode.id,
        target: leftDelayNode.id,
        sourceHandle: 'source-left',
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        }
      };

      const leftActionEdge: CustomEdge = {
        id: `e-left-action-${Date.now()}`,
        source: leftDelayNode.id,
        target: leftActionNode.id,
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        }
      };

      const rightPathEdge: CustomEdge = {
        id: `e-right-${Date.now()}`,
        source: linkedInNode.id,
        target: rightDelayNode.id,
        sourceHandle: 'source-right',
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        }
      };

      const rightActionEdge: CustomEdge = {
        id: `e-right-action-${Date.now()}`,
        source: rightDelayNode.id,
        target: rightActionNode.id,
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        }
      };

      // Add all nodes and edges
      setNodes(prevNodes => [
        ...prevNodes,
        linkedInNode,
        leftDelayNode,
        leftActionNode,
        rightDelayNode,
        rightActionNode
      ]);

      setEdges(prevEdges => [
        ...prevEdges,
        connectingEdge,
        leftPathEdge,
        leftActionEdge,
        rightPathEdge,
        rightActionEdge
      ]);
    } else {
      // Handle regular nodes
      const newNodes = template.nodes.map((node, index) => ({
        ...node,
        id: `${node.id}-${Date.now()}`,
        position: {
          x: basePosition.x + (node.position.x - template.nodes[0].position.x),
          y: basePosition.y + (index * 100),
        },
        data: {
          ...node.data,
          label: node.data.label || '',
        },
      }));

      const connectingEdge: CustomEdge = {
        id: `e-connecting-${Date.now()}`,
        source: delayNode.id,
        target: newNodes[0].id,
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        },
      };

      const newEdges = template.edges.map((edge) => {
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

      setNodes(prevNodes => [...prevNodes, ...newNodes]);
      setEdges(prevEdges => [...prevEdges, connectingEdge, ...newEdges]);
    }

    setIsActionsEnabled(true);
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
        .filter(node => !['delayNode', 'actionNode'].includes(node.type as string))
        .sort((a, b) => b.position.y - a.position.y);

      if (actionNodes.length > 1) {
        const lastActionNode = actionNodes[0];
        const nodesToRemove = new Set<string>();
        const edgesToRemove = new Set<string>();

        // Find all nodes to remove
        const findConnectedNodes = (nodeId: string) => {
          edges.forEach(edge => {
            if (edge.source === nodeId) {
              nodesToRemove.add(edge.target);
              edgesToRemove.add(edge.id);
              findConnectedNodes(edge.target);
            }
            if (edge.target === nodeId) {
              edgesToRemove.add(edge.id);
            }
          });
        };

        nodesToRemove.add(lastActionNode.id);
        findConnectedNodes(lastActionNode.id);

        const updatedNodes = nodes.filter(node => !nodesToRemove.has(node.id));
        const updatedEdges = edges.filter(edge => !edgesToRemove.has(edge.id));

        // Find the last remaining delay node that isn't being removed
        const lastDelayNode = updatedNodes
          .filter(node =>
            node.type === 'delayNode' &&
            !nodesToRemove.has(node.id) &&
            edges.some(edge => !edgesToRemove.has(edge.id) && edge.target === node.id)
          )
          .reduce((prev, current) =>
            !prev || prev.position.y < current.position.y ? current : prev
            , undefined as Node<NodeData> | undefined);

        // If no delay node found, use the last action node
        const sourceNode = lastDelayNode || updatedNodes
          .filter(node => !['delayNode', 'actionNode'].includes(node.type as string))
          .reduce((prev, current) =>
            !prev || prev.position.y < current.position.y ? current : prev
            , undefined as Node<NodeData> | undefined);

        if (sourceNode) {
          // Add action node to the last node
          const actionNode: Node<NodeData> = {
            id: `action-${Date.now()}`,
            type: 'actionNode',
            position: {
              x: sourceNode.position.x,
              y: sourceNode.position.y + 150,
            },
            data: {}
          };

          const actionEdge: CustomEdge = {
            id: `e-${Date.now()}`,
            source: sourceNode.id,
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
        } else {
          // If no nodes remain, clear everything
          isHistoryNavigationRef.current = true;
          setNodes([]);
          setEdges([]);
        }
        setCurrentHistoryIndex(prev => prev - 1);
      }
    }
  }, [nodes, edges]);

  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const nextState = history[currentHistoryIndex + 1];

      // Find the last node in the next state
      const lastNode = nextState.nodes.reduce((prev, current) =>
        prev.position.y > current.position.y ? prev : current
      );

      // Check if the last node is not an action node
      if (lastNode && lastNode.type !== 'actionNode') {
        // Add action node to the last node
        const actionNode: Node<NodeData> = {
          id: `action-${Date.now()}`,
          type: 'actionNode',
          position: {
            x: lastNode.position.x,
            y: lastNode.position.y + 150,
          },
          data: {}
        };

        const actionEdge: CustomEdge = {
          id: `e-${Date.now()}`,
          source: lastNode.id,
          target: actionNode.id,
          type: 'smoothstep',
          style: {
            stroke: '#4f4f4f',
            strokeWidth: 2,
            opacity: 0.8
          }
        };

        isHistoryNavigationRef.current = true;
        setNodes([...nextState.nodes, actionNode]);
        setEdges([...nextState.edges, actionEdge]);
      } else {
        isHistoryNavigationRef.current = true;
        setNodes(nextState.nodes);
        setEdges(nextState.edges);
      }

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

  const getLastNodePosition = () => {
    if (nodes.length === 0) return { x: 250, y: 100 };

    const actionNodes = nodes.filter(node =>
      ['emailNode', 'linkedInNode'].includes(node.type as string)
    );

    if (actionNodes.length === 0) return { x: 250, y: 100 };

    const lastNode = actionNodes.reduce((prev, current) =>
      prev.position.y > current.position.y ? prev : current
    );

    return {
      x: lastNode.position.x,
      y: lastNode.position.y + 200 // Add spacing between nodes
    };
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, action: { type: string; label: string }) => {
    e.dataTransfer.setData('actionType', action.type);
    e.dataTransfer.setData('actionLabel', action.label);
    setDraggedAction(action.type);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const actionType = e.dataTransfer.getData('actionType');
    const actionLabel = e.dataTransfer.getData('actionLabel');

    if (nodes.length > 0) {
      const lastActionNode = [...nodes]
        .filter(node => !['delayNode', 'actionNode'].includes(node.type as string))
        .reduce((prev, current) =>
          prev.position.y > current.position.y ? prev : current
        );

      if (lastActionNode) {
        const delayNode = nodes.find(node =>
          node.type === 'delayNode' &&
          edges.some(edge => edge.source === lastActionNode.id && edge.target === node.id)
        );

        if (!delayNode) return;

        const actionNodeToRemove = nodes.find(node =>
          node.type === 'actionNode' &&
          edges.some(edge => edge.source === delayNode.id && edge.target === node.id)
        );

        if (actionNodeToRemove) {
          setNodes(nodes => nodes.filter(node => node.id !== actionNodeToRemove.id));
          setEdges(edges => edges.filter(edge => edge.target !== actionNodeToRemove.id));
        }

        const template = nodeTemplates[actionType];
        if (template) {
          const basePosition = calculateNodePosition(delayNode, template);

          const newNodes = template.nodes.map((node, index) => ({
            ...node,
            id: `${node.id}-${Date.now()}`,
            position: {
              x: basePosition.x + (node.position.x - template.nodes[0].position.x),
              y: basePosition.y + (index * 100),
            },
            data: {
              ...node.data,
              label: node.data.label || '',
            },
          }));

          const connectingEdge: CustomEdge = {
            id: `e-connecting-${Date.now()}`,
            source: delayNode.id,
            target: newNodes[0].id,
            type: 'smoothstep',
            style: {
              stroke: '#4f4f4f',
              strokeWidth: 2,
              opacity: 0.8
            },
          };

          const newEdges = template.edges.map((edge) => {
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

          setNodes(prevNodes => [...prevNodes, ...newNodes]);
          setEdges(prevEdges => [...prevEdges, connectingEdge, ...newEdges]);
        }
      }
    } else {
      handleInitialActionSelect({ type: actionType, label: actionLabel });
    }

    setDraggedAction(null);
    setIsActionsEnabled(true);
  };

  const handleNodeDelete = useCallback((nodeId: string) => {
    const nodesToRemove = new Set<string>();
    const edgesToRemove = new Set<string>();
    let lastRemainingNode: Node | null = null;

    // Find all downstream nodes to remove
    const findDownstreamNodes = (currentNodeId: string) => {
      edges.forEach(edge => {
        if (edge.source === currentNodeId) {
          edgesToRemove.add(edge.id);
          nodesToRemove.add(edge.target);
          findDownstreamNodes(edge.target);
        }
      });

      edges.forEach(edge => {
        if (edge.target === currentNodeId) {
          edgesToRemove.add(edge.id);
        }
      });
    };

    nodesToRemove.add(nodeId);
    findDownstreamNodes(nodeId);

    // Find the last remaining node after deletion
    const remainingNodes = nodes.filter(node => !nodesToRemove.has(node.id));
    if (remainingNodes.length > 0) {
      lastRemainingNode = remainingNodes.reduce((prev, current) =>
        prev.position.y > current.position.y ? prev : current
      );
    }

    // Add action node to the last remaining node
    if (lastRemainingNode) {
      const actionNode: Node<NodeData> = {
        id: `action-${Date.now()}`,
        type: 'actionNode',
        position: {
          x: lastRemainingNode.position.x,
          y: lastRemainingNode.position.y + 150,
        },
        data: {}
      };

      const actionEdge: CustomEdge = {
        id: `e-${Date.now()}`,
        source: lastRemainingNode.id,
        target: actionNode.id,
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        }
      };

      setNodes(prevNodes => [
        ...prevNodes.filter(node => !nodesToRemove.has(node.id)),
        actionNode
      ]);
      setEdges(prevEdges => [
        ...prevEdges.filter(edge => !edgesToRemove.has(edge.id)),
        actionEdge
      ]);
    } else {
      setNodes([]);
      setEdges([]);
    }

    if (activeNodeId === nodeId) {
      setIsActionsEnabled(false);
      setActiveNodeId(null);
    }
  }, [edges, nodes, activeNodeId]);

  return (
    <Card className="w-full flex flex-col bg-background border rounded-none">
      <div className="w-full flex h-[calc(80vh-64px)]">
        <div className="w-[280px] border-r dark:border-white/10 border-zinc-200 flex flex-col">
          <div className="p-4 border-b dark:border-white/10 border-zinc-200">
            <h3 className="text-[15.5px] font-medium">
              {isActionsEnabled ? 'Available Actions' : 'Start with an Action'}
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <div
                className={cn(
                  "transition-opacity",
                  !isActionsEnabled && "opacity-75"
                )}
              >
                <SideBar
                  isEnabled={isActionsEnabled}
                  onActionSelect={activeNodeId ? handleActionSelect : handleInitialActionSelect}
                  existingNodes={getExistingNodeTypes().filter((type): type is string => type !== undefined)}
                  onDragStart={handleDragStart}
                  draggedAction={draggedAction}
                />
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="h-14 px-4 border-b dark:border-white/10 border-zinc-200 flex items-center justify-between">
            <div className="text-sm font-medium">Flow Editor</div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={nodes.length === 0}
                className="h-8"
                title="Undo"
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Undo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={currentHistoryIndex === history.length - 1}
                className="h-8"
                title="Redo"
              >
                <Redo2 className="h-4 w-4 mr-2" />
                Redo
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearCanvas}
                disabled={nodes.length === 0}
                className="h-8"
                title="Clear Canvas"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <div
            className="flex-1 relative"
            onDragOver={handleDragOver}
            onDrop={(e) => {
              handleDrop(e);
              setIsActionsEnabled(true);
            }}
          >
            <ReactFlow
              nodes={nodes.map(node => ({
                ...node,
                data: {
                  ...node.data,
                  onActionClick: () => handleActionClick(node.id),
                  onEndClick: () => handleEndClick(node.id),
                  onChange: handleDelayChange,
                  onDelete: handleNodeDelete,
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
              fitView
              className="bg-background"
            >
              <Background
                gap={12}
                size={1}
                color="currentColor"
                className="dark:text-zinc-800/50 text-zinc-200/30 dark:bg-zinc-900 bg-white"
              />
            </ReactFlow>

            {draggedAction && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                  <Card className="bg-accent/50 border-2 border-dashed border-accent p-4">
                    <p className="text-sm text-center">Drop here to add action</p>
                  </Card>
                </div>
              </div>
            )}

            {nodes.length === 0 && !draggedAction && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Card className="w-72 p-6 flex flex-col items-center gap-4">
                  <div className="text-zinc-500">
                    <PlusCircle className="h-10 w-10" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold mb-1">Empty Canvas</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag an action from the sidebar or click below to start
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleActionClick();
                    }}
                    type="button"
                    className="w-full"
                  >
                    Add Action
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-16 px-4 border-t  dark:border-white/10 border-zinc-200 flex items-center justify-between">
        <Button
          onClick={handleSaveFlow}
          disabled={nodes.length === 0}
          size="lg"
          className="px-8 bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground/80"
        >
          Save Flow
        </Button>
      </div>
    </Card>
  );
}

export default Omni;