"use client";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Ticket,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";

import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuthStore();

  const menus = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,

      roles: ["ADMIN", "SUPERVISOR"],
    },

    {
      label: "Tickets",
      href: "/dashboard/tickets",
      icon: Ticket,

      roles: ["ADMIN", "SUPERVISOR", "CUSTOMER_CARE", "TECHNICAL"],
    },

    {
      label: "Users",
      href: "/dashboard/users",
      icon: Users,

      roles: ["ADMIN"],
    },

    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,

      roles: ["ADMIN", "SUPERVISOR"],
    },
  ];

  return (
    <div className="w-[260px] h-screen bg-white border-r flex flex-col">
      <div className="p-5 border-b">
        <h1 className="text-3xl font-bold tracking-tight">GPS Support</h1>

        <p className="text-sm text-slate-500 mt-1">Enterprise Helpdesk</p>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {menus
          .filter((menu) => menu.roles.includes(user?.role))
          .map((menu) => {
            const Icon = menu.icon;

            const active = pathname === menu.href;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  active
                    ? "bg-black text-white shadow-lg"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <Icon className="w-5 h-5" />

                <span className="font-medium">{menu.label}</span>
              </Link>
            );
          })}
      </div>

      <div className="p-4 border-t">
        <div className="mb-4">
          <p className="font-semibold">{user?.name}</p>

          <p className="text-sm text-slate-500">{user?.role}</p>
        </div>

        <Button
          variant="destructive"
          className="w-full rounded-2xl h-11"
          onClick={() => {
            logout();

            router.push("/login");
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
