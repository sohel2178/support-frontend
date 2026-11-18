"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import API from "@/lib/axios";
import { canOpenRoute, homeFor } from "@/lib/constants";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, User } from "@/types";

const PUBLIC_ROUTES = ["/login"];

function FullScreenSpinner() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  const [checked, setChecked] = useState(false);

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const allowed = !user || isPublic || canOpenRoute(pathname, user.role);

  // Restore the session once on first load.
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");

    const restore = token
      ? API.get<ApiResponse<User>>("/users/me").then((res) => res.data.data)
      : Promise.resolve(null);

    restore
      .then((me) => {
        if (!active) return;
        if (me && token) setAuth(me, token);
        setChecked(true);
      })
      .catch(() => {
        if (!active) return;
        logout();
        setChecked(true);
      });

    return () => {
      active = false;
    };
  }, [setAuth, logout]);

  // Route guard.
  useEffect(() => {
    if (!checked) return;

    if (!user) {
      if (!isPublic) router.replace("/login");
      return;
    }

    if (isPublic || pathname === "/" || !allowed) {
      router.replace(homeFor(user.role));
    }
  }, [checked, user, isPublic, allowed, pathname, router]);

  if (!checked) return <FullScreenSpinner />;

  if (isPublic) return user ? <FullScreenSpinner /> : children;

  if (!user || !allowed) return <FullScreenSpinner />;

  return children;
}
