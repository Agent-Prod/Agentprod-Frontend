interface NodeData {
  label?: string;
  days?: number;
  leftLabel?: string;
  rightLabel?: string;
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
    label?: string;
    source: string;
    target: string;
    type?: string;
    sourceHandle?: string;
    style?: Record<string, any>;
  }>;
}

export const nodeTemplates: Record<string, Template> = {
  first_email: {
    nodes: [
      {
        id: "email-1",
        type: "emailNode",
        position: { x: 250, y: 0 },
        data: { label: "Send First Email" },
      },
      {
        id: "delay-1",
        type: "delayNode",
        position: { x: 250, y: 150 },
        data: {
          label: "1 day",
          days: 1,
        },
      },
      {
        id: "action-1",
        type: "actionNode",
        position: { x: 250, y: 300 },
        data: {},
      },
    ],
    edges: [
      {
        id: "e1-2",
        source: "email-1",
        target: "delay-1",
        type: "smoothstep",
        style: {
          stroke: "#4f4f4f",
          strokeWidth: 2,
          opacity: 0.8,
        },
      },
      {
        id: "e2-3",
        source: "delay-1",
        target: "action-1",
        type: "smoothstep",
        style: {
          stroke: "#4f4f4f",
          strokeWidth: 2,
          opacity: 0.8,
        },
      },
    ],
  },
  follow_up_email: {
    nodes: [
      {
        id: "email-followup",
        type: "emailNode",
        position: { x: 0, y: 0 },
        data: { label: "Send Follow-up Email" },
      },
      {
        id: "delay-followup",
        type: "delayNode",
        position: { x: 0, y: 150 },
        data: {
          label: "1 day",
          days: 1,
        },
      },
      {
        id: "action-followup",
        type: "actionNode",
        position: { x: 0, y: 300 },
        data: {},
      },
    ],
    edges: [
      {
        id: "ef1",
        source: "email-followup",
        target: "delay-followup",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
      {
        id: "ef2",
        source: "delay-followup",
        target: "action-followup",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
    ],
  },
  linkedin_connection: {
    nodes: [
      {
        id: "linkedin-invite",
        type: "linkedInNode",
        position: { x: 250, y: -50 },
        data: {
          label: "Send LinkedIn Connection",
          leftLabel: "Not Accepted",
          rightLabel: "Accepted",
        },
      },
      {
        id: "delay-linkedin-invite-left",
        type: "delayNode",
        position: { x: 150, y: 100 },
        data: {
          label: "1 day",
          days: 1,
        },
      },
      {
        id: "delay-linkedin-invite-right",
        type: "delayNode",
        position: { x: 350, y: 100 },
        data: {
          label: "1 day",
          days: 1,
        },
      },
      {
        id: "action-linkedin-invite-left",
        type: "actionNode",
        position: { x: 150, y: 200 },
        data: {},
      },
      {
        id: "action-linkedin-invite-right",
        type: "actionNode",
        position: { x: 350, y: 200 },
        data: {},
      },
    ],
    edges: [
      {
        id: "linkedin-left-1",
        source: "linkedin-invite",
        sourceHandle: "source-left",
        target: "delay-linkedin-invite-left",
        type: "smoothstep",
        label: "Not Accepted",
        style: {
          stroke: "#4f4f4f",
          strokeWidth: 2,
          opacity: 0.8,
        },
      },
      {
        id: "linkedin-right-1",
        source: "linkedin-invite",
        sourceHandle: "source-right",
        target: "delay-linkedin-invite-right",
        type: "smoothstep",
        label: "Accepted",
        style: {
          stroke: "#4f4f4f",
          strokeWidth: 2,
          opacity: 0.8,
        },
      },
      {
        id: "linkedin-left-2",
        source: "delay-linkedin-invite-left",
        target: "action-linkedin-invite-left",
        type: "smoothstep",
        style: {
          stroke: "#4f4f4f",
          strokeWidth: 2,
          opacity: 0.8,
        },
      },
      {
        id: "linkedin-right-2",
        source: "delay-linkedin-invite-right",
        target: "action-linkedin-invite-right",
        type: "smoothstep",
        style: {
          stroke: "#4f4f4f",
          strokeWidth: 2,
          opacity: 0.8,
        },
      },
    ],
  },
  like_post: {
    nodes: [
      {
        id: "linkedin-post",
        type: "emailNode",
        position: { x: 0, y: 0 },
        data: { label: "Like and Comment on Post" },
      },
      {
        id: "delay-post",
        type: "delayNode",
        position: { x: 0, y: 100 },
        data: {
          label: "1 day",
          days: 1,
        },
      },
      {
        id: "action-post",
        type: "actionNode",
        position: { x: 0, y: 200 },
        data: {},
      },
    ],
    edges: [
      {
        id: "lp1",
        source: "linkedin-post",
        target: "delay-post",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
      {
        id: "lp2",
        source: "delay-post",
        target: "action-post",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
    ],
  },
  mark_as_lost: {
    nodes: [
      {
        id: "mark-as-lost",
        type: "emailNode",
        position: { x: 0, y: 0 },
        data: { label: "Mark as Lost" },
      },
      {
        id: "delay-mark-as-lost",
        type: "delayNode",
        position: { x: 0, y: 100 },
        data: {
          label: "1 day",
          days: 1,
        },
      },
      {
        id: "action-mark-as-lost",
        type: "actionNode",
        position: { x: 0, y: 200 },
        data: {},
      },
    ],
    edges: [
      {
        id: "ml1",
        source: "mark-as-lost",
        target: "delay-mark-as-lost",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
      {
        id: "ml2",
        source: "delay-mark-as-lost",
        target: "action-mark-as-lost",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
    ],
  },
  withdraw_request: {
    nodes: [
      {
        id: "withdraw-request",
        type: "emailNode",
        position: { x: 0, y: 0 },
        data: { label: "Withdraw Connection Request" },
      },
      {
        id: "delay-withdraw-request",
        type: "delayNode",
        position: { x: 0, y: 100 },
        data: {
          label: "1 day",
          days: 1,
        },
      },
      {
        id: "action-withdraw-request",
        type: "actionNode",
        position: { x: 0, y: 200 },
        data: {},
      },
    ],
    edges: [
      {
        id: "wr1",
        source: "withdraw-request",
        target: "delay-withdraw-request",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
      {
        id: "wr2",
        source: "delay-withdraw-request",
        target: "action-withdraw-request",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
    ],
  },
  linkedin_followup: {
    nodes: [
      {
        id: "linkedin-followup",
        type: "emailNode",
        position: { x: 0, y: 0 },
        data: { label: "Send LinkedIn Follow-up Message" },
      },
      {
        id: "delay-linkedin-followup",
        type: "delayNode",
        position: { x: 0, y: 100 },
        data: {
          label: "1 day",
          days: 1,
        },
      },
      {
        id: "action-linkedin-followup",
        type: "actionNode",
        position: { x: 0, y: 200 },
        data: {},
      },
    ],
    edges: [
      {
        id: "lf1",
        source: "linkedin-followup",
        target: "delay-linkedin-followup",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
      {
        id: "lf2",
        source: "delay-linkedin-followup",
        target: "action-linkedin-followup",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
    ],
  },
  linkedin_inmail: {
    nodes: [
      {
        id: "linkedin-inmail",
        type: "linkedInNode",
        position: { x: 0, y: 0 },
        data: {
          label: "Send LinkedIn InMail",
          leftLabel: "Not Accepted",
          rightLabel: "Accepted",
        },
      },
      {
        id: "delay-linkedin-inmail-left",
        type: "delayNode",
        position: { x: -100, y: 100 },
        data: {
          label: "1 day",
          days: 1,
        },
      },
      {
        id: "action-linkedin-inmail-left",
        type: "actionNode",
        position: { x: -100, y: 200 },
        data: {},
      },
      {
        id: "delay-linkedin-inmail-right",
        type: "delayNode",
        position: { x: 100, y: 100 },
        data: {
          label: "1 day",
          days: 1,
        },
      },
      {
        id: "action-linkedin-inmail-right",
        type: "actionNode",
        position: { x: 100, y: 200 },
        data: {},
      },
    ],
    edges: [
      {
        id: "inmail-left-1",
        source: "linkedin-inmail",
        sourceHandle: "source-left",
        target: "delay-linkedin-inmail-left",
        type: "smoothstep",
        label: "Not Accepted",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
      {
        id: "inmail-left-2",
        source: "delay-linkedin-inmail-left",
        target: "action-linkedin-inmail-left",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
      {
        id: "inmail-right-1",
        source: "linkedin-inmail",
        sourceHandle: "source-right",
        target: "delay-linkedin-inmail-right",
        type: "smoothstep",
        label: "Accepted",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
      {
        id: "inmail-right-2",
        source: "delay-linkedin-inmail-right",
        target: "action-linkedin-inmail-right",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
    ],
  },
  linkedin_message: {
    nodes: [
      {
        id: "linkedin-message",
        type: "emailNode",
        position: { x: 0, y: 0 },
        data: {
          label: "Send LinkedIn Message",
          leftLabel: "Not Read",
          rightLabel: "Read",
        },
      },
      {
        id: "delay-linkedin-message",
        type: "delayNode",
        position: { x: 0, y: 100 },
        data: {
          label: "1 day",
          days: 1,
        },
      },
      {
        id: "action-linkedin-message",
        type: "actionNode",
        position: { x: 0, y: 200 },
        data: {},
      },
    ],
    edges: [
      {
        id: "message-1",
        source: "linkedin-message",
        target: "delay-linkedin-message",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
      {
        id: "message-2",
        source: "delay-linkedin-message",
        target: "action-linkedin-message",
        type: "smoothstep",
        style: { stroke: "#4f4f4f", strokeWidth: 2 },
      },
    ],
  },
};
