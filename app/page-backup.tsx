"use client";

import React, { useEffect, useState } from "react";
import { 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Search 
} from "lucide-react";
import { supabase } from "../lib/supabase";
export default function Home() {
  const [role, setRole] = useState<"student" | "faculty" | "industry" | "admin">("student");
  const [opportunities, setOpportunities] = useState<any[]>([]);
  useEffect(() => {
  async function fetchOpportunities() {
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching opportunities:", error);
      return;
    }

    setOpportunities(data || []);
  }

  fetchOpportunities();
}, []);
  // Sample quick mock data
  const sampleInternships = [
    {
      id: 1,
      title: "Ayurvedic Pharmacovigilance Intern",
      company: "Dabur Research & Development",
      location: "New Delhi / Hybrid",
      match: 88,
      tags: ["Pharmacovigilance", "Good Clinical Practice (GCP)", "Herbal Formulations"]
    },
    {
      id: 2,
      title: "Clinical Data Analyst Trainee",
      company: "AIIA Collaborative Labs",
      location: "New Delhi",
      match: 74,
      tags: ["Bio-Statistics", "Data Analytics", "Clinical Trials"]
    }
  ];

  const sampleFDPs = [
    {
      id: 1,
      title: "Advanced Phytochemical Extraction & Standardization",
      organization: "Himalaya Wellness R&D Hub",
      duration: "4 Weeks (Industrial Sabbatical)",
      stipend: "Grant Supported"
    },
    {
      id: 2,
      title: "Integration of Modern Bio-Sensors with Traditional Diagnostics",
      organization: "IIT Delhi & Ministry of Ayush Joint Cell",
      duration: "2 Weeks Workshop",
      stipend: "Funded Faculty Track"
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              <GraduationCap className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">AyurBridge</span>
              <span className="block text-xs text-slate-400">SIH 26044 • Ministry of Ayush</span>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setRole("student")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                role === "student" ? "bg-emerald-500 text-black font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Student Portal
            </button>
            <button
              onClick={() => setRole("faculty")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                role === "faculty" ? "bg-emerald-500 text-black font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Faculty / FDP
            </button>
            <button
              onClick={() => setRole("industry")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                role === "industry" ? "bg-emerald-500 text-black font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Industry Recruiter
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                role === "admin" ? "bg-emerald-500 text-black font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              TPO Analytics
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic View Body */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 1. STUDENT VIEW */}
        {role === "student" && (
          <div className="space-y-8">
            {/* AI Skill Assessment Banner */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">AI Skill Gap Assessment</h2>
                  <p className="text-sm text-slate-400">
                    Compare your verified academic profile against current Ayush industry benchmarks.
                  </p>
                </div>
                <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-sm font-semibold transition">
                  Take 3-Min Assessment
                </button>
              </div>

              {/* Skill Gap Results Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400 font-medium">Industry Readiness</span>
                    <span className="text-emerald-400 font-bold text-sm">76%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[76%] rounded-full"></div>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-1 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Verified Strengths
                  </div>
                  <p className="text-xs text-slate-300">Herbology, Basic Formulations, Clinical Documentation</p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-1 text-amber-400 text-xs font-semibold">
                    <AlertCircle className="h-4 w-4" /> Priority Skill Gaps
                  </div>
                  <p className="text-xs text-slate-300">GCP Certification, Phytochemical HPLC, Bio-Stats</p>
                </div>
              </div>
            </div>

            {/* Matched Opportunities */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-400" /> Matched Internships & Openings
                </h3>
                <span className="text-xs text-slate-400">Sorted by AI Compatibility Match</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleInternships.map((job) => (
                  <div key={job.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{job.title}</h4>
                        <p className="text-xs text-slate-400">{job.company} • {job.location}</p>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-bold">
                        {job.match}% Match
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 my-3">
                      {job.tags.map((tag, i) => (
                        <span key={i} className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-2 rounded-xl transition">
                      One-Click Fast Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. FACULTY VIEW */}
        {role === "faculty" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-2">Faculty Development Programs (FDP) & Industrial Sabbaticals</h2>
              <p className="text-sm text-slate-400">
                Align academic curriculum with active industry techniques through hands-on corporate immersion programs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleFDPs.map((fdp) => (
                <div key={fdp.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {fdp.stipend}
                  </span>
                  <h4 className="font-semibold text-white mt-3">{fdp.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{fdp.organization}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{fdp.duration}</p>
                  <button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold py-2 rounded-xl transition">
                    Apply for Faculty Nomination
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. INDUSTRY VIEW */}
        {role === "industry" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Recruiter Dashboard</h2>
                <p className="text-sm text-slate-400">Post roles and view auto-ranked candidates filtered by verified skill compatibility.</p>
              </div>
              <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-bold">
                + Post New Role
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-semibold text-sm text-white mb-3">Top AI-Ranked Candidates for "Ayurvedic Pharmacovigilance"</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-sm font-semibold text-white">Aditi Sharma</span>
                    <p className="text-xs text-slate-400">BAMS Final Year • Verified GCP Badge</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold text-sm">94% Match</span>
                    <button className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200">
                      View Profile
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-sm font-semibold text-white">Rahul Verma</span>
                    <p className="text-xs text-slate-400">M.Pharm (Ayurveda) • Bio-Stats Certified</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold text-sm">89% Match</span>
                    <button className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TPO / ADMIN VIEW */}
        {role === "admin" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-1">Institutional Placement & Skill Trends</h2>
              <p className="text-sm text-slate-400">Aggregated batch readiness analytics for AIIA / Ministry monitoring.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">Total Enrolled Batch</span>
                <p className="text-2xl font-bold text-white mt-1">420 Students</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">Average Skill Readiness</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">72.4%</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">Top Missing Competency</span>
                <p className="text-2xl font-bold text-amber-400 mt-1">GCP Compliance (58%)</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}