"use client";

import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import {
  Ticket,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Users,
  TrendingUp,
} from "lucide-react";

import API from "@/lib/axios";

import DashboardCard from "@/components/dashboard/DashboardCard";

import { Card } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import { useAuthStore } from "@/store/auth.store";

export default function DashboardPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const requests: any = [API.get("/tickets")];

      if (["ADMIN", "SUPERVISOR"].includes(user?.role)) {
        requests.push(API.get("/users"));
      }

      const responses = await Promise.all(requests);

      setTickets(responses[0]?.data?.tickets || []);

      if (responses[1]) {
        setUsers(responses[1]?.data?.data || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  const analytics = useMemo(() => {
    return {
      total: tickets?.length || 0,

      pending: tickets.filter((x) => x.status === "PENDING").length,

      inProgress: tickets.filter((x) => x.status === "IN_PROGRESS").length,

      solved: tickets.filter((x) => x.status === "SOLVED").length,

      urgent: tickets.filter((x) => x.priority === "URGENT").length,

      activeUsers: users?.filter((x) => x.is_active).length || 0,
    };
  }, [tickets, users]);

  const recentTickets = tickets.slice(0, 8);

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

          <p className="text-slate-500 mt-1">
            Welcome back, {user?.name}
            👋
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3 bg-white border shadow-sm rounded-2xl px-5 py-3">
          <TrendingUp className="w-5 h-5 text-emerald-500" />

          <div>
            <p className="text-sm text-slate-500">System Status</p>

            <h3 className="font-semibold text-emerald-600">Operational</h3>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <DashboardCard
          title="Total Tickets"
          value={String(analytics.total)}
          icon={Ticket}
        />

        <DashboardCard
          title="Pending"
          value={String(analytics.pending)}
          icon={Clock3}
        />

        <DashboardCard
          title="In Progress"
          value={String(analytics.inProgress)}
          icon={Activity}
        />

        <DashboardCard
          title="Solved"
          value={String(analytics.solved)}
          icon={CheckCircle2}
        />

        <DashboardCard
          title="Urgent"
          value={String(analytics.urgent)}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="xl:col-span-2"
        >
          <Card className="rounded-3xl border-0 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Recent Tickets</h2>

                <p className="text-sm text-slate-500 mt-1">
                  Latest support activities
                </p>
              </div>

              <div className="bg-slate-100 rounded-2xl p-3">
                <Ticket className="w-5 h-5 text-slate-700" />
              </div>
            </div>

            <div className="rounded-2xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>

                    <TableHead>Device</TableHead>

                    <TableHead>Platform</TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={5}>
                          <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : recentTickets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-slate-500"
                      >
                        No tickets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTickets.map((ticket, index) => (
                      <motion.tr
                        key={ticket._id}
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.03,
                        }}
                        className="border-b hover:bg-slate-50 transition"
                      >
                        <TableCell className="font-medium py-4">
                          {ticket.ticket_no}
                        </TableCell>

                        <TableCell>{ticket.device_id}</TableCell>

                        <TableCell>
                          <Badge className="rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {ticket.platform}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`rounded-full ${
                              ticket.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                : ticket.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                  : ticket.status === "SOLVED"
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {ticket.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`rounded-full ${
                              ticket.priority === "URGENT"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : ticket.priority === "HIGH"
                                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="space-y-4 overflow-auto"
        >
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

            <div className="space-y-4">
              <TeamStat title="Active Users" value={analytics.activeUsers} />

              <TeamStat
                title="Admins"
                value={users.filter((x) => x.role === "ADMIN").length}
              />

              <TeamStat
                title="Technical"
                value={users.filter((x) => x.role === "TECHNICAL").length}
              />

              <TeamStat
                title="Customer Care"
                value={users.filter((x) => x.role === "CUSTOMER_CARE").length}
              />
            </div>
          </Card>

          <Card className="rounded-3xl border-0 shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-5">Platforms</h2>

            <div className="space-y-4">
              <PlatformItem
                title="TIKTIKI"
                count={tickets.filter((x) => x.platform === "TIKTIKI").length}
              />

              <PlatformItem
                title="RETAIL"
                count={tickets.filter((x) => x.platform === "RETAIL").length}
              />

              <PlatformItem
                title="RANGS"
                count={tickets.filter((x) => x.platform === "RANGS").length}
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function TeamStat({
  title,
  value,
}: {
  title: string;

  value: number;
}) {
  return (
    <div className="flex items-center justify-between border rounded-2xl p-4">
      <p className="text-slate-600">{title}</p>

      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  );
}

function PlatformItem({
  title,
  count,
}: {
  title: string;

  count: number;
}) {
  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-2xl border p-4">
      <div>
        <p className="font-semibold">{title}</p>

        <p className="text-sm text-slate-500">Tickets</p>
      </div>

      <h2 className="text-3xl font-bold">{count}</h2>
    </div>
  );
}
