import {
  ArrowRightLeft,
  Info,
  MessageSquare,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { formatDate } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TimelineEntry, TimelineType } from "@/types";

const TIMELINE_STYLE: Record<TimelineType, { icon: LucideIcon; className: string }> = {
  COMMENT: { icon: MessageSquare, className: "bg-blue-100 text-blue-700" },
  STATUS_CHANGE: { icon: ArrowRightLeft, className: "bg-emerald-100 text-emerald-700" },
  ASSIGN: { icon: UserPlus, className: "bg-amber-100 text-amber-700" },
  SYSTEM: { icon: Info, className: "bg-slate-100 text-slate-600" },
};

const COMPACT_LIMIT = 6;

/** Vertical ticket timeline. `compact` shows only the latest entries in a denser layout. */
export default function TimelineList({
  entries,
  currentUserId,
  compact = false,
}: {
  entries: TimelineEntry[];
  currentUserId?: string;
  compact?: boolean;
}) {
  const hidden = compact ? Math.max(0, entries.length - COMPACT_LIMIT) : 0;
  const shown = hidden ? entries.slice(-COMPACT_LIMIT) : entries;

  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No activity yet.</p>;
  }

  return (
    <div className="space-y-3">
      {hidden > 0 && (
        <p className="text-xs text-slate-400 pl-1">+{hidden} earlier update{hidden === 1 ? "" : "s"}</p>
      )}

      <ol
        className={cn(
          "relative before:absolute before:top-2 before:bottom-2 before:w-px before:bg-slate-200",
          compact ? "space-y-3 before:left-3" : "space-y-5 before:left-4",
        )}
      >
        {shown.map((entry) => {
          const style = TIMELINE_STYLE[entry.type] ?? TIMELINE_STYLE.SYSTEM;
          const Icon = style.icon;
          const mine = !!currentUserId && entry.created_by?._id === currentUserId;

          return (
            <li key={entry._id} className={cn("relative flex", compact ? "gap-3" : "gap-4")}>
              <div
                className={cn(
                  "relative z-10 shrink-0 rounded-full flex items-center justify-center",
                  compact ? "h-6 w-6" : "h-8 w-8",
                  style.className,
                )}
              >
                <Icon className={compact ? "h-3 w-3" : "h-4 w-4"} />
              </div>

              <div className="min-w-0 flex-1">
                <div className={cn("flex flex-wrap items-baseline gap-x-2", compact ? "text-xs" : "text-sm")}>
                  <span className="font-medium">
                    {entry.created_by?.name ?? "System"}
                    {mine && <span className="text-slate-400 font-normal"> (you)</span>}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(entry.createdAt)}</span>
                </div>

                {entry.type === "COMMENT" ? (
                  <p
                    className={cn(
                      "mt-1 rounded-2xl bg-slate-50 border text-slate-700 whitespace-pre-wrap wrap-break-word",
                      compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
                    )}
                  >
                    {entry.message}
                  </p>
                ) : (
                  <p className={cn("text-slate-600", compact ? "text-xs" : "text-sm")}>{entry.message}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
