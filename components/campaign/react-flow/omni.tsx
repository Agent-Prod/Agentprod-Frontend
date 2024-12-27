"use client"
import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import SideBar, { actions } from './SideBar';
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
import { createDefaultEmailFlow, createDefaultOmniFlow, createDefaultLinkedInFlow } from './defaultFlows';

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

interface OmniProps {
  onFlowDataChange?: (flowData: any) => void;
  initialSequence?: {
    steps_config: {
      steps: Record<string, any>;
    };
    flow_data: {
      nodes: any[];
      edges: any[];
    };
  };
  channel?: string;
  onTotalDelayChange?: (totalDays: number) => void;
}

function Omni({ onFlowDataChange, initialSequence, channel, onTotalDelayChange }: OmniProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const [isActionsEnabled, setIsActionsEnabled] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<{ nodes: Node<NodeData>[]; edges: CustomEdge[]; }[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [draggedAction, setDraggedAction] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [viewportInitialized, setViewportInitialized] = useState(false);
  const nodeTypes = {
    emailNode: EmailNode,
    delayNode: DelayNode,
    actionNode: ActionNode,
    linkedInNode: LinkedInNode,
    delayNode1: DelayNode1,
  } as const;

  const isHistoryNavigationRef = React.useRef(false);

  // Use a ref to track if we need to notify parent of changes
  const shouldNotifyParent = useRef(false);

  // Add a ref to track if canvas was cleared
  const wasCanvasCleared = useRef(false);

  // Handle nodes change
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    shouldNotifyParent.current = true;
  }, [onNodesChange]);

  // Handle edges change
  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
    shouldNotifyParent.current = true;
  }, [onEdgesChange]);

  // Add this function to calculate the total height of the flow
  const calculateFlowHeight = (nodes: Node[]) => {
    if (nodes.length === 0) return 0;
    const yPositions = nodes.map(node => node.position.y);
    return Math.max(...yPositions) + 200; // Add padding for new nodes
  };

  // Notify parent of changes, but only when necessary
  useEffect(() => {
    if (shouldNotifyParent.current && onFlowDataChange) {
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
            action_type: actions.find(action => action.label === node.data.label)?.type,
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
            action_type: actions.find(action => action.label === node.data.label)?.type,
            next_steps: {
              default: nextStepIndex
            },
            delay: `${delay}d`
          };
        }

        stepCounter++;
      });

      const sequenceData = {
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

      onFlowDataChange(sequenceData);
      shouldNotifyParent.current = false;
    }
  }, [nodes, edges, onFlowDataChange]);

  const handleInitialActionSelect = (action: { type: string; label: string }) => {
    const template = nodeTemplates[action.type];
    if (!template) return;

    const newNodes = template.nodes.map((node) => ({
      ...node,
      id: `${node.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
      data: {
        ...node.data,
        label: node.data.label || '',
        isSelected: false,
        isEnd: false,
      },
    }));

    const newEdges = template.edges.map((edge) => {
      let sourceNode, targetNode;

      if (action.type === 'linkedin_connection') {
        if (edge.sourceHandle === 'source-left') {
          sourceNode = newNodes.find(n => n.id.includes('linkedin-invite'));
          targetNode = newNodes.find(n => n.id.includes('delay-linkedin-invite-left'));
        } else if (edge.sourceHandle === 'source-right') {
          sourceNode = newNodes.find(n => n.id.includes('linkedin-invite'));
          targetNode = newNodes.find(n => n.id.includes('delay-linkedin-invite-right'));
        } else if (edge.source.includes('delay-linkedin-invite-left')) {
          sourceNode = newNodes.find(n => n.id.includes('delay-linkedin-invite-left'));
          targetNode = newNodes.find(n => n.id.includes('action-linkedin-invite-left'));
        } else if (edge.source.includes('delay-linkedin-invite-right')) {
          sourceNode = newNodes.find(n => n.id.includes('delay-linkedin-invite-right'));
          targetNode = newNodes.find(n => n.id.includes('action-linkedin-invite-right'));
        }
      } else {
        sourceNode = newNodes.find(n => n.id.includes(edge.source.split('-')[0]));
        targetNode = newNodes.find(n => n.id.includes(edge.target.split('-')[0]));
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

    setNodes(newNodes);
    setEdges(newEdges);
    setIsActionsEnabled(false);
    shouldNotifyParent.current = true;
  };

  const handleActionClick = (nodeId?: string) => {
    console.log("handleActionClick called with nodeId:", nodeId);
    
    if (nodeId === activeNodeId) {
      console.log("Same node clicked, returning");
      return;
    }

    const clickedNode = nodes.find(n => n.id === nodeId);
    console.log("Clicked node:", clickedNode);

    // Always enable sidebar and set active node for action nodes
    if (clickedNode?.type === 'actionNode') {
      console.log("Action node clicked, enabling sidebar");
      setActiveNodeId(nodeId || null);  // Fixed type error by handling undefined case
      setIsActionsEnabled(true);

      // Update selection state for all nodes
      setNodes(nodes => nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === nodeId
        }
      })));
      return;
    }

    // Handle other node types
    setIsActionsEnabled(true);
    setActiveNodeId(nodeId || null);

    setNodes(nodes => nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isSelected: node.id === nodeId
      }
    })));
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

    if (action.type === 'linkedin_connection') {
      // Connect parent to LinkedIn node
      connectingEdges = [{
        id: `e-connecting-parent-${Date.now()}`,
        source: parentNode.id,
        target: newNodes[0].id,
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        },
      }];

      const newEdges = template.edges.map(edge => {
        let sourceNode, targetNode;

        // Handle left path edges
        if (edge.sourceHandle === 'source-left') {
          sourceNode = newNodes[0]; // LinkedIn node
          targetNode = newNodes[1]; // Left delay node
        }
        // Handle right path edges
        else if (edge.sourceHandle === 'source-right') {
          sourceNode = newNodes[0]; // LinkedIn node
          targetNode = newNodes[3]; // Right delay node
        }
        else if (edge.source.includes('delay-linkedin-invite-left')) {
          sourceNode = newNodes[1]; // Left delay node
          targetNode = newNodes[2]; // Left action node
        }
        else if (edge.source.includes('delay-linkedin-invite-right')) {
          sourceNode = newNodes[3]; // Right delay node
          targetNode = newNodes[4]; // Right action node
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

    setNodes(prevNodes => prevNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isSelected: false
      }
    })));
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
      const flowStructureData = {
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

      const response = await fetch('/api/campaigns/flow-structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowStructureData),
      });

      if (!response.ok) {
        throw new Error('Failed to save flow structure');
      }

      toast.success('Flow structure saved successfully');
    } catch (error) {
      console.error('Error saving flow structure:', error);
      toast.error('Failed to save flow structure');
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
    // Skip history update if we're undoing/redoing
    if (isHistoryNavigationRef.current) {
      isHistoryNavigationRef.current = false;
      return;
    }

    // Create new state
    const newState = { nodes, edges };

    // If we're in the middle of the history stack, truncate the future states
    const newHistory = history.slice(0, currentHistoryIndex + 1);

    // Only add to history if the state has actually changed
    const lastState = newHistory[newHistory.length - 1];
    const hasStateChanged = !lastState ||
      JSON.stringify(lastState.nodes) !== JSON.stringify(nodes) ||
      JSON.stringify(lastState.edges) !== JSON.stringify(edges);

    if (hasStateChanged) {
      newHistory.push(newState);
      setHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
    }
  }, [nodes, edges, currentHistoryIndex, history]);

  const handleClearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    wasCanvasCleared.current = true;  // Set flag when canvas is cleared

    // Add to history
    const newHistory = [...history.slice(0, currentHistoryIndex + 1), { nodes: [], edges: [] }];
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  }, [history, currentHistoryIndex]);

  const getExistingNodeTypes = useCallback(() => {
    const existingTypes = nodes
      .filter(node => node.type === 'emailNode' || node.type === 'linkedInNode')
      .map(node => {
        const label = node.data.label?.toLowerCase().replace(/ /g, '_');
        switch (label) {
          case 'send_email':
            return 'send_email';
          case 'send_linkedin_connection':
            return 'linkedin_connection';
          case 'send_linkedin_inmail':
            return 'linkedin_inmail';
          case 'send_linkedin_message':
            return 'linkedin_message';
          default:
            return label;
        }
      });
    return existingTypes;
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

    // If there are existing nodes, find the last action node
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

        // Remove the action node placeholder
        const actionNodeToRemove = nodes.find(node =>
          node.type === 'actionNode' &&
          edges.some(edge => edge.source === delayNode.id && edge.target === node.id)
        );

        if (actionNodeToRemove) {
          // Remove the action node and its edge
          setNodes(nodes => nodes.filter(node => node.id !== actionNodeToRemove.id));
          setEdges(edges => edges.filter(edge => edge.target !== actionNodeToRemove.id));
        }

        // Add the new node below the delay node
        const template = nodeTemplates[actionType];
        if (template) {
          const newNodes = template.nodes.map((node) => ({
            ...node,
            id: `${node.id}-${Date.now()}`,
            position: {
              x: delayNode.position.x + (node.position.x - template.nodes[0].position.x),
              y: delayNode.position.y + node.position.y + 150,
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
            let sourceNode, targetNode;

            if (actionType === 'linkedin_connection') {
              if (edge.sourceHandle === 'source-left') {
                sourceNode = newNodes.find(n => n.id.includes('linkedin-invite'));
                targetNode = newNodes.find(n => n.id.includes('delay-linkedin-invite-left'));
              } else if (edge.sourceHandle === 'source-right') {
                sourceNode = newNodes.find(n => n.id.includes('linkedin-invite'));
                targetNode = newNodes.find(n => n.id.includes('delay-linkedin-invite-right'));
              } else if (edge.source.includes('delay-linkedin-invite-left')) {
                sourceNode = newNodes.find(n => n.id.includes('delay-linkedin-invite-left'));
                targetNode = newNodes.find(n => n.id.includes('action-linkedin-invite-left'));
              } else if (edge.source.includes('delay-linkedin-invite-right')) {
                sourceNode = newNodes.find(n => n.id.includes('delay-linkedin-invite-right'));
                targetNode = newNodes.find(n => n.id.includes('action-linkedin-invite-right'));
              }
            } else {
              sourceNode = newNodes.find(n => n.id.includes(edge.source.split('-')[0]));
              targetNode = newNodes.find(n => n.id.includes(edge.target.split('-')[0]));
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

          setNodes(prevNodes => [...prevNodes, ...newNodes]);
          setEdges(prevEdges => [...prevEdges, connectingEdge, ...newEdges]);
        }
      }
    } else {
      // If no nodes exist, handle as initial action
      handleInitialActionSelect({ type: actionType, label: actionLabel });
    }

    setDraggedAction(null);
    setIsActionsEnabled(true);
  };

  const handleNodeDelete = useCallback((nodeId: string) => {
    const nodesToRemove = new Set<string>();
    const edgesToRemove = new Set<string>();

    // Find all downstream nodes to remove (including action nodes)
    const findDownstreamNodes = (currentNodeId: string) => {
      edges.forEach(edge => {
        if (edge.source === currentNodeId) {
          const targetNode = nodes.find(n => n.id === edge.target);
          if (targetNode) {
            edgesToRemove.add(edge.id);
            nodesToRemove.add(edge.target);
            findDownstreamNodes(edge.target);
          }
        }
      });

      // Remove incoming edges to the deleted node
      edges.forEach(edge => {
        if (edge.target === currentNodeId) {
          edgesToRemove.add(edge.id);
        }
      });
    };

    nodesToRemove.add(nodeId);
    findDownstreamNodes(nodeId);

    // Find the parent node of the deleted node
    const parentNode = nodes.find(node =>
      edges.some(edge => edge.target === nodeId && edge.source === node.id)
    );

    if (parentNode) {
      // Create a new action node
      const actionNode: Node<NodeData> = {
        id: `action-${Date.now()}`,
        type: 'actionNode',
        position: {
          x: parentNode.position.x,
          y: parentNode.position.y + 150,
        },
        data: {}
      };

      // Create edge from parent to new action node
      const actionEdge: CustomEdge = {
        id: `e-${Date.now()}`,
        source: parentNode.id,
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
      // If no parent node (deleting the first node), clear everything
      setNodes([]);
      setEdges([]);
    }

    if (activeNodeId === nodeId) {
      setIsActionsEnabled(false);
      setActiveNodeId(null);
    }
  }, [edges, nodes, activeNodeId]);

  // Add useEffect to handle initial sequence data
  useEffect(() => {
    if (initialSequence?.flow_data) {
      const { nodes: sequenceNodes, edges: sequenceEdges } = initialSequence.flow_data;

      // Map the nodes with necessary data and handlers
      const reconstructedNodes = sequenceNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onActionClick: () => handleActionClick(node.id),
          onEndClick: () => handleEndClick(node.id),
          onChange: handleDelayChange,
          onDelete: handleNodeDelete,
        },
      }));

      // Set the initial flow state
      setNodes(reconstructedNodes);
      setEdges(sequenceEdges);
      // setFlowData(initialSequence);

      // Update history
      setHistory([{ nodes: reconstructedNodes, edges: sequenceEdges }]);
      setCurrentHistoryIndex(0);
    }
  }, [initialSequence]);

  // Add useEffect to handle default email flow
  useEffect(() => {
    if (!initialSequence && !wasCanvasCleared.current) {
      if (channel === 'mail') {
        const defaultEmailFlow = createDefaultEmailFlow({
          handleActionClick,
          handleEndClick,
          handleDelayChange,
          handleNodeDelete,
        });
        setNodes(defaultEmailFlow.nodes as unknown as Node<NodeData>[]);
        setEdges(defaultEmailFlow.edges as unknown as CustomEdge[]);
        setHistory([{ nodes: defaultEmailFlow.nodes as unknown as Node<NodeData>[], edges: defaultEmailFlow.edges as unknown as CustomEdge[] }]);
        setCurrentHistoryIndex(0);
      } else if (channel === 'omni') {
        const defaultOmniFlow = createDefaultOmniFlow({
          handleActionClick,
          handleEndClick,
          handleDelayChange,
          handleNodeDelete,
        });
        setNodes(defaultOmniFlow.nodes as unknown as Node<NodeData>[]);
        setEdges(defaultOmniFlow.edges as unknown as CustomEdge[]);
        setHistory([{ nodes: defaultOmniFlow.nodes as unknown as Node<NodeData>[], edges: defaultOmniFlow.edges as unknown as CustomEdge[] }]);
        setCurrentHistoryIndex(0);
      } else if (channel === 'Linkedin') {
        const defaultLinkedInFlow = createDefaultLinkedInFlow({
          handleActionClick,
          handleEndClick,
          handleDelayChange,
          handleNodeDelete,
        });
        setNodes(defaultLinkedInFlow.nodes as unknown as Node<NodeData>[]);
        setEdges(defaultLinkedInFlow.edges as unknown as CustomEdge[]);
        setHistory([{ nodes: defaultLinkedInFlow.nodes as unknown as Node<NodeData>[], edges: defaultLinkedInFlow.edges as unknown as CustomEdge[] }]);
        setCurrentHistoryIndex(0);
      }
    }
  }, [channel, initialSequence]);

  // Reset the wasCanvasCleared flag when channel changes
  useEffect(() => {
    wasCanvasCleared.current = false;
  }, [channel]);

  const calculateTotalDelay = useCallback(() => {
    const delayNodes = nodes.filter(node => node.type === 'delayNode');
    const totalDays = delayNodes.reduce((sum, node) => sum + (node.data.days || 0), 0);
    return totalDays;
  }, [nodes]);

  useEffect(() => {
    const totalDays = calculateTotalDelay();
    onTotalDelayChange?.(totalDays);
  }, [nodes, calculateTotalDelay, onTotalDelayChange]);

  return (
    <Card className="w-full flex flex-col bg-background border rounded-none">
      <div className="w-full flex h-[calc(80vh-64px)]">
        <div className="w-[280px] border-r dark:border-white/10 border-zinc-200 flex flex-col">
          <div className="p-4 border-b dark:border-white/10 border-zinc-200">
            <h3 className="text-[15.5px] font-medium">
              {isActionsEnabled ? 'Available Actions' : 'Make your Workflow'}
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
                  channel={channel}
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
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              nodeTypes={nodeTypes as NodeTypes}
              defaultEdgeOptions={{
                style: { stroke: '#4f4f4f', strokeWidth: 2 },
                type: 'smoothstep',
              }}
              fitView
              minZoom={0.1}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              style={{ height: `${Math.max(800, calculateFlowHeight(nodes))}px` }}
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


    </Card>
  );
}

export default Omni;