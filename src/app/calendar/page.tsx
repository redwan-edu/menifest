import { CalendarView } from "@/components/CalendarView";
import { getTasks } from "@/lib/data";

export default function CalendarPage() {
  const tasks = getTasks();
  return <CalendarView allTasks={tasks} />;
}
