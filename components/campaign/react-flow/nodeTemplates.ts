export const nodeTemplates: Record<string, any> = {
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
        data: { label: '1 day' },
      },
      {
        id: 'action-1',
        type: 'actionNode',
        position: { x: 250, y: 300 },
        data: { },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'email-1',
        target: 'delay-1',
        type: 'smoothstep',
        style: { stroke: '#4f4f4f', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: 'delay-1',
        target: 'action-1',
        type: 'smoothstep',
        style: { stroke: '#4f4f4f', strokeWidth: 2 },
      },
    ]
  },
}; 