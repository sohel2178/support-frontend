import { Badge } from "@/components/ui/badge";
import { PLATFORM_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Platform, Priority, TicketStatus } from "@/types";

const base = "rounded-full border px-3 py-1";

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  const c = STATUS_CONFIG[status];
  return <Badge className={cn(base, c?.className, className)}>{c?.label ?? status}</Badge>;
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const c = PRIORITY_CONFIG[priority];
  return <Badge className={cn(base, c?.className, className)}>{c?.label ?? priority}</Badge>;
}

export function PlatformBadge({ platform, className }: { platform: Platform; className?: string }) {
  const c = PLATFORM_CONFIG[platform];
  return <Badge className={cn(base, c?.className, className)}>{c?.label ?? platform}</Badge>;
}
