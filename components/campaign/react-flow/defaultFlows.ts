import { Node, Edge } from '@xyflow/react';


interface CustomEdge extends Edge {
    sourceHandle?: string;
}

interface FlowTemplate {
    nodes: Node<any>[];
    edges: CustomEdge[];
}

export const createDefaultEmailFlow = (handlers: {
    handleActionClick: (id: string) => void;
    handleEndClick: (id: string) => void;
    handleDelayChange: (id: string, days: number) => void;
    handleNodeDelete: (id: string) => void;
}): FlowTemplate => ({
    nodes: [
        {
            id: 'email-1',
            type: 'emailNode',
            position: { x: 250, y: 100 },
            data: {
                label: 'Send First Email',
                onActionClick: () => handlers.handleActionClick('email-1'),
                onEndClick: () => handlers.handleEndClick('email-1'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-1',
            type: 'delayNode',
            position: { x: 250, y: 250 },
            data: {
                label: '1 day',
                days: 1,
                onActionClick: () => handlers.handleActionClick('delay-1'),
                onEndClick: () => handlers.handleEndClick('delay-1'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'email-2',
            type: 'emailNode',
            position: { x: 250, y: 400 },
            data: {
                label: 'Send Follow-up Email',
                onActionClick: () => handlers.handleActionClick('email-2'),
                onEndClick: () => handlers.handleEndClick('email-2'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-2',
            type: 'delayNode',
            position: { x: 250, y: 550 },
            data: {
                label: '2 days',
                days: 2,
                onActionClick: () => handlers.handleActionClick('delay-2'),
                onEndClick: () => handlers.handleEndClick('delay-2'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'action-1',
            type: 'actionNode',
            position: { x: 250, y: 700 },
            data: {
                label: 'Add action',
                isEnd: false,
                onActionClick: () => handlers.handleActionClick('action-1'),
                onEndClick: () => handlers.handleEndClick('action-1'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        }
    ],
    edges: [
        {
            id: 'e1-2',
            source: 'email-1',
            target: 'delay-1',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e2-3',
            source: 'delay-1',
            target: 'email-2',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e3-4',
            source: 'email-2',
            target: 'delay-2',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e4-5',
            source: 'delay-2',
            target: 'action-1',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        }
    ]
}); 