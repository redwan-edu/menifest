import { Goal, Milestone, Task } from "./types";

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const nextMonth = new Date(today);
nextMonth.setMonth(nextMonth.getMonth() + 1);

const tasks: Task[] = [
  { id: "t1", milestoneId: "m1", goalId: "g1", title: "Setup Next.js project", dueDate: today.toISOString(), priority: "High", completed: true, scheduledDateTime: new Date(new Date(today).setHours(9, 0, 0, 0)).toISOString() },
  { id: "t2", milestoneId: "m1", goalId: "g1", title: "Create basic components", dueDate: tomorrow.toISOString(), priority: "Medium", completed: false, scheduledDateTime: new Date(new Date(tomorrow).setHours(11, 0, 0, 0)).toISOString() },
  { id: "t3", milestoneId: "m2", goalId: "g1", title: "Read App Router docs", dueDate: today.toISOString(), priority: "High", completed: true, scheduledDateTime: null },
  { id: "t4", milestoneId: "m2", goalId: "g1", title: "Implement server components", dueDate: nextWeek.toISOString(), priority: "Medium", completed: false, scheduledDateTime: null },
  { id: "t5", milestoneId: "m3", goalId: "g2", title: "Create user schema in Supabase", dueDate: null, priority: "High", completed: true, scheduledDateTime: null },
  { id: "t6", milestoneId: "m3", goalId: "g2", title: "Implement RLS policies", dueDate: today.toISOString(), priority: "High", completed: false, scheduledDateTime: new Date(new Date(today).setHours(14, 0, 0, 0)).toISOString() },
  { id: "t7", milestoneId: "m4", goalId: "g2", title: "Build login form", dueDate: nextWeek.toISOString(), priority: "Medium", completed: false, scheduledDateTime: new Date(new Date(nextWeek).setHours(10, 0, 0, 0)).toISOString() },
  { id: "t8", milestoneId: "m5", goalId: "g3", title: "Go for a 30-minute run", dueDate: today.toISOString(), priority: "Medium", completed: true, scheduledDateTime: null },
  { id: "t9", milestoneId: "m5", goalId: "g3", title: "Meal prep for the week", dueDate: tomorrow.toISOString(), priority: "Low", completed: false, scheduledDateTime: null },
  { id: "t10", milestoneId: "m6", goalId: "g3", title: "Finish 'Atomic Habits'", dueDate: nextMonth.toISOString(), priority: "Low", completed: false, scheduledDateTime: null },
];

const milestones: Milestone[] = [
  { id: "m1", goalId: "g1", title: "Project Setup", dueDate: nextWeek.toISOString(), tasks: [] },
  { id: "m2", goalId: "g1", title: "Core Concepts", dueDate: nextMonth.toISOString(), tasks: [] },
  { id: "m3", goalId: "g2", title: "Database Setup", dueDate: tomorrow.toISOString(), tasks: [] },
  { id: "m4", goalId: "g2", title: "Authentication", dueDate: nextWeek.toISOString(), tasks: [] },
  { id: "m5", goalId: "g3", title: "Improve Fitness", dueDate: nextMonth.toISOString(), tasks: [] },
  { id: "m6", goalId: "g3", title: "Read More", dueDate: null, tasks: [] },
];

const goals: Goal[] = [
  { id: "g1", title: "Learn Next.js 14", deadline: nextMonth.toISOString(), category: "Career", milestones: [] },
  { id: "g2", title: "Build a Full-Stack App", deadline: null, category: "Career", milestones: [] },
  { id: "g3", title: "Focus on Health", deadline: nextMonth.toISOString(), category: "Health", milestones: [] },
];

const getMilestonesForGoal = (goalId: string): Milestone[] => {
  return milestones
    .filter(m => m.goalId === goalId)
    .map(m => ({
      ...m,
      tasks: tasks.filter(t => t.milestoneId === m.id)
    }));
};

const getGoals = (): Goal[] => {
  return goals.map(g => ({
    ...g,
    milestones: getMilestonesForGoal(g.id),
  }));
};

const getTasks = (): Task[] => {
  return tasks;
}

export { getGoals, getTasks };
