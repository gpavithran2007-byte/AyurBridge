"use client";

import React from "react";
import {
  GraduationCap,
  Building2,
  FlaskConical,
  CalendarDays,
  ArrowRight,
  BookOpen,
  Award,
  Search,
} from "lucide-react";

const fdps = [
  {
    title: "Advanced Herbal Extract Standardization",
    organization: "Dabur Research & Development",
    duration: "4 Weeks",
    mode: "On-site",
    funding: "Industry Sponsored",
    category: "Industrial Training",
  },
  {
    title: "Clinical Research & GCP Compliance",
    organization: "All India Institute of Ayurveda",
    duration: "2 Weeks",
    mode: "Hybrid",
    funding: "Institution Sponsored",
    category: "Faculty Development",
  },
  {
    title: "Phytochemistry & HPLC Applications",
    organization: "Charak Pharma R&D",
    duration: "6 Weeks",
    mode: "On-site",
    funding: "Industry Sponsored",
    category: "Research Sabbatical",
  },
];

const researchProjects = [
  {
    title: "In-Vitro Stability Testing of Polyherbal Extracts",
    company: "Dabur R&D Centre",
    grant: "₹15,00,000",
    duration: "6 Months",
  },
  {
    title: "Ayurvedic Formulation Standardization",
    company: "Charak Pharma Research",
    grant: "₹10,00,000",
    duration: "5 Months",
  },
];

export default function FacultyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-slate-950" />
            </div>

            <div>
              <h1 className="font-bold text-xl">
                Ayur<span className="text-emerald-400">Bridge</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                Faculty Portal • SIH 26044
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
            <span className="text-emerald-400 font-medium">Faculty / FDP</span>
            <span>Research</span>
            <span>Consultancy</span>
            <span>Profile</span>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

          <div>
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">
              Faculty Dashboard
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Industry Connect & Research Exchange
            </h2>

            <p className="text-slate-400 mt-2">
              Discover industrial training, sabbaticals and research
              collaboration opportunities.
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl">
            <Search className="h-4 w-4" />
            Browse Opportunities
          </button>

        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <BookOpen className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-slate-500">Active FDPs</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <Building2 className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-slate-500">Industry Partners</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <FlaskConical className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold">24</p>
            <p className="text-sm text-slate-500">Research RFPs</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <Award className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold">6</p>
            <p className="text-sm text-slate-500">Verified Endorsements</p>
          </div>

        </div>

        {/* FDP Section */}
        <section className="mb-10">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-bold">
                Faculty Development Programs & Sabbaticals
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Industry-led programs matched to your academic profile.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">

            {fdps.map((fdp) => (
              <div
                key={fdp.title}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition"
              >

                <span className="inline-block text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                  {fdp.category}
                </span>

                <h4 className="font-bold text-lg mt-4">
                  {fdp.title}
                </h4>

                <p className="text-sm text-slate-400 mt-2">
                  {fdp.organization}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-5">
                  <CalendarDays className="h-4 w-4" />
                  {fdp.duration} • {fdp.mode}
                </div>

                <p className="text-xs text-emerald-400 mt-3">
                  {fdp.funding}
                </p>

                <button className="w-full mt-5 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl py-3 text-sm font-semibold">
                  Apply for Faculty Nomination
                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>
            ))}

          </div>
        </section>

        {/* Research RFP */}
        <section>

          <div className="mb-5">
            <h3 className="text-xl font-bold">
              Industry Research RFPs
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Research challenges and consultancy opportunities from industry.
            </p>
          </div>

          <div className="space-y-4">

            {researchProjects.map((project) => (
              <div
                key={project.title}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >

                <div>
                  <h4 className="font-bold text-lg">
                    {project.title}
                  </h4>

                  <p className="text-sm text-slate-400 mt-1">
                    {project.company}
                  </p>

                  <p className="text-xs text-slate-500 mt-3">
                    Timeline: {project.duration}
                  </p>
                </div>

                <div className="flex items-center gap-5">

                  <div>
                    <p className="text-xs text-slate-500">
                      Grant Allocation
                    </p>
                    <p className="text-lg font-bold text-emerald-400">
                      {project.grant}
                    </p>
                  </div>

                  <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-3 rounded-xl">
                    Submit Proposal
                  </button>

                </div>

              </div>
            ))}

          </div>

        </section>

      </div>
    </main>
  );
}