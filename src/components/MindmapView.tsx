'use client';

import React, { useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Goal } from '@/lib/types';
import { PageHeader } from './PageHeader';
import { Card } from './ui/card';

const baseNodeStyle = {
    padding: '10px',
    borderRadius: 'var(--radius)',
    border: '1px solid hsl(var(--border))',
    width: 200,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}

const goalNodeStyle = {
  ...baseNodeStyle,
  background: 'hsl(var(--primary))',
  color: 'hsl(var(--primary-foreground))',
  fontWeight: 'bold',
};

const milestoneNodeStyle = {
  ...baseNodeStyle,
  background: 'hsl(var(--secondary))',
  color: 'hsl(var(--secondary-foreground))',
  width: 180,
};

const taskNodeStyle = {
  ...baseNodeStyle,
  background: 'hsl(var(--card))',
  color: 'hsl(var(--card-foreground))',
  width: 180,
  fontSize: '0.9em'
};

export function MindmapView({ goals }: { goals: Goal[] }) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let yPos = 0;
    const yGap = 80;
    const xGap = 250;

    goals.forEach((goal) => {
        const goalId = `goal-${goal.id}`;
        let milestoneChildrenHeight = 0;

        goal.milestones.forEach((milestone) => {
            const milestoneId = `milestone-${milestone.id}`;
            let taskChildrenHeight = 0;
            
            milestone.tasks.forEach((task) => {
                const taskId = `task-${task.id}`;
                nodes.push({
                    id: taskId,
                    data: { label: task.title },
                    position: { x: xGap * 2, y: yPos + milestoneChildrenHeight + taskChildrenHeight},
                    style: taskNodeStyle,
                    type: 'output',
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                });
                edges.push({ id: `e-${milestoneId}-${taskId}`, source: milestoneId, target: taskId, animated: true });
                taskChildrenHeight += yGap;
            });
            
            const milestoneY = yPos + milestoneChildrenHeight + (Math.max(0, taskChildrenHeight - yGap) / 2);
            nodes.push({
                id: milestoneId,
                data: { label: milestone.title },
                position: { x: xGap, y: milestoneY },
                style: milestoneNodeStyle,
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            });
            edges.push({ id: `e-${goalId}-${milestoneId}`, source: goalId, target: milestoneId, animated: true });
            
            milestoneChildrenHeight += Math.max(yGap, taskChildrenHeight);
        });

        const goalY = yPos + (Math.max(0, milestoneChildrenHeight - yGap) / 2);
        nodes.push({
            id: goalId,
            data: { label: goal.title },
            position: { x: 0, y: goalY },
            type: 'input',
            style: goalNodeStyle,
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
        });

        yPos += Math.max(yGap, milestoneChildrenHeight) + yGap;
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [goals]);

  return (
    <div className="h-full flex flex-col" style={{height: 'calc(100vh - 5rem)'}}>
      <PageHeader title="Mindmap" />
      <Card className="flex-grow rounded-lg overflow-hidden">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Background gap={16} />
        </ReactFlow>
      </Card>
    </div>
  );
}
