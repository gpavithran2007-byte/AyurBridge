"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  BriefcaseBusiness,
  Trophy,
  Plus,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

type Opportunity = {
  id: string;
  title: string;
  company: string;
  location: string;
  opportunity_type: string;
  created_at?: string;
};

export default function IndustryPage() {
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadOpportunities();
  }, []);

  async function loadOpportunities() {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("opportunities")
      .select(
        "id, title, company, location, opportunity_type, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoadError("Could not load opportunities.");
      setLoading(false);
      return;
    }

    setOpportunities(data || []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-slate-950" />
            </div>

            <div>
              <h1 className="font-bold text-xl">
                Ayur<span className="text-emerald-400">Bridge</span>
              </h1>

              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                Industry Portal • SIH 26044
              </p>
            </div>

          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
            <span className="text-emerald-400">
              Recruiter Dashboard
            </span>
            <span>Roles</span>
            <span>Candidates</span>
            <span>Challenges</span>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

          <div>
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">
              Industry Partner
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Talent & Collaboration Console
            </h2>

            <p className="text-slate-400 mt-2">
              Discover verified talent using competency-based matching.
            </p>
          </div>

          <button
            onClick={() => router.push("/industry/post")}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Post New Role
          </button>

        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <BriefcaseBusiness className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold">
              {opportunities.length}
            </p>
            <p className="text-sm text-slate-500">
              Posted Roles
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <Users className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-slate-500">
              Applicants
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold">—</p>
            <p className="text-sm text-slate-500">
              Average Match
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <Trophy className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-slate-500">
              Challenges Hosted
            </p>
          </div>

        </div>

        {/* Posted Roles */}
        <section>

          <div className="mb-5">
            <h3 className="text-xl font-bold">
              Your Posted Opportunities
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Live opportunities stored in the AyurBridge database.
            </p>
          </div>

          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              Loading opportunities...
            </div>
          )}

          {loadError && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 text-red-300">
              {loadError}
            </div>
          )}

          {!loading && !loadError && opportunities.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

              <BriefcaseBusiness className="h-8 w-8 text-slate-600 mx-auto mb-3" />

              <p className="font-semibold">
                No opportunities posted yet
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Create your first job or internship to start matching
                with students.
              </p>

            </div>
          )}

          {!loading && !loadError && opportunities.length > 0 && (

            <div className="grid lg:grid-cols-3 gap-5">

              {opportunities.map((opportunity) => (

                <div
                  key={opportunity.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
                >

                  <div className="flex justify-between items-start">

                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      Active
                    </span>

                    <ArrowUpRight className="h-4 w-4 text-slate-500" />

                  </div>

                  <h4 className="font-bold text-lg mt-5">
                    {opportunity.title}
                  </h4>

                  <p className="text-sm text-slate-400 mt-1">
                    {opportunity.company}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    {opportunity.location}
                  </p>

                  <div className="flex gap-2 mt-4">

                    <span className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-300">
                      {opportunity.opportunity_type}
                    </span>

                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800">

                    <p className="text-xs text-slate-500">
                      Opportunity ID
                    </p>

                    <p className="text-[10px] text-slate-600 mt-1 truncate">
                      {opportunity.id}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/industry/post?id=${opportunity.id}`
                      )
                    }
                    className="w-full mt-4 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-sm font-semibold"
                  >
                    Manage Role
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}