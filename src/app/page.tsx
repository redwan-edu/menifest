import { GoalView } from "@/components/GoalView";
import { getGoals } from "@/lib/data";

export default function Home() {
  const goals = getGoals();

  return <GoalView initialGoals={goals} />;
}
