"use client";

import React from "react";
import {
  ShieldCheck,
  Users,
  TrendingUp,
  AlertTriangle,
  Building2,
  GraduationCap,
  Download,
} from "lucide-react";

const skills = [
  {
    name: "Ayush Regulatory Compliance",
    average: 42,
    target: 80,
    status: "Critical Gap",
  },
  {
    name: "Clinical Data Analytics",
    average: 51,
    target: 75,
    status: "Moderate Gap",
  },
  {
    name: "Basic Herbal Pharmacognosy",
    average: 88,
    target: 80,
    status: "Exceeds Target",
  },
  {
    name: "Phytochemical Extraction (HPLC)",
    average: 63,
    target: 70,
    status: "Minor Gap",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-20">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-slate-950" />
            </div>

            <div>
              <h1 className="font-bold text-xl">
                Ayur<span className="text-emerald-400">Bridge</span>
              </h1>

              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                Institutional Admin • SIH 26044
              </p>
            </div>

          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
            <span className="text-emerald-400">TPO Analytics</span>
            <span>Students</span>
            <span>Recruiters</span>
            <span>Reports</span>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

          <div>

            <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">
              Institutional Analytics
            </p>

            <h2 className="text-3xl font-bold mt-2">
              TPO & Placement Dashboard
            </h2>

            <p className="text-slate-400 mt-2">
              Monitor cohort readiness, skill deficits and industry engagement.
            </p>

          </div>

          <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-xl text-sm font-semibold">
            <Download className="h-4 w-4" />
            Export Report
          </button>

        </div>

        {/* Main Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

            <Users className="h-5 w-5 text-emerald-400 mb-3" />

            <p className="text-3xl font-bold">
              1,248
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Total Enrolled Students
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

            <TrendingUp className="h-5 w-5 text-emerald-400 mb-3" />

            <p className="text-3xl font-bold">
              68%
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Average Batch Readiness
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

            <AlertTriangle className="h-5 w-5 text-amber-400 mb-3" />

            <p className="text-xl font-bold">
              GCP Compliance
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Top Skill Deficit
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

            <Building2 className="h-5 w-5 text-emerald-400 mb-3" />

            <p className="text-3xl font-bold">
              32
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Active Industry Partners
            </p>

          </div>

        </div>

        {/* Alert */}
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-4">

          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>

          <div>

            <h3 className="font-bold text-amber-300">
              Curriculum Attention Required
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              A significant portion of the current cohort is below the
              target benchmark for GCP and clinical data competencies.
              Consider integrating certified training modules.
            </p>

          </div>

        </div>

        {/* Heatmap */}
        <section className="mb-10">

          <div className="mb-5">

            <h3 className="text-xl font-bold">
              Cohort Skill Gap Analysis
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Batch Skill Deficiency Analysis • Cohort 2026
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">

              <span>Skill Domain</span>
              <span>Average</span>
              <span>Target</span>
              <span>Status</span>

            </div>

            {skills.map((skill) => {

              const gap = skill.target - skill.average;

              return (
                <div
                  key={skill.name}
                  className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-5 border-b border-slate-800 last:border-0"
                >

                  <div>

                    <p className="font-semibold">
                      {skill.name}
                    </p>

                    <div className="w-full max-w-md h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">

                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${skill.average}%`,
                        }}
                      />

                    </div>

                  </div>

                  <div className="flex items-center font-bold">
                    {skill.average}%
                  </div>

                  <div className="flex items-center text-slate-400">
                    {skill.target}%
                  </div>

                  <div className="flex items-center">

                    <span
                      className={`text-xs px-3 py-1.5 rounded-lg ${
                        gap <= 0
                          ? "bg-emerald-500/10 text-emerald-400"
                          : gap >= 25
                            ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {skill.status}
                    </span>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* Departments */}
        <section>

          <div className="mb-5">

            <h3 className="text-xl font-bold">
              Department Overview
            </h3>

          </div>

          <div className="grid md:grid-cols-3 gap-5">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

              <GraduationCap className="h-5 w-5 text-emerald-400" />

              <h4 className="font-bold text-lg mt-4">
                BAMS
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                684 students
              </p>

              <div className="mt-5">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500">
                    Readiness
                  </span>
                  <span className="font-bold">
                    72%
                  </span>
                </div>

                <div className="h-2 bg-slate-800 rounded-full">
                  <div className="h-full w-[72%] bg-emerald-500 rounded-full" />
                </div>
              </div>

            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

              <GraduationCap className="h-5 w-5 text-emerald-400" />

              <h4 className="font-bold text-lg mt-4">
                M.Pharm
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                312 students
              </p>

              <div className="mt-5">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500">
                    Readiness
                  </span>
                  <span className="font-bold">
                    81%
                  </span>
                </div>

                <div className="h-2 bg-slate-800 rounded-full">
                  <div className="h-full w-[81%] bg-emerald-500 rounded-full" />
                </div>
              </div>

            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

              <GraduationCap className="h-5 w-5 text-emerald-400" />

              <h4 className="font-bold text-lg mt-4">
                Research Programs
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                252 researchers
              </p>

              <div className="mt-5">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500">
                    Readiness
                  </span>
                  <span className="font-bold">
                    76%
                  </span>
                </div>

                <div className="h-2 bg-slate-800 rounded-full">
                  <div className="h-full w-[76%] bg-emerald-500 rounded-full" />
                </div>
              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}