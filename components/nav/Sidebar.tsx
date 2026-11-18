"use client";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Ticket,
  UserCircle,
  Users,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { ROLE_CONFIG, ROLES } from "@/lib/constants";
import type { Role } from "@/types";

import { Button } from "@/components/ui/button";

const MENUS: { label: string; href: string; icon: typeof Ticket; roles: Role[] }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SUPERVISOR"] },
  { label: "Tickets", href: "/dashboard/tickets", icon: Ticket, roles: ROLES },
  { label: "Users", href: "/dashboard/users", icon: Users, roles: ["ADMIN"] },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, roles: ["ADMIN", "SUPERVISOR"] },
  { label: "Profile", href: "/dashboard/profile", icon: UserCircle, roles: ROLES },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="w-65 h-screen bg-white border-r flex flex-col shrink-0">
      <div className="p-5 border-b">
        <h1 className="text-3xl font-bold tracking-tight">GPS Support</h1>
        <p className="text-sm text-slate-500 mt-1">Enterprise Helpdesk</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {MENUS.filter((menu) => user && menu.roles.includes(user.role)).map((menu) => {
          const Icon = menu.icon;
          const active = isActive(menu.href);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                active ? "bg-black text-white shadow-lg" : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{menu.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="mb-4">
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-slate-500">{user ? ROLE_CONFIG[user.role]?.label ?? user.role : ""}</p>
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
