"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  BriefcaseBusiness,
  Trophy,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  LogOut,
  X,
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

type Application = {
  id?: string;
  opportunity_id: string;
  student_id: string;
  match_score: number | null;
  status: string | null;
};

type Student = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  degree: string;
  specialization: string;
  year_of_study: number | null;
};

type Applicant = Application & {
  student: Student | null;
};

export default function IndustryPage() {
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);

  const [loggingOut, setLoggingOut] = useState(false);

useEffect(() => {
  loadIndustryData();

  const channel = supabase
    .channel("industry-applications-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "applications",
      },
      () => {
        console.log("Application changed — refreshing industry dashboard");
        loadIndustryData();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  async function loadIndustryData() {
    setLoading(true);
    setLoadError("");

    try {
      // ---------------------------------------------------------
      // 1. LOAD OPPORTUNITIES
      // ---------------------------------------------------------

      const {
        data: opportunityData,
        error: opportunityError,
      } = await supabase
        .from("opportunities")
        .select(
          "id, title, company, location, opportunity_type, created_at"
        )
        .order("created_at", { ascending: false });

      if (opportunityError) {
        throw opportunityError;
      }

      const loadedOpportunities = opportunityData || [];
      setOpportunities(loadedOpportunities);

      // ---------------------------------------------------------
      // 2. LOAD APPLICATIONS
      // ---------------------------------------------------------

      const opportunityIds = loadedOpportunities.map(
        (opportunity) => opportunity.id
      );

      if (opportunityIds.length === 0) {
        setApplications([]);
        setStudents([]);
        setLoading(false);
        return;
      }

      const {
        data: applicationData,
        error: applicationError,
      } = await supabase
        .from("applications")
        .select(
          "id, opportunity_id, student_id, match_score, status"
        )
        .in("opportunity_id", opportunityIds);

      if (applicationError) {
        throw applicationError;
      }

      const loadedApplications = applicationData || [];
      setApplications(loadedApplications);

      // ---------------------------------------------------------
      // 3. LOAD STUDENT DETAILS FOR APPLICANTS
      // ---------------------------------------------------------

      const studentIds = [
        ...new Set(
          loadedApplications.map(
            (application) => application.student_id
          )
        ),
      ];

      if (studentIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const {
        data: studentData,
        error: studentError,
      } = await supabase
        .from("students")
        .select(
          "id, name, email, phone, degree, specialization, year_of_study"
        )
        .in("id", studentIds);

      if (studentError) {
        throw studentError;
      }

      setStudents(studentData || []);
    } catch (error: any) {
      console.error("Industry dashboard error:", error);

      setLoadError(
        error?.message ||
          "Could not load industry dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // APPLICANTS WITH STUDENT DETAILS
  // ---------------------------------------------------------

  const applicants = useMemo<Applicant[]>(() => {
    return applications.map((application) => ({
      ...application,
      student:
        students.find(
          (student) => student.id === application.student_id
        ) || null,
    }));
  }, [applications, students]);

  // ---------------------------------------------------------
  // TOTAL APPLICANTS
  // ---------------------------------------------------------

  const totalApplicants = applications.length;

  // ---------------------------------------------------------
  // AVERAGE MATCH
  // ---------------------------------------------------------

  const averageMatch = useMemo(() => {
    const validScores = applications
      .map((application) => application.match_score)
      .filter(
        (score): score is number =>
          typeof score === "number"
      );

    if (validScores.length === 0) {
      return null;
    }

    return Math.round(
      validScores.reduce(
        (total, score) => total + score,
        0
      ) / validScores.length
    );
  }, [applications]);

  // ---------------------------------------------------------
  // APPLICANTS FOR A SPECIFIC ROLE
  // ---------------------------------------------------------

  function getApplicantsForOpportunity(
    opportunityId: string
  ) {
    return applicants
      .filter(
        (application) =>
          application.opportunity_id === opportunityId
      )
      .sort(
        (a, b) =>
          (b.match_score || 0) -
          (a.match_score || 0)
      );
  }

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  async function logout() {
    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-slate-950" />
            </div>

            <div>
              <h1 className="font-bold text-xl">
                Ayur
                <span className="text-emerald-400">
                  Bridge
                </span>
              </h1>

              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                Industry Portal • SIH 26044
              </p>
            </div>

          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm text-slate-400">

            <button
              onClick={() => router.push("/industry")}
              className="text-emerald-400"
            >
              Recruiter Dashboard
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("roles")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="hover:text-white"
            >
              Roles
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("applicants")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="hover:text-white"
            >
              Candidates
            </button>

            <button
              onClick={logout}
              disabled={loggingOut}
              className="flex items-center gap-2 hover:text-red-400 transition"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>

          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* =====================================================
            HEADING
        ====================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

          <div>
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">
              Industry Partner
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Talent & Collaboration Console
            </h2>

            <p className="text-slate-400 mt-2">
              Discover verified talent using
              competency-based matching.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={loadIndustryData}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-3 rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={() => router.push("/industry/post")}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Post New Role
            </button>

          </div>

        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {loadError && (
          <div className="mb-6 bg-red-500/5 border border-red-500/20 rounded-2xl p-5 text-red-300">
            <p className="font-semibold">
              Could not load industry data
            </p>

            <p className="text-sm mt-1">
              {loadError}
            </p>
          </div>
        )}

        {/* =====================================================
            STATS
        ====================================================== */}

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

            <p className="text-2xl font-bold">
              {totalApplicants}
            </p>

            <p className="text-sm text-slate-500">
              Applicants
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-3" />

            <p className="text-2xl font-bold">
              {averageMatch !== null
                ? `${averageMatch}%`
                : "—"}
            </p>

            <p className="text-sm text-slate-500">
              Average Match
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <Trophy className="h-5 w-5 text-emerald-400 mb-3" />

            <p className="text-2xl font-bold">
              0
            </p>

            <p className="text-sm text-slate-500">
              Challenges Hosted
            </p>
          </div>

        </div>

        {/* =====================================================
            APPLICANTS SUMMARY
        ====================================================== */}

        <section id="applicants" className="mb-10">

          <div className="mb-5">
            <h3 className="text-xl font-bold">
              Recent Applicants
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Students who have applied to your opportunities.
            </p>
          </div>

          {loading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              Loading applicants...
            </div>
          ) : applicants.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

              <Users className="h-8 w-8 text-slate-600 mx-auto mb-3" />

              <p className="font-semibold">
                No applications yet
              </p>

              <p className="text-sm text-slate-500 mt-1">
                When a qualified student applies,
                they will appear here.
              </p>

            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

              {applicants
                .slice()
                .sort(
                  (a, b) =>
                    (b.match_score || 0) -
                    (a.match_score || 0)
                )
                .slice(0, 6)
                .map((application) => {

                  const opportunity =
                    opportunities.find(
                      (item) =>
                        item.id ===
                        application.opportunity_id
                    );

                  return (
                    <div
                      key={`${application.opportunity_id}-${application.student_id}`}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-center gap-3">

                          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-emerald-400" />
                          </div>

                          <div>
                            <h4 className="font-bold">
                              {application.student?.name ||
                                "Unknown Student"}
                            </h4>

                            <p className="text-xs text-slate-500">
                              {application.student?.degree ||
                                "Student"}
                            </p>
                          </div>

                        </div>

                        <span className="text-lg font-bold text-emerald-400">
                          {application.match_score ?? 0}%
                        </span>

                      </div>

                      <div className="mt-4">

                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Applied For
                        </p>

                        <p className="font-semibold mt-1">
                          {opportunity?.title ||
                            "Opportunity"}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {opportunity?.company}
                        </p>

                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">

                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                          {application.status ||
                            "Applied"}
                        </span>

                        <button
                          onClick={() =>
                            setSelectedOpportunity(
                              opportunity || null
                            )
                          }
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                        >
                          View Role →
                        </button>

                      </div>

                    </div>
                  );
                })}

            </div>
          )}

        </section>

        {/* =====================================================
            POSTED ROLES
        ====================================================== */}

        <section id="roles">

          <div className="mb-5">
            <h3 className="text-xl font-bold">
              Your Posted Opportunities
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Live opportunities and their applicants.
            </p>
          </div>

          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              Loading opportunities...
            </div>
          )}

          {!loading &&
            !loadError &&
            opportunities.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

                <BriefcaseBusiness className="h-8 w-8 text-slate-600 mx-auto mb-3" />

                <p className="font-semibold">
                  No opportunities posted yet
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Create your first job or internship
                  to start matching with students.
                </p>

              </div>
            )}

          {!loading &&
            opportunities.length > 0 && (

              <div className="grid lg:grid-cols-3 gap-5">

                {opportunities.map((opportunity) => {

                  const roleApplicants =
                    getApplicantsForOpportunity(
                      opportunity.id
                    );

                  return (
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

                      {/* APPLICANT COUNT */}

                      <div className="mt-5 bg-slate-950 border border-slate-800 rounded-xl p-4">

                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-emerald-400" />

                            <span className="text-sm font-semibold">
                              Applicants
                            </span>
                          </div>

                          <span className="text-lg font-bold text-emerald-400">
                            {roleApplicants.length}
                          </span>

                        </div>

                        {roleApplicants.length > 0 && (

                          <div className="mt-3 space-y-2">

                            {roleApplicants
                              .slice(0, 3)
                              .map((application) => (

                                <div
                                  key={`${application.student_id}-${application.opportunity_id}`}
                                  className="flex items-center justify-between text-xs"
                                >

                                  <span className="text-slate-300 truncate pr-2">
                                    {application.student?.name ||
                                      "Unknown Student"}
                                  </span>

                                  <span className="text-emerald-400 font-semibold">
                                    {application.match_score ?? 0}%
                                  </span>

                                </div>

                              ))}

                            {roleApplicants.length > 3 && (
                              <p className="text-[11px] text-slate-500 pt-1">
                                +{" "}
                                {roleApplicants.length - 3}{" "}
                                more applicants
                              </p>
                            )}

                          </div>

                        )}

                        {roleApplicants.length === 0 && (
                          <p className="text-xs text-slate-500 mt-2">
                            No students have applied yet.
                          </p>
                        )}

                      </div>

                      {/* ROLE ACTIONS */}

                      <button
                        onClick={() =>
                          setSelectedOpportunity(
                            opportunity
                          )
                        }
                        className="w-full mt-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 py-2.5 rounded-xl text-sm font-semibold"
                      >
                        View Applicants
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/industry/post?id=${opportunity.id}`
                          )
                        }
                        className="w-full mt-2 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-sm font-semibold"
                      >
                        Manage Role
                      </button>

                    </div>
                  );
                })}

              </div>
            )}

        </section>

      </div>

      {/* =====================================================
          APPLICANTS MODAL
      ====================================================== */}

      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl">

            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-5 flex items-start justify-between">

              <div>
                <p className="text-xs text-emerald-400 uppercase tracking-widest font-semibold">
                  Applicants
                </p>

                <h3 className="text-2xl font-bold mt-1">
                  {selectedOpportunity.title}
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  {selectedOpportunity.company}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedOpportunity(null)
                }
                className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="p-5">

              {getApplicantsForOpportunity(
                selectedOpportunity.id
              ).length === 0 ? (

                <div className="text-center py-10">

                  <Users className="h-9 w-9 text-slate-600 mx-auto" />

                  <p className="font-semibold mt-3">
                    No applications yet
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Qualified students will appear here
                    when they apply.
                  </p>

                </div>

              ) : (

                <div className="space-y-3">

                  {getApplicantsForOpportunity(
                    selectedOpportunity.id
                  ).map((application) => (

                    <div
                      key={`${application.student_id}-${application.opportunity_id}`}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4"
                    >

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        <div className="flex items-center gap-3">

                          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-emerald-400" />
                          </div>

                          <div>
                            <h4 className="font-bold">
                              {application.student?.name ||
                                "Unknown Student"}
                            </h4>

                            <p className="text-sm text-slate-400">
                              {application.student?.degree}
                              {application.student?.specialization
                                ? ` • ${application.student.specialization}`
                                : ""}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {application.student?.email}
                            </p>
                          </div>

                        </div>

                        <div className="sm:text-right">

                          <p className="text-2xl font-bold text-emerald-400">
                            {application.match_score ?? 0}%
                          </p>

                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                            Skill Match
                          </p>

                          <span className="inline-block mt-2 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                            {application.status ||
                              "Applied"}
                          </span>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>
      )}

    </main>
  );
}