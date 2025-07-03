"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit,
  Calendar,
  Flag,
  ListTodo,
  PlusCircle,
} from "lucide-react";
import { Goal, Milestone, Task } from "@/lib/types";
import { PageHeader } from "./PageHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";

const PriorityBadge = ({ priority }: { priority: Task["priority"] }) => {
  const variant: "default" | "secondary" | "destructive" =
    priority === "High"
      ? "destructive"
      : priority === "Medium"
      ? "secondary"
      : "default";
  return <Badge variant={variant}>{priority}</Badge>;
};

const TaskItem = ({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
}) => (
  <div className="flex items-center gap-4 p-2 rounded-md hover:bg-secondary/50">
    <Checkbox
      id={`task-${task.id}`}
      checked={task.completed}
      onCheckedChange={(checked) => onToggle(task.id, !!checked)}
    />
    <label
      htmlFor={`task-${task.id}`}
      className={`flex-1 text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}
    >
      {task.title}
    </label>
    <div className="flex items-center gap-4">
      {task.dueDate && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="size-3" />
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
      )}
      <PriorityBadge priority={task.priority} />
    </div>
  </div>
);

const MilestoneItem = ({
  milestone,
  onTaskToggle,
}: {
  milestone: Milestone;
  onTaskToggle: (taskId: string, completed: boolean) => void;
}) => {
  const progress = useMemo(() => {
    if (milestone.tasks.length === 0) return 0;
    const completedTasks = milestone.tasks.filter((t) => t.completed).length;
    return (completedTasks / milestone.tasks.length) * 100;
  }, [milestone.tasks]);

  return (
    <AccordionItem value={milestone.id}>
      <AccordionTrigger>
        <div className="flex flex-col items-start text-left gap-1">
          <span className="font-medium">{milestone.title}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            <ListTodo className="size-3" /> {milestone.tasks.length} tasks
            {milestone.dueDate && (
              <>
                <span className="mx-1">·</span>
                <Calendar className="size-3" /> Due{" "}
                {new Date(milestone.dueDate).toLocaleDateString()}
              </>
            )}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-4 border-l ml-2">
        <div className="flex flex-col gap-2 pt-2">
          {milestone.tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={onTaskToggle} />
          ))}
          <Button variant="ghost" size="sm" className="mt-2 justify-start">
            <PlusCircle className="mr-2 size-4" />
            Add Task
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const GoalCard = ({
  goal,
  onTaskToggle,
}: {
  goal: Goal;
  onTaskToggle: (taskId: string, completed: boolean) => void;
}) => {
  const { toast } = useToast();
  const progress = useMemo(() => {
    const totalTasks = goal.milestones.flatMap((m) => m.tasks).length;
    if (totalTasks === 0) return 0;
    const completedTasks = goal.milestones
      .flatMap((m) => m.tasks)
      .filter((t) => t.completed).length;
    return (completedTasks / totalTasks) * 100;
  }, [goal]);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{goal.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{goal.category}</Badge>
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() =>
                  toast({
                    title: "Goal deleted",
                    description: `"${goal.title}" has been removed.`,
                  })
                }
              >
                <Trash2 className="mr-2 size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-sm font-bold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
          <Accordion type="multiple" className="w-full">
            {goal.milestones.map((milestone) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                onTaskToggle={onTaskToggle}
              />
            ))}
          </Accordion>
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 size-4" /> Add Milestone
          </Button>
        </div>
      </CardContent>
      {goal.deadline && (
        <CardFooter>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Calendar className="size-4" />
            Deadline: {new Date(goal.deadline).toLocaleDateString()}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export function GoalView({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [open, setOpen] = useState(false);

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    setGoals((currentGoals) =>
      currentGoals.map((goal) => ({
        ...goal,
        milestones: goal.milestones.map((milestone) => ({
          ...milestone,
          tasks: milestone.tasks.map((task) =>
            task.id === taskId ? { ...task, completed } : task
          ),
        })),
      }))
    );
  };

  return (
    <div className="h-full">
      <PageHeader title="My Goals">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new goal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" placeholder="e.g., Learn a new language" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input id="category" placeholder="e.g., Personal Growth" className="col-span-3" />
              </div>
               <Button onClick={() => setOpen(false)} className="mt-4">Save Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} onTaskToggle={handleTaskToggle} />
        ))}
      </div>
    </div>
  );
}
