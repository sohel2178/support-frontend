import {
  Headphones,
  Shield,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type {
  Platform,
  Priority,
  Role,
  Ticket,
  TicketStatus,
  User,
} from "@/types";

type BadgeConfig = { label: string; className: string };

export const STATUSES: TicketStatus[] = ["PENDING", "IN_PROGRESS", "SOLVED", "CLOSED"];
export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
export const PLATFORMS: Platform[] = ["TIKTIKI", "RETAIL", "RANGS"];
export const ROLES: Role[] = ["ADMIN", "SUPERVISOR", "CUSTOMER_CARE", "TECHNICAL"];

export const MANAGER_ROLES: Role[] = ["ADMIN", "SUPERVISOR"];
export const TICKET_CREATOR_ROLES: Role[] = ["ADMIN", "SUPERVISOR", "CUSTOMER_CARE"];

export const STATUS_CONFIG: Record<TicketStatus, BadgeConfig & { bar: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700 border-yellow-200", bar: "bg-yellow-400" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200", bar: "bg-blue-500" },
  SOLVED: { label: "Solved", className: "bg-emerald-100 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" },
  CLOSED: { label: "Closed", className: "bg-slate-100 text-slate-700 border-slate-200", bar: "bg-slate-400" },
};

export const PRIORITY_CONFIG: Record<Priority, BadgeConfig & { bar: string }> = {
  LOW: { label: "Low", className: "bg-slate-100 text-slate-700 border-slate-200", bar: "bg-slate-400" },
  MEDIUM: { label: "Medium", className: "bg-blue-100 text-blue-700 border-blue-200", bar: "bg-blue-500" },
  HIGH: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200", bar: "bg-orange-500" },
  URGENT: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200", bar: "bg-red-500" },
};

export const PLATFORM_CONFIG: Record<Platform, BadgeConfig & { bar: string }> = {
  TIKTIKI: { label: "TIKTIKI", className: "bg-purple-100 text-purple-700 border-purple-200", bar: "bg-purple-500" },
  RETAIL: { label: "RETAIL", className: "bg-cyan-100 text-cyan-700 border-cyan-200", bar: "bg-cyan-500" },
  RANGS: { label: "RANGS", className: "bg-pink-100 text-pink-700 border-pink-200", bar: "bg-pink-500" },
};

export const ROLE_CONFIG: Record<Role, BadgeConfig & { icon: LucideIcon }> = {
  ADMIN: { label: "Admin", icon: Shield, className: "bg-red-100 text-red-700 border-red-200" },
  SUPERVISOR: { label: "Supervisor", icon: Users, className: "bg-blue-100 text-blue-700 border-blue-200" },
  CUSTOMER_CARE: { label: "Customer Care", icon: Headphones, className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  TECHNICAL: { label: "Technical", icon: Wrench, className: "bg-amber-100 text-amber-700 border-amber-200" },
};

export const FALLBACK_ROLE = {
  label: "Unknown",
  icon: Users,
  className: "bg-slate-100 text-slate-700 border-slate-200",
};

export const isManager = (user: Pick<User, "role"> | null | undefined) =>
  !!user && MANAGER_ROLES.includes(user.role);

/** Landing page for each role. */
export const homeFor = (role?: Role) =>
  role && MANAGER_ROLES.includes(role) ? "/dashboard" : "/dashboard/tickets";

/** Which roles may open a route (longest matching prefix wins). Unlisted routes: any signed-in user. */
const ROUTE_ROLES: [string, Role[]][] = [
  ["/dashboard/users", ["ADMIN"]],
  ["/dashboard/analytics", MANAGER_ROLES],
  ["/dashboard/tickets", ROLES],
  ["/dashboard/profile", ROLES],
];

export const canOpenRoute = (pathname: string, role: Role) => {
  if (pathname === "/dashboard") return MANAGER_ROLES.includes(role);
  const match = ROUTE_ROLES.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return match ? match[1].includes(role) : true;
};

/** Mirrors the backend status-transition rules (backend remains the source of truth). */
const TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  PENDING: ["IN_PROGRESS", "CLOSED"],
  IN_PROGRESS: ["SOLVED", "PENDING", "CLOSED"],
  SOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: ["IN_PROGRESS"],
};
const TECHNICAL_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  PENDING: ["IN_PROGRESS"],
  IN_PROGRESS: ["SOLVED"],
  SOLVED: ["IN_PROGRESS"],
  CLOSED: [],
};

export const allowedTransitions = (
  user: Pick<User, "_id" | "role"> | null,
  ticket: Pick<Ticket, "status" | "assigned_to">,
): TicketStatus[] => {
  if (!user) return [];
  if (MANAGER_ROLES.includes(user.role)) return TRANSITIONS[ticket.status];
  if (user.role === "TECHNICAL") {
    if (!ticket.assigned_to && ticket.status === "PENDING") return ["IN_PROGRESS"];
    return ticket.assigned_to?._id === user._id ? TECHNICAL_TRANSITIONS[ticket.status] : [];
  }
  return [];
};

export const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
