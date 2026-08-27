 "use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Building2,
  FlaskConical,
  CalendarDays,
  ArrowRight,
  BookOpen,
  Award,
  Search,
  Users,
  User,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

type Student = {
  id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone: string | null;
  degree: string;
  specialization: string;
  year_of_study: number | null;
  bio?: string | null;
  profile_image?: string | null;
  readiness_score?: number | null;
};

type Skill = {
  id: string;
  name: string;
  category: string;
};

type StudentSkill = {
  id: string;
  student_id: string;
  skill_id: string;
  proficiency: number;
  verification_status: string;
  skill_level?: string | null;
};

type Assessment = {
  id: string;
  student_id: string;
  skill_id: string | null;
  assessment_level?: string | null;
  overall_score?: number | null;
  passed?: boolean | null;
  created_at?: string | null;
};

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

function getSkillLevel(score: number) {
  if (score >= 85) return "Expert";
  if (score >= 70) return "Advanced";
  if (score >= 50) return "Intermediate";
  return "Beginner";
}

function displayLevel(level?: string | null) {
  const value = (level || "beginner").toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function levelStyle(level?: string | null) {
  const value = (level || "beginner").toLowerCase();

  if (value === "expert") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  if (value === "advanced") {
    return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
  }

  if (value === "intermediate") {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  return "bg-red-500/10 text-red-400 border-red-500/20";
}

export default function FacultyPage() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentError, setStudentError] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [search, setSearch] = useState("");

  async function loadStudents() {
    setLoadingStudents(true);
    setStudentError("");

    try {
      const [
        studentsResult,
        skillsResult,
        studentSkillsResult,
        assessmentsResult,
      ] = await Promise.all([
        supabase
          .from("students")
          .select(
            "id,user_id,name,email,phone,degree,specialization,year_of_study,bio,profile_image,readiness_score"
          )
          .order("name"),
        supabase
          .from("skills")
          .select("id,name,category")
          .order("name"),
        supabase
          .from("student_skills")
          .select(
            "id,student_id,skill_id,proficiency,verification_status,skill_level"
          ),
        supabase
          .from("assessments")
          .select(
            "id,student_id,skill_id,assessment_level,overall_score,passed,created_at"
          )
          .order("created_at", { ascending: false }),
      ]);

      if (studentsResult.error) throw studentsResult.error;
      if (skillsResult.error) throw skillsResult.error;
      if (studentSkillsResult.error) throw studentSkillsResult.error;

      // Assessment history is useful when the table exists. If an older
      // prototype database does not have it yet, keep the student tracker
      // usable and show the profile/skill data.
      if (assessmentsResult.error) {
        console.warn(
          "Assessment history could not be loaded:",
          assessmentsResult.error.message
        );
        setAssessments([]);
      } else {
        setAssessments(assessmentsResult.data || []);
      }

      setStudents(studentsResult.data || []);
      setSkills(skillsResult.data || []);
      setStudentSkills(studentSkillsResult.data || []);
    } catch (err: any) {
      console.error(err);
      setStudentError(
        err?.message ||
          "Could not load student tracking data from Supabase."
      );
    } finally {
      setLoadingStudents(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) =>
      [
        student.name,
        student.email,
        student.degree,
        student.specialization,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [students, search]);

  const readinessByStudent = useMemo(() => {
    const result: Record<string, number> = {};

    students.forEach((student) => {
      const currentSkills = studentSkills.filter(
        (skill) => skill.student_id === student.id
      );

      if (currentSkills.length === 0) {
        result[student.id] = student.readiness_score || 0;
        return;
      }

      result[student.id] = Math.round(
        currentSkills.reduce(
          (total, skill) => total + (skill.proficiency || 0),
          0
        ) / currentSkills.length
      );
    });

    return result;
  }, [students, studentSkills]);

  const selectedStudent = students.find(
    (student) => student.id === selectedStudentId
  );

  const selectedStudentSkills = selectedStudent
    ? studentSkills
        .filter((item) => item.student_id === selectedStudent.id)
        .map((item) => {
          const skill = skills.find(
            (candidate) => candidate.id === item.skill_id
          );

          return {
            ...item,
            skillName: skill?.name || "Unknown Skill",
            category: skill?.category || "Skill",
          };
        })
        .sort((a, b) => b.proficiency - a.proficiency)
    : [];

  const selectedStudentAssessments = selectedStudent
    ? assessments
        .filter((item) => item.student_id === selectedStudent.id)
        .map((item) => {
          const skill = skills.find(
            (candidate) => candidate.id === item.skill_id
          );

          return {
            ...item,
            skillName: skill?.name || "Unknown Skill",
          };
        })
    : [];

  const averageReadiness =
    students.length > 0
      ? Math.round(
          students.reduce(
            (total, student) =>
              total + (readinessByStudent[student.id] || 0),
            0
          ) / students.length
        )
      : 0;

  const studentsNeedingAttention = students.filter(
    (student) => (readinessByStudent[student.id] || 0) < 70
  ).length;

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
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("students")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-emerald-400 font-medium hover:text-emerald-300"
            >
              Students
            </button>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("fdps")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:text-white"
            >
              Faculty / FDP
            </button>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("research")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:text-white"
            >
              Research
            </button>

            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="hover:text-white transition"
            >
              Logout
            </button>
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
              Student Progress & Industry Connect
            </h2>

            <p className="text-slate-400 mt-2">
              Track student skills, assessment progress and industry readiness.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              document
                .getElementById("fdps")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl"
          >
            <Search className="h-4 w-4" />
            Browse Opportunities
          </button>
        </div>

        {/* Faculty stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <Users className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold">
              {loadingStudents ? "—" : students.length}
            </p>
            <p className="text-sm text-slate-500">Students Tracked</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <BarChart3 className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold">
              {loadingStudents ? "—" : `${averageReadiness}%`}
            </p>
            <p className="text-sm text-slate-500">Average Readiness</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <AlertTriangle className="h-5 w-5 text-amber-400 mb-3" />
            <p className="text-2xl font-bold">
              {loadingStudents ? "—" : studentsNeedingAttention}
            </p>
            <p className="text-sm text-slate-500">Need Attention</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <Award className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-2xl font-bold">{assessments.length}</p>
            <p className="text-sm text-slate-500">Assessment Attempts</p>
          </div>
        </div>

        {/* Student tracking */}
        <section id="students" className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
            <div>
              <h3 className="text-2xl font-bold">Student Tracking</h3>
              <p className="text-sm text-slate-500 mt-1">
                View every student's profile, verified skills and assessment
                history.
              </p>
            </div>

            <button
              type="button"
              onClick={loadStudents}
              disabled={loadingStudents}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl text-sm"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loadingStudents ? "animate-spin" : ""
                }`}
              />
              Refresh Students
            </button>
          </div>

          {studentError && (
            <div className="mb-5 bg-red-950/30 border border-red-500/30 text-red-300 rounded-xl p-4">
              {studentError}
            </div>
          )}

          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students by name, degree or specialization..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {loadingStudents ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              Loading students from Supabase...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <Users className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="font-semibold mt-3">No students found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => {
                const readiness = readinessByStudent[student.id] || 0;
                const studentSkillCount = studentSkills.filter(
                  (item) => item.student_id === student.id
                ).length;

                return (
                  <button
                    type="button"
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className="text-left bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-emerald-400" />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold truncate">{student.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {student.degree}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {student.specialization || "No specialization"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">
                          Readiness
                        </p>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">
                          {readiness}%
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">
                          Skills
                        </p>
                        <p className="text-lg font-bold mt-1">
                          {studentSkillCount}
                        </p>
                      </div>
                    </div>

                    <div className="h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(0, readiness))}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-4 text-xs">
                      <span className="text-slate-500">
                        Year {student.year_of_study ?? "—"}
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        View Student →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Selected student detail */}
        {selectedStudent && (
          <section className="mb-12">
            <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <User className="h-7 w-7 text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">
                      Student Details
                    </p>
                    <h3 className="text-2xl font-bold mt-1">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {selectedStudent.degree}
                      {selectedStudent.specialization
                        ? ` • ${selectedStudent.specialization}`
                        : ""}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudentId(null)}
                  className="h-10 w-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
                  aria-label="Close student details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-4 gap-3 mt-6">
                <div className="bg-slate-950 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm mt-1 break-all">
                    {selectedStudent.email}
                  </p>
                </div>

                <div className="bg-slate-950 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm mt-1">
                    {selectedStudent.phone || "Not added"}
                  </p>
                </div>

                <div className="bg-slate-950 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Year of Study</p>
                  <p className="text-sm mt-1">
                    Year {selectedStudent.year_of_study ?? "—"}
                  </p>
                </div>

                <div className="bg-slate-950 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Readiness</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">
                    {readinessByStudent[selectedStudent.id] || 0}%
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold">Skill Progress</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Current scores and verified skill levels.
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {selectedStudentSkills.length} skills
                  </span>
                </div>

                {selectedStudentSkills.length === 0 ? (
                  <div className="bg-slate-950 rounded-xl p-5 mt-4 text-sm text-slate-500">
                    No skills have been added for this student yet.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3 mt-4">
                    {selectedStudentSkills.map((skill) => {
                      const actualLevel =
                        skill.skill_level ||
                        getSkillLevel(skill.proficiency);

                      return (
                        <div
                          key={skill.id}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h5 className="font-semibold">
                                {skill.skillName}
                              </h5>
                              <p className="text-xs text-slate-500 mt-1">
                                {skill.category}
                              </p>
                            </div>

                            <span className="text-lg font-bold text-emerald-400">
                              {skill.proficiency}%
                            </span>
                          </div>

                          <div className="h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, skill.proficiency)
                                )}%`,
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <span
                              className={`text-[11px] px-2 py-1 rounded-md border ${levelStyle(
                                actualLevel
                              )}`}
                            >
                              {displayLevel(actualLevel)}
                            </span>

                            <span className="flex items-center gap-1 text-[11px] text-slate-500">
                              {skill.verification_status === "verified" ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              ) : null}
                              {skill.verification_status ||
                                "Not verified"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Assessment history */}
              <div className="mt-7">
                <div>
                  <h4 className="text-lg font-bold">
                    Assessment History
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Attempts recorded for this student.
                  </p>
                </div>

                {selectedStudentAssessments.length === 0 ? (
                  <div className="bg-slate-950 rounded-xl p-5 mt-4 text-sm text-slate-500">
                    No assessment attempts recorded yet.
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {selectedStudentAssessments.map((assessment) => (
                      <div
                        key={assessment.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-semibold">
                            {assessment.skillName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {displayLevel(assessment.assessment_level)}{" "}
                            assessment
                            {assessment.created_at
                              ? ` • ${new Date(
                                  assessment.created_at
                                ).toLocaleDateString()}`
                              : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold">
                            {assessment.overall_score ?? 0}%
                          </span>

                          {assessment.passed ? (
                            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Passed
                            </span>
                          ) : (
                            <span className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                              Not Passed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* FDP Section */}
        <section id="fdps" className="mb-10">
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

                <button
                  type="button"
                  className="w-full mt-5 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl py-3 text-sm font-semibold"
                >
                  Apply for Faculty Nomination
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Research RFP */}
        <section id="research">
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

                  <button
                    type="button"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-3 rounded-xl"
                  >
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
