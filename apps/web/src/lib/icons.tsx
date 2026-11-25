import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Boxes,
  Cloud,
  Container,
  GitBranch,
  GitMerge,
  Layers,
  Network,
  ShieldCheck,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Workflow,
  Terminal,
  GitBranch,
  Network,
  Container,
  Boxes,
  Cloud,
  Layers,
  GitMerge,
  Activity,
  ShieldCheck,
  Zap,
  BookOpen,
};

export function TopicIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Icon = (name ? ICON_MAP[name] : undefined) ?? BookOpen;
  return <Icon className={className} />;
}
