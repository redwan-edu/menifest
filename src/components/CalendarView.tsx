
"use client";

import React, { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  set,
  startOfHour,
} from "date-fns";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { GripVertical, Plus, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const PriorityBadge = ({ priority }: { priority: Task["priority"] }) => {
  const variant: "default" | "secondary" | "destructive" =
    priority === "High"
      ? "destructive"
      : priority === "Medium"
      ? "secondary"
      : "default";
  return <Badge variant={variant}>{priority}</Badge>;
};

const DraggableTask = ({ task }: { task: Task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-3 mb-2 touch-none bg-card">
      <div className="flex items-center">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1"
          aria-describedby={`task-dnd-handle-${task.id}`}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="ml-2 flex-grow">
          <p className="font-medium">{task.title}</p>
          <p className="text-xs text-muted-foreground">Goal: {task.goalId}</p>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>
    </Card>
  );
};

const ScheduledTask = ({ task }: { task: Task }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: "task", task },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("touch-none my-1", isDragging && "opacity-30")}
    >
      <Card className="p-2 text-xs bg-primary/20 border-primary/50">
        <p className="font-bold truncate">{task.title}</p>
        <p className="truncate text-muted-foreground">{task.priority} Priority</p>
      </Card>
    </div>
  );
};

export function CalendarView({ allTasks }: { allTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const week = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const { unscheduledTasks, tasksByDateTime } = useMemo(() => {
    const unscheduled = tasks.filter((task) => !task.scheduledDateTime);
    const byDateTime: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (task.scheduledDateTime) {
        const key = startOfHour(new Date(task.scheduledDateTime)).toISOString();
        if (!byDateTime[key]) {
          byDateTime[key] = [];
        }
        byDateTime[key].push(task);
      }
    });
    return { unscheduledTasks: unscheduled, tasksByDateTime: byDateTime };
  }, [tasks]);

  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      dueDate: null,
      priority: "Medium",
      completed: false,
      milestoneId: "none",
      goalId: "Brain Dump",
      scheduledDateTime: null,
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeIsTask = active.data.current?.type === "task";
    const overIsSlot = over.data.current?.type === "slot";
    const overIsBrainDump = over.id === "braindump-area";

    if (active.id === over.id) return;
    
    // Dragging a task to a time slot
    if (activeIsTask && overIsSlot) {
      const taskId = active.id;
      const newDateTime = over.data.current.dateTime.toISOString();
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, scheduledDateTime: newDateTime } : t))
      );
    }

    // Dragging a task to the brain dump area to unschedule
    if (activeIsTask && overIsBrainDump) {
      const taskId = active.id;
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, scheduledDateTime: null } : t))
      );
    }

    // Reordering tasks in the brain dump
    const activeTaskData = active.data.current?.task;
    const overTaskData = over.data.current?.task;
    if (activeIsTask && active.id !== over.id && !activeTaskData?.scheduledDateTime && !overTaskData?.scheduledDateTime) {
      const oldIndex = unscheduledTasks.findIndex((t) => t.id === active.id);
      const newIndex = unscheduledTasks.findIndex((t) => t.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrderedUnscheduled = arrayMove(unscheduledTasks, oldIndex, newIndex);
        setTasks((prev) => [
          ...newOrderedUnscheduled,
          ...prev.filter((t) => t.scheduledDateTime),
        ]);
      }
    }
  };

  const TimeSlot = ({ dateTime }: { dateTime: Date }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `slot-${dateTime.toISOString()}`,
      data: { type: "slot", dateTime },
    });

    const dateTimeKey = startOfHour(dateTime).toISOString();
    const tasksInSlot = tasksByDateTime[dateTimeKey] || [];

    return (
      <div
        ref={setNodeRef}
        className={cn("h-24 border-t border-l p-1 relative", isOver && "bg-accent/50")}
      >
        {tasksInSlot.map((task) => (
          <ScheduledTask key={task.id} task={task} />
        ))}
      </div>
    );
  };

  const DroppableBrainDump = ({ children }: { children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id: "braindump-area" });
    return (
      <div
        ref={setNodeRef}
        className={cn("h-full p-1 rounded-lg", isOver && "bg-destructive/20")}
      >
        {children}
      </div>
    );
  };

  const weeklyTaskCount = useMemo(() => {
    return week.map(
      (day) =>
        tasks.filter(
          (task) =>
            task.scheduledDateTime && isSameDay(new Date(task.scheduledDateTime), day)
        ).length
    );
  }, [tasks, week]);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 5rem)' }}>
        <PageHeader title="Plan View">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "MMMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
        </PageHeader>
        
        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Brain Dump Sidebar */}
          <aside className="w-80 lg:w-96 flex-shrink-0">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Brain Dump</CardTitle>
                <CardDescription>Drag tasks to the calendar to schedule.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                <DroppableBrainDump>
                  <div className="flex-1 overflow-y-auto pr-2">
                    <SortableContext
                      items={unscheduledTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {unscheduledTasks.map((task) => (
                        <DraggableTask key={task.id} task={task} />
                      ))}
                    </SortableContext>
                  </div>
                  <div className="mt-4 flex gap-2 border-t pt-4">
                    <Input
                      placeholder="Add a new task..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    />
                    <Button onClick={handleAddTask} size="icon" aria-label="Add Task">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </DroppableBrainDump>
              </CardContent>
            </Card>
          </aside>
          
          {/* Main Timebox Area */}
          <div className="flex-1 overflow-hidden">
             <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Weekly Timebox</CardTitle>
                    <CardDescription>
                    {format(week[0], "MMMM d")} - {format(week[6], "MMMM d, yyyy")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                    <div
                      className="grid"
                      style={{
                          gridTemplateColumns: "50px repeat(7, 1fr)",
                          minWidth: "800px",
                      }}
                    >
                      <div />
                      {week.map((day, i) => (
                          <div
                          key={day.toISOString()}
                          className="text-center font-bold p-2 border-b"
                          >
                          <p>{format(day, "EEE")}</p>
                          <p className="text-muted-foreground text-sm">{format(day, "d")}</p>
                          <Badge
                              variant={weeklyTaskCount[i] > 0 ? "secondary" : "outline"}
                              className="mt-1"
                          >
                              {weeklyTaskCount[i]} tasks
                          </Badge>
                          </div>
                      ))}

                      {hours.map((hour) => (
                          <React.Fragment key={hour}>
                          <div className="text-right text-xs text-muted-foreground pr-2 pt-1 border-t">
                              {format(set(new Date(), { hours: hour, minutes: 0 }), "ha")}
                          </div>
                          {week.map((day) => (
                              <TimeSlot
                              key={day.toISOString()}
                              dateTime={set(day, { hours: hour, minutes: 0 })}
                              />
                          ))}
                          </React.Fragment>
                      ))}
                    </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeTask ? (
          <Card className="p-3 touch-none shadow-xl">
            <div className="flex items-center">
              <div className="flex-grow">
                <p className="font-medium">{activeTask.title}</p>
              </div>
              <PriorityBadge priority={activeTask.priority} />
            </div>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
