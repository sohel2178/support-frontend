"use client";

import { useMemo, useState } from "react";

import { motion } from "motion/react";
import { toast } from "sonner";
import { Search } from "lucide-react";

import API, { getErrorMessage } from "@/lib/axios";
import { FALLBACK_ROLE, ROLE_CONFIG, formatDate } from "@/lib/constants";
import { useFetch } from "@/hooks/useFetch";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, User } from "@/types";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function UsersPage() {
  const me = useAuthStore((s) => s.user);
  const usersQuery = useFetch<ApiResponse<User[]>>("/users");
  const users = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data]);

  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((u) =>
      [u.name, u.username, u.phone, u.role].some((v) => v?.toLowerCase().includes(query)),
    );
  }, [users, search]);

  const toggleStatus = async (user: User) => {
    try {
      setToggling(user._id);
      await API.patch(`/users/${user._id}/toggle-status`);
      toast.success(`${user.name} ${user.is_active ? "disabled" : "enabled"}`);
      usersQuery.reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setToggling(null);
    }
  };

  const count = (role: User["role"]) => users.filter((x) => x.role === role).length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Users</h1>
          <p className="text-slate-500 mt-1">Manage support team members</p>
        </div>

        <CreateUserDialog onSuccess={usersQuery.reload} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total" value={users.length} />
        <StatsCard title="Admins" value={count("ADMIN")} />
        <StatsCard title="Supervisors" value={count("SUPERVISOR")} />
        <StatsCard title="Technical" value={count("TECHNICAL")} />
        <StatsCard title="Customer Care" value={count("CUSTOMER_CARE")} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-3xl border-0 shadow-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Team Members</h2>
              <p className="text-sm text-slate-500 mt-1">All registered users</p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-2xl"
              />
            </div>
          </div>

          {usersQuery.error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {usersQuery.error}
            </div>
          )}

          <div className="rounded-2xl border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {usersQuery.loading && !usersQuery.data ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={7}>
                        <div className="h-12 rounded-xl animate-pulse bg-slate-100" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => {
                    const roleData = ROLE_CONFIG[user.role] ?? FALLBACK_ROLE;
                    const Icon = roleData.icon;
                    const isSelf = me?._id === user._id;

                    return (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b hover:bg-slate-50 transition"
                      >
                        <TableCell className="font-medium py-4">
                          {user.name}
                          {isSelf && <span className="text-slate-400 font-normal"> (you)</span>}
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge className={`rounded-full border px-3 py-1 ${roleData.className}`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {roleData.label}
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
                        <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                          {user.last_login ? formatDate(user.last_login) : "Never"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isSelf || toggling === user._id}
                              onClick={() => toggleStatus(user)}
                            >
                              {user.is_active ? "Disable" : "Enable"}
                            </Button>
                            <EditUserDialog user={user} onSuccess={usersQuery.reload} />
                            <DeleteUserDialog user={user} onSuccess={usersQuery.reload} disabled={isSelf} />
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

function StatsCard({ title, value }: { title: string; value: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-3xl border-0 shadow-lg p-5">
        <p className="text-sm text-slate-500">{title}</p>
        <h1 className="text-4xl font-bold mt-2">{value}</h1>
      </Card>
    </motion.div>
  );
}
