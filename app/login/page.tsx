"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import API from "@/lib/axios";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";

import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();

  const { setAuth } = useAuthStore();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        username,
        password,
      });

      const user = res.data.data.user;

      const token = res.data.data.token;

      setAuth(user, token);

      switch (user.role) {
        case "ADMIN":
          router.push("/dashboard");
          break;

        case "SUPERVISOR":
          router.push("/dashboard");
          break;

        case "CUSTOMER_CARE":
          router.push("/dashboard/tickets");
          break;

        case "TECHNICAL":
          router.push("/dashboard/tickets");
          break;

        default:
          router.push("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="w-[400px] p-6 space-y-4 rounded-3xl shadow-2xl">
          <h1 className="text-3xl font-bold text-center">GPS Support Login</h1>

          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button className="w-full" onClick={handleLogin}>
            Login
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
