"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Inbox,
  Ticket as TicketIcon,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { API_URL } from "@/lib/config";
import { PLATFORMS, PLATFORM_CONFIG, formatDate } from "@/lib/constants";
import { useFetch } from "@/hooks/useFetch";
import { useTicketEvents } from "@/hooks/useTicketEvents";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, TicketListResponse, TicketStats, User } from "@/types";

import DashboardCard from "@/components/dashboard/DashboardCard";
import BreakdownBars from "@/components/dashboard/BreakdownBars";
import { PlatformBadge, PriorityBadge, StatusBadge } from "@/components/tickets/TicketBadges";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** Polls the API health endpoint every 30s. */
function useApiHealth() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const check = () =>
      fetch(`${API_URL}/`)
        .then((r) => active && setOnline(r.ok))
        .catch(() => active && setOnline(false));

    check();
    const id = setInterval(check, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return online;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const online = useApiHealth();

  const statsQuery = useFetch<ApiResponse<TicketStats>>("/tickets/stats");
  const recentQuery = useFetch<TicketListResponse>("/tickets", { limit: 8 });
  const usersQuery = useFetch<ApiResponse<User[]>>("/users");

  useTicketEvents(() => {
    statsQuery.reload();
    recentQuery.reload();
  });

  const stats = statsQuery.data?.data;
  const recent = recentQuery.data?.tickets ?? [];
  const users = usersQuery.data?.data ?? [];
  const total = stats?.total ?? 0;
  const pct = (n = 0) => (total ? (n / total) * 100 : 0);

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name} 👋</p>
        </div>

        <div className="hidden md:flex items-center gap-3 bg-white border shadow-sm rounded-2xl px-5 py-3">
          {online === false ? (
            <TrendingDown className="w-5 h-5 text-red-500" />
          ) : (
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          )}
          <div>
            <p className="text-sm text-slate-500">System Status</p>
            <h3
              className={`font-semibold ${
                online === null ? "text-slate-400" : online ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {online === null ? "Checking..." : online ? "Operational" : "API unreachable"}
            </h3>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <DashboardCard title="Total Tickets" value={total} icon={TicketIcon} />
        <DashboardCard title="Pending" value={stats?.byStatus.PENDING ?? 0} icon={Clock3} percent={pct(stats?.byStatus.PENDING)} hint={`${stats?.unassigned ?? 0} unassigned`} />
        <DashboardCard title="In Progress" value={stats?.byStatus.IN_PROGRESS ?? 0} icon={Activity} percent={pct(stats?.byStatus.IN_PROGRESS)} />
        <DashboardCard title="Solved" value={stats?.byStatus.SOLVED ?? 0} icon={CheckCircle2} percent={pct(stats?.byStatus.SOLVED)} />
        <DashboardCard title="Urgent (open)" value={stats?.urgentOpen ?? 0} icon={AlertTriangle} percent={pct(stats?.urgentOpen)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-2">
          <Card className="rounded-3xl border-0 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Recent Tickets</h2>
                <p className="text-sm text-slate-500 mt-1">Latest support activities</p>
              </div>
              <Link href="/dashboard/tickets" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                View all →
              </Link>
            </div>

            <div className="rounded-2xl border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {recentQuery.loading && !recentQuery.data ? (
                    [...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={6}>
                          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : recent.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                        No tickets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recent.map((ticket) => (
                      <TableRow key={ticket._id} className="hover:bg-slate-50">
                        <TableCell className="font-medium py-3">
                          <Link href={`/dashboard/tickets/${ticket._id}`} className="hover:text-blue-600 hover:underline">
                            {ticket.ticket_no}
                          </Link>
                        </TableCell>
                        <TableCell>{ticket.device_id}</TableCell>
                        <TableCell><PlatformBadge platform={ticket.platform} /></TableCell>
                        <TableCell><StatusBadge status={ticket.status} /></TableCell>
                        <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                        <TableCell className="text-sm text-slate-500 whitespace-nowrap">{formatDate(ticket.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="rounded-3xl border-0 shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-semibold">Team</h2>
                <p className="text-sm text-slate-500 mt-1">Support members</p>
              </div>
              <div className="bg-slate-100 rounded-2xl p-3">
                <Users className="w-5 h-5 text-slate-700" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TeamStat title="Active" value={users.filter((x) => x.is_active).length} />
              <TeamStat title="Technical" value={users.filter((x) => x.role === "TECHNICAL").length} />
              <TeamStat title="Customer Care" value={users.filter((x) => x.role === "CUSTOMER_CARE").length} />
              <TeamStat title="Supervisors" value={users.filter((x) => x.role === "SUPERVISOR").length} />
            </div>
          </Card>

          <Card className="rounded-3xl border-0 shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold">Platforms</h2>
              <Inbox className="w-5 h-5 text-slate-500" />
            </div>
            <BreakdownBars
              total={total}
              rows={PLATFORMS.map((p) => ({
                key: p,
                label: PLATFORM_CONFIG[p].label,
                value: stats?.byPlatform[p] ?? 0,
                bar: PLATFORM_CONFIG[p].bar,
              }))}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function TeamStat({ title, value }: { title: string; value: number }) {
  return (
    <div className="border rounded-2xl p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}
