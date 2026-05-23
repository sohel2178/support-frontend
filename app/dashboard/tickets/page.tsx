"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  Search,
  Ticket,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Activity,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import API from "@/lib/axios";

import { socket } from "@/lib/socket";

import { useAuthStore } from "@/store/auth.store";

import CreateTicketDialog from "@/components/tickets/CreateTicketDialog";

import EditTicketDialog from "@/components/tickets/EditTicketDialog";

import DeleteTicketDialog from "@/components/tickets/DeleteTicketDialog";

import { Card } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusConfig: any = {
  PENDING: {
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },

  IN_PROGRESS: {
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },

  SOLVED: {
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },

  CLOSED: {
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const priorityConfig: any = {
  LOW: {
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },

  MEDIUM: {
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },

  HIGH: {
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },

  URGENT: {
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

const platformConfig: any = {
  TIKTIKI: {
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },

  RETAIL: {
    className: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },

  RANGS: {
    className: "bg-pink-100 text-pink-700 border-pink-200",
  },
};

export default function TicketsPage() {
  const { user } = useAuthStore();

  const [tickets, setTickets] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<any>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const res = await API.get("/tickets", {
        params: {
          page,

          limit: 20,

          search,
        },
      });

      setTickets(res.data.tickets || []);

      setPagination(res.data.pagination);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, search]);

  // realtime socket
  useEffect(() => {
    if (!user) return;

    // join technical room
    if (user.role === "TECHNICAL") {
      socket.emit("join_room", "technical_room");
    }

    // new ticket
    socket.off("ticket:new");

    socket.on("ticket:new", (ticket) => {
      setTickets((prev) => [ticket, ...prev]);
    });

    // updated ticket
    socket.off("ticket:updated");

    socket.on("ticket:updated", (updatedTicket) => {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === updatedTicket._id ? updatedTicket : ticket,
        ),
      );
    });

    // deleted ticket
    socket.off("ticket:deleted");

    socket.on("ticket:deleted", (deletedTicket) => {
      setTickets((prev) =>
        prev.filter((ticket) => ticket._id !== deletedTicket._id),
      );
    });

    return () => {
      socket.off("ticket:new");

      socket.off("ticket:updated");

      socket.off("ticket:deleted");
    };
  }, [user]);

  const stats = {
    total: pagination?.total || 0,

    pending: tickets.filter((x) => x.status === "PENDING").length,

    inProgress: tickets.filter((x) => x.status === "IN_PROGRESS").length,

    solved: tickets.filter((x) => x.status === "SOLVED").length,

    urgent: tickets.filter((x) => x.priority === "URGENT").length,
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Tickets</h1>

          <p className="text-slate-500 mt-2 text-lg">
            Support ticket management
          </p>
        </div>

        {["ADMIN", "SUPERVISOR", "CUSTOMER_CARE"].includes(user?.role) && (
          <CreateTicketDialog onSuccess={fetchTickets} />
        )}
      </motion.div>

      {/* stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatsCard title="Total Tickets" value={stats.total} icon={Ticket} />

        <StatsCard title="Pending" value={stats.pending} icon={Clock3} />

        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={Activity}
        />

        <StatsCard title="Solved" value={stats.solved} icon={CheckCircle2} />

        <StatsCard title="Urgent" value={stats.urgent} icon={AlertTriangle} />
      </div>

      {/* table */}
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
        <Card className="rounded-3xl border-0 shadow-xl p-6 flex flex-col h-[calc(100vh-270px)]">
          {/* top */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Ticket List</h2>

              <p className="text-sm text-slate-500 mt-1">All support tickets</p>
            </div>

            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => {
                  setPage(1);

                  setSearch(e.target.value);
                }}
                className="pl-10 rounded-2xl"
              />
            </div>
          </div>

          {/* table scroll */}
          <div className="rounded-2xl border overflow-auto flex-1">
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

                  <TableHead>Created By</TableHead>

                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  [...Array(8)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={9}>
                        <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-slate-500"
                    >
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket, index) => (
                    <motion.tr
                      key={ticket._id}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.02,
                      }}
                      className="border-b hover:bg-slate-50 transition"
                    >
                      <TableCell className="font-medium">
                        {ticket.ticket_no}
                      </TableCell>

                      <TableCell>{ticket.device_id}</TableCell>

                      <TableCell>
                        <Badge
                          className={`rounded-full border px-3 py-1 ${platformConfig[ticket.platform]?.className}`}
                        >
                          {ticket.platform}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <HoverCard openDelay={150}>
                          <HoverCardTrigger asChild>
                            <div className="cursor-pointer font-medium hover:text-blue-600 transition">
                              {ticket.problem_type}
                            </div>
                          </HoverCardTrigger>

                          <HoverCardContent
                            side="top"
                            align="start"
                            className="w-96 rounded-2xl border shadow-2xl p-4"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">
                                  {ticket.problem_type}
                                </h4>

                                <Badge
                                  className={`rounded-full border px-2 py-0.5 text-xs ${statusConfig[ticket.status]?.className}`}
                                >
                                  {ticket.status}
                                </Badge>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-500 mb-2">
                                  Problem Description
                                </p>

                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {ticket.problem_description ||
                                    "No description provided"}
                                </p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`rounded-full border px-3 py-1 ${priorityConfig[ticket.priority]?.className}`}
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`rounded-full border px-3 py-1 ${statusConfig[ticket.status]?.className}`}
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>

                      <TableCell>{ticket.customer_phone}</TableCell>

                      <TableCell>{ticket.created_by?.name}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {["ADMIN", "SUPERVISOR", "TECHNICAL"].includes(
                            user?.role,
                          ) && (
                            <EditTicketDialog
                              ticket={ticket}
                              onSuccess={fetchTickets}
                            />
                          )}

                          {user?.role === "ADMIN" && (
                            <DeleteTicketDialog
                              ticket={ticket}
                              onSuccess={fetchTickets}
                            />
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* pagination */}
          <div className="flex items-center justify-between pt-5">
            <p className="text-sm text-slate-500">
              Page {pagination?.page} of {pagination?.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>

              <button
                disabled={page === pagination?.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
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
