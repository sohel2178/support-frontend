"use client";

import { motion } from "motion/react";
import { Gauge, Layers, ShieldAlert, Wrench } from "lucide-react";

import {
  PLATFORMS,
  PLATFORM_CONFIG,
  PRIORITIES,
  PRIORITY_CONFIG,
  STATUSES,
  STATUS_CONFIG,
} from "@/lib/constants";
import { useFetch } from "@/hooks/useFetch";
import { useTicketEvents } from "@/hooks/useTicketEvents";
import type { ApiResponse, TicketStats } from "@/types";

import DashboardCard from "@/components/dashboard/DashboardCard";
import BreakdownBars from "@/components/dashboard/BreakdownBars";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AnalyticsPage() {
  const statsQuery = useFetch<ApiResponse<TicketStats>>("/tickets/stats");
  useTicketEvents(() => statsQuery.reload());

  const stats = statsQuery.data?.data;
  const total = stats?.total ?? 0;
  const resolved = (stats?.byStatus.SOLVED ?? 0) + (stats?.byStatus.CLOSED ?? 0);
  const open = (stats?.byStatus.PENDING ?? 0) + (stats?.byStatus.IN_PROGRESS ?? 0);
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
  const technicians = stats?.byTechnician ?? [];

  if (statsQuery.error && !stats) {
    return (
      <Card className="rounded-3xl border-0 shadow-xl p-10 text-center text-slate-600">
        {statsQuery.error}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-slate-500 mt-1">Ticket breakdowns and team performance</p>
      </motion.div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardCard title="Resolution Rate" value={`${resolutionRate}%`} icon={Gauge} percent={resolutionRate} hint={`${resolved} of ${total} resolved`} />
        <DashboardCard title="Open Tickets" value={open} icon={Layers} percent={total ? (open / total) * 100 : 0} />
        <DashboardCard title="Urgent (open)" value={stats?.urgentOpen ?? 0} icon={ShieldAlert} percent={open ? ((stats?.urgentOpen ?? 0) / open) * 100 : 0} hint="share of open tickets" />
        <DashboardCard title="Unassigned" value={stats?.unassigned ?? 0} icon={Wrench} percent={open ? ((stats?.unassigned ?? 0) / open) * 100 : 0} hint="pending, no technician" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BreakdownCard title="By Status" total={total}
          rows={STATUSES.map((s) => ({ key: s, label: STATUS_CONFIG[s].label, value: stats?.byStatus[s] ?? 0, bar: STATUS_CONFIG[s].bar }))} />
        <BreakdownCard title="By Priority" total={total}
          rows={PRIORITIES.map((p) => ({ key: p, label: PRIORITY_CONFIG[p].label, value: stats?.byPriority[p] ?? 0, bar: PRIORITY_CONFIG[p].bar }))} />
        <BreakdownCard title="By Platform" total={total}
          rows={PLATFORMS.map((p) => ({ key: p, label: PLATFORM_CONFIG[p].label, value: stats?.byPlatform[p] ?? 0, bar: PLATFORM_CONFIG[p].bar }))} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-3xl border-0 shadow-xl p-6">
          <h2 className="text-2xl font-semibold">Technician Performance</h2>
          <p className="text-sm text-slate-500 mt-1 mb-5">Tickets assigned to each technician</p>

          <div className="rounded-2xl border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead className="text-right">Assigned</TableHead>
                  <TableHead className="text-right">In Progress</TableHead>
                  <TableHead className="text-right">Resolved</TableHead>
                  <TableHead className="w-1/3">Resolution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsQuery.loading && !stats ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                    </TableCell>
                  </TableRow>
                ) : technicians.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                      No tickets have been assigned yet
                    </TableCell>
                  </TableRow>
                ) : (
                  technicians.map((t) => {
                    const rate = t.assigned ? Math.round((t.solved / t.assigned) * 100) : 0;
                    return (
                      <TableRow key={t._id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{t.assigned}</TableCell>
                        <TableCell className="text-right tabular-nums">{t.open}</TableCell>
                        <TableCell className="text-right tabular-nums">{t.solved}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${rate}%` }} />
                            </div>
                            <span className="text-sm text-slate-500 w-10 text-right tabular-nums">{rate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function BreakdownCard({
  title,
  total,
  rows,
}: {
  title: string;
  total: number;
  rows: { key: string; label: string; value: number; bar: string }[];
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-3xl border-0 shadow-xl p-6 h-full">
        <h2 className="text-xl font-semibold mb-5">{title}</h2>
        <BreakdownBars rows={rows} total={total} />
      </Card>
    </motion.div>
  );
}
