"use client";
import React, { useState, useMemo } from "react";
import { PageHeader } from "./PageHeader";
import { Task, Priority } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListCollapse } from "lucide-react";

const priorityOrder: Record<Priority, number> = {
  High: 1,
  Medium: 2,
  Low: 3,
};

const PriorityBadge = ({ priority }: { priority: Task["priority"] }) => {
  const variant: "default" | "secondary" | "destructive" =
    priority === "High"
      ? "destructive"
      : priority === "Medium"
      ? "secondary"
      : "default";
  return <Badge variant={variant}>{priority}</Badge>;
};

export function TodayView({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [sortBy, setSortBy] = useState("priority");

  const handleToggle = (taskId: string, completed: boolean) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, completed } : task))
    );
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (sortBy === "priority") {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });
  }, [tasks, sortBy]);

  return (
    <div>
      <PageHeader title="Today's Manifest">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Sort by Priority</SelectItem>
            <SelectItem value="default">Default</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {sortedTasks.length > 0 ? (
            <div className="divide-y">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 rounded-md hover:bg-secondary/50"
                >
                  <Checkbox
                    id={`task-today-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={(checked) => handleToggle(task.id, !!checked)}
                  />
                  <label
                    htmlFor={`task-today-${task.id}`}
                    className={`flex-1 ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    <span className="font-medium">{task.title}</span>
                    <p className="text-xs text-muted-foreground">Goal: {task.goalId}</p>
                  </label>
                  <PriorityBadge priority={task.priority} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 text-muted-foreground">
              <ListCollapse className="mx-auto size-12" />
              <h3 className="mt-4 text-lg font-medium">All clear!</h3>
              <p>No tasks are due today. Enjoy your day!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
