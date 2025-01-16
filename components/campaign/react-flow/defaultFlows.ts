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
                label: "1 day",
                days: 1,
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
                label: "1 day",
                days: 1,
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

export const createDefaultOmniFlow = (handlers: {
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
                label: "1 day",
                days: 1,
                defaultDays: 1,
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
                label: "1 day",
                days: 1,
                defaultDays: 1,
            },
        },
        {
            id: 'linkedin-1',
            type: 'linkedInNode',
            position: { x: 250, y: 700 },
            data: {
                label: 'Send LinkedIn Connection',
                leftLabel: 'Not Accepted',
                rightLabel: 'Accepted',
                onActionClick: () => handlers.handleActionClick('linkedin-1'),
                onEndClick: () => handlers.handleEndClick('linkedin-1'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-linkedin-left',
            type: 'delayNode',
            position: { x: 150, y: 850 },
            data: {
                label: "1 day",
                days: 1,
                defaultDays: 1,
            },
        },
        {
            id: 'like-post',
            type: 'emailNode',
            position: { x: 150, y: 950 },
            data: {
                label: 'Like and Comment on Post',
                onActionClick: () => handlers.handleActionClick('like-post'),
                onEndClick: () => handlers.handleEndClick('like-post'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-like-post',
            type: 'delayNode',
            position: { x: 150, y: 1050 },
            data: {
                label: "1 day",
                days: 1,
                defaultDays: 1,
            },
        },
        {
            id: 'action-left',
            type: 'actionNode',
            position: { x: 150, y: 1150 },
            data: {
                label: 'Add action',
                isEnd: false,
                onActionClick: () => handlers.handleActionClick('action-left'),
                onEndClick: () => handlers.handleEndClick('action-left'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-linkedin-right',
            type: 'delayNode',
            position: { x: 450, y: 850 },
            data: {
                label: "1 day",
                days: 1,
                defaultDays: 1,
            },
        },
        {
            id: 'linkedin-message',
            type: 'emailNode',
            position: { x: 550, y: 950 },
            data: {
                label: 'Send LinkedIn Message',
                onActionClick: () => handlers.handleActionClick('linkedin-message'),
                onEndClick: () => handlers.handleEndClick('linkedin-message'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-message',
            type: 'delayNode',
            position: { x: 550, y: 1050 },
            data: {
                label: "1 day",
                days: 1,
                defaultDays: 1,
            },
        },
        {
            id: 'linkedin-followup',
            type: 'emailNode',
            position: { x: 550, y: 1150 },
            data: {
                label: 'Send LinkedIn Follow-up',
                onActionClick: () => handlers.handleActionClick('linkedin-followup'),
                onEndClick: () => handlers.handleEndClick('linkedin-followup'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-followup',
            type: 'delayNode',
            position: { x: 600, y: 1250 },
            data: {
                label: "1 day",
                days: 1,
                defaultDays: 1,
            },
        },
        {
            id: 'action-right',
            type: 'actionNode',
            position: { x: 600, y: 1350 },
            data: {
                label: 'Add action',
                isEnd: false,
                onActionClick: () => handlers.handleActionClick('action-right'),
                onEndClick: () => handlers.handleEndClick('action-right'),
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
            target: 'linkedin-1',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'linkedin-left',
            source: 'linkedin-1',
            sourceHandle: 'source-left',
            target: 'delay-linkedin-left',
            type: 'smoothstep',
            label: 'Not Accepted',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'left-to-like',
            source: 'delay-linkedin-left',
            target: 'like-post',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'like-to-delay',
            source: 'like-post',
            target: 'delay-like-post',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'delay-to-action-left',
            source: 'delay-like-post',
            target: 'action-left',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'linkedin-right',
            source: 'linkedin-1',
            sourceHandle: 'source-right',
            target: 'delay-linkedin-right',
            type: 'smoothstep',
            label: 'Accepted',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'right-to-message',
            source: 'delay-linkedin-right',
            target: 'linkedin-message',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'message-to-delay',
            source: 'linkedin-message',
            target: 'delay-message',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'delay-to-followup',
            source: 'delay-message',
            target: 'linkedin-followup',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'followup-to-delay',
            source: 'linkedin-followup',
            target: 'delay-followup',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'delay-to-action-right',
            source: 'delay-followup',
            target: 'action-right',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        }
    ]
});

export const createDefaultLinkedInFlow = (handlers: {
    handleActionClick: (id: string) => void;
    handleEndClick: (id: string) => void;
    handleDelayChange: (id: string, days: number) => void;
    handleNodeDelete: (id: string) => void;
}): FlowTemplate => ({
    nodes: [
        {
            id: 'linkedin-connection-1',
            type: 'linkedInNode',
            position: { x: 250, y: 0 },
            data: {
                label: 'Send LinkedIn Connection',
                leftLabel: 'Not Accepted',
                rightLabel: 'Accepted',
                onActionClick: () => handlers.handleActionClick('linkedin-connection-1'),
                onEndClick: () => handlers.handleEndClick('linkedin-connection-1'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-not-accepted',
            type: 'delayNode',
            position: { x: 50, y: 150 },
            data: {
                label: "1 day",
                days: 1,
                defaultDays: 1,
            },
        },
        {
            id: 'like-and-comment',
            type: 'emailNode',
            position: { x: 50, y: 300 },
            data: {
                label: 'Like and Comment on Post',
                onActionClick: () => handlers.handleActionClick('like-and-comment'),
                onEndClick: () => handlers.handleEndClick('like-and-comment'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-after-like',
            type: 'delayNode',
            position: { x: 50, y: 450 },
            data: {
                label: "7 days",
                days: 7,
                defaultDays: 7,
            },
        },
        {
            id: 'withdraw-request',
            type: 'emailNode',
            position: { x: 50, y: 600 },
            data: {
                label: 'Withdraw Connection Request',
                onActionClick: () => handlers.handleActionClick('withdraw-request'),
                onEndClick: () => handlers.handleEndClick('withdraw-request'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-withdraw',
            type: 'delayNode',
            position: { x: 50, y: 750 },
            data: {
                label: "1 day",
                days: 1,
                defaultDays: 1,
            },
        },
        {
            id: 'action-left',
            type: 'actionNode',
            position: { x: 50, y: 900 },
            data: {
                label: 'Add action',
                isEnd: false,
                onActionClick: () => handlers.handleActionClick('action-left'),
                onEndClick: () => handlers.handleEndClick('action-left'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-accepted',
            type: 'delayNode',
            position: { x: 450, y: 150 },
            data: {
                label: "1 day",
                days: 1,
                defaultDays: 1,
            },
        },
        {
            id: 'linkedin-message',
            type: 'emailNode',
            position: { x: 450, y: 300 },
            data: {
                label: 'Send LinkedIn Message',
                onActionClick: () => handlers.handleActionClick('linkedin-message'),
                onEndClick: () => handlers.handleEndClick('linkedin-message'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-after-message',
            type: 'delayNode',
            position: { x: 450, y: 450 },
            data: {
                label: "3 days",
                days: 3,
                defaultDays: 3,
            },
        },
        {
            id: 'linkedin-followup',
            type: 'emailNode',
            position: { x: 450, y: 600 },
            data: {
                label: 'Send LinkedIn Follow-up',
                onActionClick: () => handlers.handleActionClick('linkedin-followup'),
                onEndClick: () => handlers.handleEndClick('linkedin-followup'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        },
        {
            id: 'delay-followup',
            type: 'delayNode',
            position: { x: 450, y: 750 },
            data: {
                label: "1 day",
                days: 1,
                defaultDays: 1,
            },
        },
        {
            id: 'action-right',
            type: 'actionNode',
            position: { x: 450, y: 900 },
            data: {
                label: 'Add action',
                isEnd: false,
                onActionClick: () => handlers.handleActionClick('action-right'),
                onEndClick: () => handlers.handleEndClick('action-right'),
                onChange: handlers.handleDelayChange,
                onDelete: handlers.handleNodeDelete,
            },
        }
    ],
    edges: [
        {
            id: 'e1-left',
            source: 'linkedin-connection-1',
            sourceHandle: 'source-left',
            target: 'delay-not-accepted',
            type: 'smoothstep',
            label: 'Not Accepted',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e2-left',
            source: 'delay-not-accepted',
            target: 'like-and-comment',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e3-left',
            source: 'like-and-comment',
            target: 'delay-after-like',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e4-left',
            source: 'delay-after-like',
            target: 'withdraw-request',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e5-left',
            source: 'withdraw-request',
            target: 'delay-withdraw',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e6-left',
            source: 'delay-withdraw',
            target: 'action-left',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e1-right',
            source: 'linkedin-connection-1',
            sourceHandle: 'source-right',
            target: 'delay-accepted',
            type: 'smoothstep',
            label: 'Accepted',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e2-right',
            source: 'delay-accepted',
            target: 'linkedin-message',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e3-right',
            source: 'linkedin-message',
            target: 'delay-after-message',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e4-right',
            source: 'delay-after-message',
            target: 'linkedin-followup',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e5-right',
            source: 'linkedin-followup',
            target: 'delay-followup',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        },
        {
            id: 'e6-right',
            source: 'delay-followup',
            target: 'action-right',
            type: 'smoothstep',
            style: { stroke: '#4f4f4f', strokeWidth: 2, opacity: 0.8 },
        }
    ]
}); 