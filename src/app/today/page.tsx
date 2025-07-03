import { TodayView } from "@/components/TodayView";
import { getTasks } from "@/lib/data";
import { Task } from "@/lib/types";
import { isToday } from "date-fns";

export default function TodayPage() {
  const allTasks = getTasks();
  const todayTasks = allTasks.filter(
    (task: Task) => task.dueDate && isToday(new Date(task.dueDate))
  );

  return <TodayView initialTasks={todayTasks} />;
}
