"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "./PageHeader";
import { Task } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { format, isSameDay } from "date-fns";
import { ListCollapse } from "lucide-react";

const PriorityBadge = ({ priority }: { priority: Task["priority"] }) => {
  const variant: "default" | "secondary" | "destructive" =
    priority === "High"
      ? "destructive"
      : priority === "Medium"
      ? "secondary"
      : "default";
  return <Badge variant={variant}>{priority}</Badge>;
};

export function CalendarView({ allTasks }: { allTasks: Task[] }) {
  const [tasks, setTasks] = useState(allTasks);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleToggle = (taskId: string, completed: boolean) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, completed } : task))
    );
  };

  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter(
      (task) => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
    );
  }, [tasks, selectedDate]);
  
  const daysWithTasks = useMemo(() => {
    return tasks
      .filter(task => task.dueDate)
      .map(task => new Date(task.dueDate as string));
  }, [tasks]);

  return (
    <div>
      <PageHeader title="Plan View" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="p-3"
                modifiers={{ withTasks: daysWithTasks }}
                modifiersStyles={{
                    withTasks: {
                        border: "2px solid hsl(var(--primary))",
                        borderRadius: 'var(--radius)'
                    },
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                Tasks for{" "}
                {selectedDate ? format(selectedDate, "PPP") : "selected day"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasksForSelectedDay.length > 0 ? (
                <div className="divide-y">
                  {tasksForSelectedDay.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 py-3"
                    >
                      <Checkbox
                        id={`task-cal-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={(checked) =>
                          handleToggle(task.id, !!checked)
                        }
                      />
                      <label
                        htmlFor={`task-cal-${task.id}`}
                        className={`flex-1 ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : ""
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
                    <h3 className="mt-4 text-lg font-medium">No tasks scheduled</h3>
                    <p>Select a day to see your tasks.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
