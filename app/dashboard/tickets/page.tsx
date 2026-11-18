"use client";

import { useState } from "react";

import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Search,
  Ticket as TicketIcon,
  X,
} from "lucide-react";

import { useFetch } from "@/hooks/useFetch";
import { useDebounce } from "@/hooks/useDebounce";
import { useTicketEvents } from "@/hooks/useTicketEvents";
import {
  PLATFORMS,
  PLATFORM_CONFIG,
  PRIORITIES,
  PRIORITY_CONFIG,
  STATUSES,
  STATUS_CONFIG,
  TICKET_CREATOR_ROLES,
  formatDate,
} from "@/lib/constants";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, Ticket, TicketListResponse, TicketStats } from "@/types";

import CreateTicketDialog from "@/components/tickets/CreateTicketDialog";
import TicketActions from "@/components/tickets/TicketActions";
import { PlatformBadge, PriorityBadge, StatusBadge } from "@/components/tickets/TicketBadges";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ALL = "ALL";
const PAGE_SIZE = 20;

export default function TicketsPage() {
  const user = useAuthStore((s) => s.user);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [platform, setPlatform] = useState(ALL);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const list = useFetch<TicketListResponse>("/tickets", {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status === ALL ? undefined : status,
    priority: priority === ALL ? undefined : priority,
    platform: platform === ALL ? undefined : platform,
  });
  const statsQuery = useFetch<ApiResponse<TicketStats>>("/tickets/stats");

  const tickets = list.data?.tickets ?? [];
  const pagination = list.data?.pagination;
  const stats = statsQuery.data?.data;

  const refresh = () => {
    list.reload();
    statsQuery.reload();
  };

  useTicketEvents((event, payload) => {
    refresh();

    const ticket = payload as Ticket;
    if (
      event === "ticket:new" &&
      ticket?.created_by?._id !== user?._id &&
      (user?.role === "TECHNICAL" || user?.role === "ADMIN" || user?.role === "SUPERVISOR")
    ) {
      toast.info(`New ticket ${ticket.ticket_no}`, { description: ticket.problem_type });
    }
    if (event === "ticket:assigned" && ticket?.assigned_to?._id === user?._id) {
      toast.info(`Ticket ${ticket.ticket_no} was assigned to you`);
    }
  });

  const resetPageAnd = (fn: (v: string) => void) => (v: string) => {
    setPage(1);
    fn(v);
  };

  const filtersActive = status !== ALL || priority !== ALL || platform !== ALL || search !== "";

  const clearFilters = () => {
    setSearch("");
    setStatus(ALL);
    setPriority(ALL);
    setPlatform(ALL);
    setPage(1);
  };

  const total = stats?.total ?? 0;
  const pct = (n = 0) => (total ? (n / total) * 100 : 0);
  const totalPages = pagination?.totalPages ?? 1;
  const initialLoading = list.loading && !list.data;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Tickets</h1>
          <p className="text-slate-500 mt-2 text-lg">
            {user?.role === "TECHNICAL"
              ? "Tickets assigned to you and unassigned pending tickets"
              : user?.role === "CUSTOMER_CARE"
                ? "Tickets you have created"
                : "Support ticket management"}
          </p>
        </div>

        {user && TICKET_CREATOR_ROLES.includes(user.role) && <CreateTicketDialog onSuccess={refresh} />}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <DashboardCard title="Total Tickets" value={total} icon={TicketIcon} />
        <DashboardCard title="Pending" value={stats?.byStatus.PENDING ?? 0} icon={Clock3} percent={pct(stats?.byStatus.PENDING)} />
        <DashboardCard title="In Progress" value={stats?.byStatus.IN_PROGRESS ?? 0} icon={Activity} percent={pct(stats?.byStatus.IN_PROGRESS)} />
        <DashboardCard title="Solved" value={stats?.byStatus.SOLVED ?? 0} icon={CheckCircle2} percent={pct(stats?.byStatus.SOLVED)} />
        <DashboardCard title="Urgent (open)" value={stats?.urgentOpen ?? 0} icon={AlertTriangle} percent={pct(stats?.urgentOpen)} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-3xl border-0 shadow-xl p-6 flex flex-col min-h-[calc(100vh-270px)]">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Ticket List</h2>
              <p className="text-sm text-slate-500 mt-1">
                {pagination ? `${pagination.total} ticket${pagination.total === 1 ? "" : "s"}` : "Loading..."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-70">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Ticket, device, phone, customer..."
                  value={search}
                  onChange={(e) => resetPageAnd(setSearch)(e.target.value)}
                  className="pl-10 rounded-2xl"
                />
              </div>

              <FilterSelect value={status} onChange={resetPageAnd(setStatus)} placeholder="All statuses"
                options={STATUSES.map((s) => [s, STATUS_CONFIG[s].label])} />
              <FilterSelect value={priority} onChange={resetPageAnd(setPriority)} placeholder="All priorities"
                options={PRIORITIES.map((p) => [p, PRIORITY_CONFIG[p].label])} />
              <FilterSelect value={platform} onChange={resetPageAnd(setPlatform)} placeholder="All platforms"
                options={PLATFORMS.map((p) => [p, PLATFORM_CONFIG[p].label])} />

              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {list.error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {list.error}{" "}
              <button className="underline" onClick={list.reload}>Retry</button>
            </div>
          )}

          <div className={`rounded-2xl border overflow-auto flex-1 transition-opacity ${list.loading && list.data ? "opacity-60" : ""}`}>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {initialLoading ? (
                  [...Array(8)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={10}>
                        <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-slate-500">
                      {filtersActive ? "No tickets match your filters" : "No tickets yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket, index) => (
                    <motion.tr
                      key={ticket._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b hover:bg-slate-50 transition"
                    >
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/tickets/${ticket._id}`} className="hover:text-blue-600 hover:underline">
                          {ticket.ticket_no}
                        </Link>
                      </TableCell>

                      <TableCell>{ticket.device_id}</TableCell>

                      <TableCell>
                        <PlatformBadge platform={ticket.platform} />
                      </TableCell>

                      <TableCell>
                        <HoverCard openDelay={150}>
                          <HoverCardTrigger asChild>
                            <Link
                              href={`/dashboard/tickets/${ticket._id}`}
                              className="block max-w-48 truncate font-medium hover:text-blue-600 transition"
                            >
                              {ticket.problem_type}
                            </Link>
                          </HoverCardTrigger>
                          <HoverCardContent side="top" align="start" className="w-96 rounded-2xl border shadow-2xl p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-semibold">{ticket.problem_type}</h4>
                                <StatusBadge status={ticket.status} className="px-2 py-0.5 text-xs" />
                              </div>
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-500 mb-2">Problem Description</p>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {ticket.problem_description || "No description provided"}
                                </p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>

                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>

                      <TableCell>
                        <div className="leading-tight">
                          <p>{ticket.customer_phone}</p>
                          {ticket.customer_name && <p className="text-xs text-slate-500">{ticket.customer_name}</p>}
                        </div>
                      </TableCell>

                      <TableCell>
                        {ticket.assigned_to?.name ?? <span className="text-slate-400">Unassigned</span>}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-sm text-slate-500">
                        <div className="leading-tight">
                          <p>{formatDate(ticket.createdAt)}</p>
                          <p className="text-xs">by {ticket.created_by?.name ?? "—"}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <TicketActions ticket={ticket} onChanged={refresh} />
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-5">
            <p className="text-sm text-slate-500">
              Page {pagination?.page ?? page} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-xl" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="outline" className="rounded-xl" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-36 rounded-2xl">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map(([v, label]) => (
          <SelectItem key={v} value={v}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
