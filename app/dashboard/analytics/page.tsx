"use client";

import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import {
  Ticket,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Users,
  Activity,
} from "lucide-react";

import API from "@/lib/axios";

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

export default function AnalyticsPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [ticketRes, userRes] = await Promise.all([
        API.get("/tickets"),

        API.get("/users"),
      ]);

      setTickets(ticketRes.data.data);

      setUsers(userRes.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const analytics = useMemo(() => {
    const totalTickets = tickets.length;

    const pendingTickets = tickets.filter((x) => x.status === "PENDING").length;

    const inProgressTickets = tickets.filter(
      (x) => x.status === "IN_PROGRESS",
    ).length;

    const solvedTickets = tickets.filter((x) => x.status === "SOLVED").length;

    const urgentTickets = tickets.filter((x) => x.priority === "URGENT").length;

    const activeUsers = users.filter((x) => x.is_active).length;

    const technicalUsers = users.filter((x) => x.role === "TECHNICAL").length;

    const customerCareUsers = users.filter(
      (x) => x.role === "CUSTOMER_CARE",
    ).length;

    const platformStats = {
      TIKTIKI: tickets.filter((x) => x.platform === "TIKTIKI").length,

      RETAIL: tickets.filter((x) => x.platform === "RETAIL").length,

      RANGS: tickets.filter((x) => x.platform === "RANGS").length,
    };

    return {
      totalTickets,

      pendingTickets,

      inProgressTickets,

      solvedTickets,

      urgentTickets,

      activeUsers,

      technicalUsers,

      customerCareUsers,

      platformStats,
    };
  }, [tickets, users]);

  const recentTickets = tickets.slice(0, 10);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>

        <p className="text-slate-500 mt-2 text-lg">
          Enterprise support system overview
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Tickets"
          value={analytics.totalTickets}
          icon={Ticket}
        />

        <StatsCard
          title="Pending"
          value={analytics.pendingTickets}
          icon={Clock3}
        />

        <StatsCard
          title="In Progress"
          value={analytics.inProgressTickets}
          icon={Activity}
        />

        <StatsCard
          title="Solved"
          value={analytics.solvedTickets}
          icon={CheckCircle2}
        />

        <StatsCard
          title="Urgent"
          value={analytics.urgentTickets}
          icon={AlertTriangle}
        />

        <StatsCard
          title="Active Users"
          value={analytics.activeUsers}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="lg:col-span-2"
        >
          <Card className="rounded-3xl border-0 shadow-xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Recent Tickets</h2>

              <p className="text-sm text-slate-500 mt-1">
                Latest support activities
              </p>
            </div>

            <div className="rounded-2xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>

                    <TableHead>Device</TableHead>

                    <TableHead>Platform</TableHead>

                    <TableHead>Priority</TableHead>

                    <TableHead>Status</TableHead>
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
                          <Badge className="rounded-full">
                            {ticket.platform}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="rounded-full">
                            {ticket.priority}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge className="rounded-full">
                            {ticket.status}
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
        >
          <Card className="rounded-3xl border-0 shadow-xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Platforms</h2>

              <p className="text-sm text-slate-500 mt-1">Ticket distribution</p>
            </div>

            <div className="space-y-5">
              <PlatformCard
                name="TIKTIKI"
                value={analytics.platformStats.TIKTIKI}
              />

              <PlatformCard
                name="RETAIL"
                value={analytics.platformStats.RETAIL}
              />

              <PlatformCard
                name="RANGS"
                value={analytics.platformStats.RANGS}
              />
            </div>

            <div className="border-t mt-6 pt-6 space-y-4">
              <MiniStat
                title="Technical Team"
                value={analytics.technicalUsers}
              />

              <MiniStat
                title="Customer Care"
                value={analytics.customerCareUsers}
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;

  value: number;

  icon: any;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <Card className="rounded-3xl border-0 shadow-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>

            <h1 className="text-4xl font-bold mt-2">{value}</h1>
          </div>

          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Icon className="h-6 w-6 text-slate-700" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PlatformCard({
  name,
  value,
}: {
  name: string;

  value: number;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border">
      <div>
        <p className="font-semibold">{name}</p>

        <p className="text-sm text-slate-500">Tickets</p>
      </div>

      <h1 className="text-3xl font-bold">{value}</h1>
    </div>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string;

  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-slate-600">{title}</p>

      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}
