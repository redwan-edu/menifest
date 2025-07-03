export type Priority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: Priority;
  completed: boolean;
  milestoneId: string;
  goalId: string;
  scheduledDateTime: string | null;
}

export interface Milestone {
  id:string;
  title: string;
  dueDate: string | null;
  tasks: Task[];
  goalId: string;
}

export interface Goal {
  id: string;
  title: string;
  deadline: string | null;
  category: string;
  milestones: Milestone[];
}
