import { MindmapView } from "@/components/MindmapView";
import { getGoals } from "@/lib/data";

export default function MindmapPage() {
  const goals = getGoals();
  return <MindmapView goals={goals} />;
}
