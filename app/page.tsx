"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Users,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type Role = "student" | "faculty" | "industry" | "admin";

const roles = [
  {
    id: "student" as Role,
    title: "Student",
    subtitle: "Build skills & discover opportunities",
    icon: GraduationCap,
  },
  {
    id: "faculty" as Role,
    title: "Faculty",
    subtitle: "Connect with industry & research",
    icon: Users,
  },
  {
    id: "industry" as Role,
    title: "Industry Partner",
    subtitle: "Find verified talent & collaborate",
    icon: Building2,
  },
  {
    id: "admin" as Role,
    title: "Institutional Admin",
    subtitle: "Monitor skills & placement outcomes",
    icon: ShieldCheck,
  },
];

const roleRoutes: Record<Role, string> = {
  student: "/student",
  faculty: "/faculty",
  industry: "/industry",
  admin: "/admin",
};

export default function Home() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const selectedRoleData = roles.find(
    (role) => role.id === selectedRole
  )!;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoggingIn(true);

    try {
      // Login through Supabase Authentication
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError || !data.user) {
        setError("Invalid email or password.");
        setIsLoggingIn(false);
        return;
      }

      /*
       * For the demo, the user's role can come from:
       * 1. Supabase user metadata, OR
       * 2. The email prefix.
       *
       * Example:
       * student@ayurbridge.demo
       * faculty@ayurbridge.demo
       * industry@ayurbridge.demo
       * admin@ayurbridge.demo
       */

      const metadataRole = data.user.user_metadata?.role as
        | Role
        | undefined;

      let actualRole: Role | null = metadataRole ?? null;

      if (!actualRole) {
        const emailPrefix = data.user.email
          ?.split("@")[0]
          .toLowerCase();

        if (emailPrefix === "student") actualRole = "student";
        else if (emailPrefix === "faculty") actualRole = "faculty";
        else if (emailPrefix === "industry") actualRole = "industry";
        else if (emailPrefix === "admin") actualRole = "admin";
      }

      // Make sure selected portal matches the user's actual role
      if (actualRole !== selectedRole) {
        await supabase.auth.signOut();

        setError(
          `This account does not have ${selectedRoleData.title} access. Please select the correct portal.`
        );

        setIsLoggingIn(false);
        return;
      }

      // Correct login + correct role
      router.push(roleRoutes[actualRole]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setIsLoggingIn(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>

            <div>
              <h1 className="font-bold text-xl tracking-tight">
                Ayur<span className="text-emerald-400">Bridge</span>
              </h1>

              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                SIH 26044 • Ministry of Ayush
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Academia • Industry • Innovation
          </div>

        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 min-h-[calc(100vh-81px)] flex items-center justify-center px-5 py-12">

        <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">

          {/* Left side */}
          <div className="hidden lg:block">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Academia–Industry Platform
            </div>

            <h2 className="text-5xl xl:text-6xl font-bold tracking-tight leading-[1.05]">
              Bridge the gap between

              <span className="block text-emerald-400 mt-2">
                skills & opportunity.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-slate-400 leading-relaxed text-base">
              AyurBridge connects students, academicians, industry partners
              and institutions through intelligent skill mapping, career
              pathways and industry collaboration.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-10 max-w-xl">

              <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">4</p>
                <p className="text-xs text-slate-500 mt-1">
                  User Portals
                </p>
              </div>

              <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">AI</p>
                <p className="text-xs text-slate-500 mt-1">
                  Skill Intelligence
                </p>
              </div>

              <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">360°</p>
                <p className="text-xs text-slate-500 mt-1">
                  Ecosystem
                </p>
              </div>

            </div>
          </div>

          {/* Login card */}
          <div className="w-full max-w-xl mx-auto">

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">

              <div className="mb-7">

                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">
                  Unified Portal
                </p>

                <h2 className="text-2xl font-bold text-white">
                  Welcome to AyurBridge
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Select your portal to continue.
                </p>

              </div>

              {/* Role selection */}
              <div className="grid grid-cols-2 gap-3">

                {roles.map((role) => {

                  const Icon = role.icon;
                  const active = selectedRole === role.id;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.id);
                        setError("");
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                        active
                          ? "border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/5"
                          : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/60"
                      }`}
                    >

                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${
                          active
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <p
                        className={`text-sm font-semibold ${
                          active ? "text-white" : "text-slate-200"
                        }`}
                      >
                        {role.title}
                      </p>

                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {role.subtitle}
                      </p>

                    </button>
                  );
                })}

              </div>

              {/* Selected role */}
              <div className="flex items-center gap-2 mt-6 mb-4 text-xs text-slate-400">

                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                Signing in as{" "}

                <span className="font-semibold text-emerald-400">
                  {selectedRoleData.title}
                </span>

              </div>

              {/* Login form */}
              <form onSubmit={handleLogin} className="space-y-4">

                <div>

                  <label className="text-xs font-medium text-slate-300">
                    Institutional Email / ID
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@institution.edu"
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                  />

                </div>

                <div>

                  <div className="flex items-center justify-between">

                    <label className="text-xs font-medium text-slate-300">
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="relative mt-2">

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                  </div>

                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                    {error}
                  </div>
                )}

                {/* Login button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm py-3.5 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
                >

                  <LockKeyhole className="h-4 w-4" />

                  {isLoggingIn
                    ? "Authenticating..."
                    : `Enter ${selectedRoleData.title} Portal`}

                  {!isLoggingIn && (
                    <ArrowRight className="h-4 w-4" />
                  )}

                </button>

              </form>

              <p className="text-center text-[11px] text-slate-600 mt-6">
                Secure institutional access • AyurBridge SIH 26044
              </p>

            </div>
          </div>

        </div>
      </section>
    </main>
  );
}