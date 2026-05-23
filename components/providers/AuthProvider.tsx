"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import API from "@/lib/axios";

import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const pathname = usePathname();

  const { user, setAuth, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const publicRoutes = ["/login"];

    const isPublic = publicRoutes.includes(pathname);

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          if (!isPublic) {
            router.replace("/login");
          }

          setLoading(false);

          return;
        }

        // already authenticated
        if (user) {
          setLoading(false);

          return;
        }

        const res = await API.get("/users/me");

        setAuth(res.data.data, token);

        if (pathname === "/login") {
          router.replace("/dashboard");
        }
      } catch (error) {
        logout();

        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // protect private routes
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token && pathname !== "/login") {
      router.replace("/login");
    }
  }, [pathname]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && pathname !== "/login") {
    return null;
  }

  return children;
}
