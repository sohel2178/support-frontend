"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import API from "@/lib/axios";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login");

          return;
        }

        const res = await API.get("/users/me");

        const user = res.data.data;

        // admin + supervisor
        if (["ADMIN", "SUPERVISOR"].includes(user.role)) {
          router.replace("/dashboard");
        }

        // technical + customer care
        else {
          router.replace("/dashboard/tickets");
        }
      } catch (error) {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />

        <p className="mt-4 text-slate-500">Redirecting...</p>
      </div>
    </div>
  );
}
