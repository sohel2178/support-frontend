"use client";

import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import { Users, Shield, Headphones, Wrench, Search } from "lucide-react";

import API from "@/lib/axios";

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

import CreateUserDialog from "@/components/users/CreateUserDialog";

import EditUserDialog from "@/components/users/EditUserDialog";

import DeleteUserDialog from "@/components/users/DeleteUserDialog";

import { Button } from "@/components/ui/button";

const roleConfig: any = {
  ADMIN: {
    icon: Shield,
    className: "bg-red-100 text-red-700 border-red-200",
  },

  SUPERVISOR: {
    icon: Users,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },

  CUSTOMER_CARE: {
    icon: Headphones,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },

  TECHNICAL: {
    icon: Wrench,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await API.get("/users");

      setUsers(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = search.toLowerCase();

      return (
        user.name?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  const toggleStatus = async (id: string) => {
    try {
      await API.patch(`/users/${id}/toggle-status`);

      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const stats = {
    total: users.length,

    admin: users.filter((x) => x.role === "ADMIN").length,

    supervisor: users.filter((x) => x.role === "SUPERVISOR").length,

    technical: users.filter((x) => x.role === "TECHNICAL").length,

    customerCare: users.filter((x) => x.role === "CUSTOMER_CARE").length,
  };

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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Users</h1>

          <p className="text-slate-500 mt-1">Manage support team members</p>
        </div>

        <CreateUserDialog onSuccess={fetchUsers} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total" value={stats.total} />

        <StatsCard title="Admins" value={stats.admin} />

        <StatsCard title="Supervisors" value={stats.supervisor} />

        <StatsCard title="Technical" value={stats.technical} />

        <StatsCard title="Customer Care" value={stats.customerCare} />
      </div>

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
        <Card className="rounded-3xl border-0 shadow-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Team Members</h2>

              <p className="text-sm text-slate-500 mt-1">
                All registered users
              </p>
            </div>

            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-2xl"
              />
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>

                  <TableHead>Username</TableHead>

                  <TableHead>Phone</TableHead>

                  <TableHead>Role</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6}>
                        <div className="h-12 rounded-xl animate-pulse bg-slate-100" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-slate-500"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => {
                    const roleData = roleConfig[user.role];

                    const Icon = roleData.icon;

                    return (
                      <motion.tr
                        key={user._id}
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
                          {user.name}
                        </TableCell>

                        <TableCell>{user.username}</TableCell>

                        <TableCell>{user.phone}</TableCell>

                        <TableCell>
                          <Badge
                            className={`rounded-full border px-3 py-1 ${roleData.className}`}
                          >
                            <Icon className="h-3 w-3 mr-1" />

                            {user.role}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {user.is_active ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border border-red-200 rounded-full px-3 py-1">
                              Disabled
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleStatus(user._id)}
                            >
                              {user.is_active ? "Disable" : "Enable"}
                            </Button>

                            <EditUserDialog
                              user={user}
                              onSuccess={fetchUsers}
                            />

                            <DeleteUserDialog
                              user={user}
                              onSuccess={fetchUsers}
                            />
                          </div>
                        </TableCell>
                      </motion.tr>
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

function StatsCard({
  title,
  value,
}: {
  title: string;

  value: number;
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
        <p className="text-sm text-slate-500">{title}</p>

        <h1 className="text-4xl font-bold mt-2">{value}</h1>
      </Card>
    </motion.div>
  );
}
