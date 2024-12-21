interface NodeData {
  label: string;
  days?: number;
}

interface Template {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: NodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    sourceHandle?: string;
    style?: Record<string, any>;
  }>;
}

export const nodeTemplates: Record<string, Template> = {
  send_email: {
    nodes: [
      {
        id: 'email-1',
        type: 'emailNode',
        position: { x: 250, y: 0 },
        data: { label: 'Send Email' },
      },
      {
        id: 'delay-1',
        type: 'delayNode',
        position: { x: 250, y: 150 },
        data: {
          label: '1 day',
          days: 1
        },
      },
      {
        id: 'action-1',
        type: 'actionNode',
        position: { x: 250, y: 300 },
        data: {},
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'email-1',
        target: 'delay-1',
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        },
      },
      {
        id: 'e2-3',
        source: 'delay-1',
        target: 'action-1',
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        },
      },
    ]
  },
  email_followup: {
    nodes: [
      {
        id: 'email-followup',
        type: 'emailNode',
        position: { x: 0, y: 0 },
        data: { label: 'Send Email Follow-up' },
      },
      {
        id: 'delay-followup',
        type: 'delayNode',
        position: { x: 0, y: 150 },
        data: {
          label: '1 day',
          days: 1
        },
      },
      {
        id: 'action-followup',
        type: 'actionNode',
        position: { x: 0, y: 300 },
        data: {},
      },
    ],
    edges: [
      {
        id: 'ef1',
        source: 'email-followup',
        target: 'delay-followup',
        type: 'smoothstep',
        style: { stroke: '#4f4f4f', strokeWidth: 2 },
      },
      {
        id: 'ef2',
        source: 'delay-followup',
        target: 'action-followup',
        type: 'smoothstep',
        style: { stroke: '#4f4f4f', strokeWidth: 2 },
      },
    ]
  },
  linkedin_invite: {
    nodes: [
      {
        id: 'linkedin-invite',
        type: 'linkedInNode',
        position: { x: 250, y: 0 },
        data: { label: 'Send Linkedin Invite' },
      },
      {
        id: 'delay-linkedin-invite-left',
        type: 'delayNode',
        position: { x: 150, y: 100 },
        data: {
          label: '1 day',
          days: 1
        },
      },
      {
        id: 'action-linkedin-invite-left',
        type: 'actionNode',
        position: { x: 150, y: 200 },
        data: {},
      },
      {
        id: 'delay-linkedin-invite-right',
        type: 'delayNode',
        position: { x: 450, y: 100 },
        data: {
          label: '1 day',
          days: 1
        },
      },
      {
        id: 'action-linkedin-invite-right',
        type: 'actionNode',
        position: { x: 500, y: 200 },
        data: {},
      },
    ],
    edges: [
      {
        id: 'linkedin-left-1',
        source: 'linkedin-invite',
        sourceHandle: 'source-left',
        target: 'delay-linkedin-invite-left',
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        },
      },
      {
        id: 'linkedin-left-2',
        source: 'delay-linkedin-invite-left',
        target: 'action-linkedin-invite-left',
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        },
      },
      {
        id: 'linkedin-right-1',
        source: 'linkedin-invite',
        sourceHandle: 'source-right',
        target: 'delay-linkedin-invite-right',
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        },
      },
      {
        id: 'linkedin-right-2',
        source: 'delay-linkedin-invite-right',
        target: 'action-linkedin-invite-right',
        type: 'smoothstep',
        style: {
          stroke: '#4f4f4f',
          strokeWidth: 2,
          opacity: 0.8
        },
      },
    ]
  },
}; 