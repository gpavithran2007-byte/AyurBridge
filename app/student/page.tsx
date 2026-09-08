"use client";
import { useRouter } from "next/navigation";
import AssessmentModal from "./assessments/AssessmentModal";
import React, { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  BriefcaseBusiness,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  User,
  Mail,
  Phone,
  Building2,
  RefreshCw,
  LogOut,
  Target,
  Award,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type Skill = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
};

type StudentSkill = {
  id: string;
  student_id: string;
  skill_id: string;
  proficiency: number;
  verification_status: string;
  skill_level?: string | null;
  evidence?: string | null;
};

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

type OpportunitySkillRow = {
  id: string;
  opportunity_id: string;
  skill_id: string;
  required_proficiency: number;
  importance: number;
  minimum_level?: string | null;
  required_level?: string | null;
  accept_higher_levels?: boolean | null;
};

type Opportunity = {
  id: string;
  title: string;
  company: string;
  location: string;
  opportunity_type: string;
  description?: string | null;
  requirements: {
    skillId: string;
    skillName: string;
    required: number;
    importance: number;
    studentProficiency: number;
    studentSkillLevel: string;
    minimumLevel: string;
    acceptHigherLevels: boolean;
    gap: number;
    levelGap: number;
    levelMet: boolean;
    scoreMet: boolean;
    requirementMet: boolean;
    missingSkill: boolean;
  }[];
  matchScore: number;
  isQualified: boolean;
  upgradeRequired: boolean;
};

function getSkillLevel(score: number) {
  if (score >= 85) return "Expert";
  if (score >= 70) return "Advanced";
  if (score >= 50) return "Intermediate";
  return "Beginner";
}

// Skill level is a separate credential from the numeric proficiency score.
// A 75% Advanced student is NOT the same thing as a 75% Intermediate student.
function normalizeLevel(level?: string | null) {
  const value = (level || "beginner").trim().toLowerCase();

  if (value === "expert") return "expert";
  if (value === "advanced") return "advanced";
  if (value === "intermediate") return "intermediate";
  return "beginner";
}

function levelRank(level?: string | null) {
  const normalized = normalizeLevel(level);

  if (normalized === "expert") return 3;
  if (normalized === "advanced") return 2;
  if (normalized === "intermediate") return 1;
  return 0;
}

function displayLevel(level?: string | null) {
  const normalized = normalizeLevel(level);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getLevelStyle(score: number) {
  if (score >= 85) {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  if (score >= 70) {
    return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
  }

  if (score >= 50) {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  return "bg-red-500/10 text-red-400 border-red-500/20";
}

export default function StudentPage() {
    const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    loadStudentData();
  }, []);

  async function loadStudentData() {
    setLoading(true);
    setError("");

    try {
      // ---------------------------------------------------------
      // 1. GET AUTHENTICATED USER
      // ---------------------------------------------------------

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error(
          "You are not logged in. Please log in with a student account."
        );
      }

      // ---------------------------------------------------------
      // 2. FIND THE EXACT STUDENT
      //    PRIMARY MATCH = students.user_id
      // ---------------------------------------------------------

      let studentData: Student | null = null;

      const { data: userStudent, error: userStudentError } =
        await supabase
          .from("students")
          .select(
            "id,user_id,name,email,phone,degree,specialization,year_of_study,bio,profile_image,readiness_score"
          )
          .eq("user_id", user.id)
          .maybeSingle();

      if (userStudentError) {
        throw userStudentError;
      }

      studentData = userStudent;

      // ---------------------------------------------------------
      // 3. EMAIL FALLBACK
      //    Only used if user_id isn't connected yet.
      //    This still prevents the "first student" problem.
      // ---------------------------------------------------------

      if (!studentData && user.email) {
        const { data: emailStudent, error: emailStudentError } =
          await supabase
            .from("students")
            .select(
              "id,user_id,name,email,phone,degree,specialization,year_of_study,bio,profile_image,readiness_score"
            )
            .eq("email", user.email)
            .maybeSingle();

        if (emailStudentError) {
          throw emailStudentError;
        }

        studentData = emailStudent;
      }

      if (!studentData) {
        throw new Error(
          `No student profile is connected to ${user.email}. Please connect this auth account to a row in the students table.`
        );
      }

      setStudent(studentData);

      // ---------------------------------------------------------
      // 4. LOAD ALL SKILLS
      // ---------------------------------------------------------

      const { data: skillsData, error: skillsError } = await supabase
        .from("skills")
        .select("id,name,category,description")
        .order("name");

      if (skillsError) {
        throw skillsError;
      }

      setSkills(skillsData || []);

      // ---------------------------------------------------------
      // 5. LOAD THIS STUDENT'S SKILLS ONLY
      // ---------------------------------------------------------

      const { data: studentSkillsData, error: studentSkillsError } =
        await supabase
          .from("student_skills")
          .select(
            "id,student_id,skill_id,proficiency,skill_level,verification_status,evidence"
          )
          .eq("student_id", studentData.id);

      if (studentSkillsError) {
        throw studentSkillsError;
      }

      setStudentSkills(studentSkillsData || []);

      // ---------------------------------------------------------
      // 6. LOAD INDUSTRY OPPORTUNITIES
      // ---------------------------------------------------------

      const { data: opportunityData, error: opportunityError } =
        await supabase
          .from("opportunities")
          .select(
            "id,title,company,location,opportunity_type,description"
          )
          .order("created_at", { ascending: false });

      if (opportunityError) {
        throw opportunityError;
      }

      // ---------------------------------------------------------
      // 7. LOAD JOB SKILL REQUIREMENTS
      // ---------------------------------------------------------

      const opportunityIds =
        opportunityData?.map((item) => item.id) || [];

      let opportunitySkillsData: OpportunitySkillRow[] = [];

      if (opportunityIds.length > 0) {
        const { data, error: opportunitySkillsError } =
          await supabase
            .from("opportunity_skills")
            .select(
              "id,opportunity_id,skill_id,required_proficiency,importance,minimum_level,required_level,accept_higher_levels"
            )
            .in("opportunity_id", opportunityIds);

        if (opportunitySkillsError) {
          throw opportunitySkillsError;
        }

        opportunitySkillsData = data || [];
      }

      // ---------------------------------------------------------
      // 8. CALCULATE PERSONALIZED JOB MATCH
      //
      // IMPORTANT:
      // - proficiency % and skill_level are separate.
      // - A student must satisfy BOTH the minimum score and level.
      // - Higher levels are accepted when accept_higher_levels=true.
      // - A one-level-lower student can still SEE the job, but cannot
      //   apply until they pass the required-level assessment.
      // ---------------------------------------------------------

      const calculatedOpportunities: Opportunity[] = (
        opportunityData || []
      ).map((opportunity) => {
        const requirements = opportunitySkillsData
          .filter(
            (requirement) =>
              requirement.opportunity_id === opportunity.id
          )
          .map((requirement) => {
            const skill = (skillsData || []).find(
              (item) => item.id === requirement.skill_id
            );

            const studentSkill = (studentSkillsData || []).find(
              (item) => item.skill_id === requirement.skill_id
            );

            const studentProficiency = studentSkill?.proficiency || 0;
            const required = requirement.required_proficiency || 0;

            // Support both column names because the database currently has
            // required_level as the canonical field and older rows may have
            // minimum_level populated.
            const minimumLevel =
              requirement.required_level ||
              requirement.minimum_level ||
              "beginner";

            const acceptHigherLevels =
              requirement.accept_higher_levels ?? true;

            const studentSkillLevel =
              studentSkill?.skill_level ||
              getSkillLevel(studentProficiency);

            const requiredRank = levelRank(minimumLevel);
            const studentRank = levelRank(studentSkillLevel);

            const levelMet = acceptHigherLevels
              ? studentRank >= requiredRank
              : studentRank === requiredRank;

            const scoreMet = studentProficiency >= required;
            const requirementMet = levelMet && scoreMet;

            const gap = Math.max(
              0,
              required - studentProficiency
            );

            const levelGap = Math.max(
              0,
              requiredRank - studentRank
            );

            return {
              skillId: requirement.skill_id,
              skillName: skill?.name || "Unknown Skill",
              required,
              importance: requirement.importance || 1,
              studentProficiency,
              studentSkillLevel,
              minimumLevel,
              acceptHigherLevels,
              gap,
              levelGap,
              levelMet,
              scoreMet,
              requirementMet,
              missingSkill: !studentSkill,
            };
          });

        let weightedTotal = 0;
        let weightTotal = 0;

        requirements.forEach((requirement) => {
          const required = requirement.required;

          // Keep the percentage match useful for ranking, but do NOT use it
          // by itself to decide whether the student is qualified.
          let scoreMatch = 0;

          if (required <= 0) {
            scoreMatch = 100;
          } else {
            scoreMatch = Math.min(
              100,
              Math.round(
                (requirement.studentProficiency / required) * 100
              )
            );
          }

          // Level contributes to the match too. A missing/lower level should
          // visibly reduce the match instead of looking fully qualified.
          let levelMatch = 100;

          if (requirement.levelGap > 0) {
            levelMatch =
              requirement.levelGap === 1
                ? 70
                : requirement.levelGap === 2
                  ? 40
                  : 20;
          }

          const combinedMatch = Math.round(
            scoreMatch * 0.6 + levelMatch * 0.4
          );

          weightedTotal +=
            combinedMatch * requirement.importance;
          weightTotal += requirement.importance;
        });

        const matchScore =
          weightTotal > 0
            ? Math.round(weightedTotal / weightTotal)
            : 0;

        const isQualified =
          requirements.length > 0 &&
          requirements.every(
            (requirement) => requirement.requirementMet
          );

        const upgradeRequired =
          requirements.some(
            (requirement) =>
              !requirement.levelMet &&
              requirement.levelGap > 0
          );

        return {
          id: opportunity.id,
          title: opportunity.title,
          company: opportunity.company,
          location: opportunity.location,
          opportunity_type: opportunity.opportunity_type,
          description: opportunity.description,
          requirements,
          matchScore,
          isQualified,
          upgradeRequired,
        };
      });

      setOpportunities(calculatedOpportunities);

      // ---------------------------------------------------------
      // 9. LOAD APPLICATIONS FOR THIS STUDENT
      // ---------------------------------------------------------

      const { data: applicationData, error: applicationError } =
        await supabase
          .from("applications")
          .select("opportunity_id")
          .eq("student_id", studentData.id);

      if (applicationError) {
        throw applicationError;
      }

      setApplications(
        (applicationData || []).map(
          (application) => application.opportunity_id
        )
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Something went wrong while loading your dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // STUDENT SKILLS WITH SKILL DETAILS
  // ---------------------------------------------------------

  const mySkills = useMemo(() => {
    return studentSkills
      .map((studentSkill) => {
        const skill = skills.find(
          (item) => item.id === studentSkill.skill_id
        );

        if (!skill) return null;

        return {
          ...skill,
          proficiency: studentSkill.proficiency,
          verification_status:
            studentSkill.verification_status,
          skill_level: studentSkill.skill_level,
        };
      })
      .filter(Boolean) as Array<
      Skill & {
        proficiency: number;
        verification_status: string;
        skill_level?: string | null;
      }
    >;
  }, [studentSkills, skills]);

  // ---------------------------------------------------------
  // READINESS = AVERAGE OF CURRENT SKILLS
  // ---------------------------------------------------------

  const readinessScore = useMemo(() => {
    if (mySkills.length === 0) return 0;

    const total = mySkills.reduce(
      (sum, skill) => sum + skill.proficiency,
      0
    );

    return Math.round(total / mySkills.length);
  }, [mySkills]);

  // ---------------------------------------------------------
  // SKILLS BELOW 70
  // ---------------------------------------------------------

  const skillGaps = useMemo(() => {
    return [...mySkills]
      .filter((skill) => skill.proficiency < 70)
      .sort((a, b) => a.proficiency - b.proficiency);
  }, [mySkills]);

  // ---------------------------------------------------------
  // JOBS: HIGHEST MATCH FIRST
  // ---------------------------------------------------------

  const sortedOpportunities = useMemo(() => {
    return [...opportunities].sort(
      (a, b) => b.matchScore - a.matchScore
    );
  }, [opportunities]);

  // ---------------------------------------------------------
  // APPLY
  // ---------------------------------------------------------

  async function applyToOpportunity(opportunity: Opportunity) {
    if (!student) return;

    setApplying(opportunity.id);
    setError("");

    try {
      if (applications.includes(opportunity.id)) {
        return;
      }

      const { error: insertError } = await supabase
        .from("applications")
        .insert({
          student_id: student.id,
          opportunity_id: opportunity.id,
          match_score: opportunity.matchScore,
          status: "applied",
        });

      if (insertError) {
        throw insertError;
      }

      setApplications((current) => [
        ...current,
        opportunity.id,
      ]);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message || "Could not submit application."
      );
    } finally {
      setApplying(null);
    }
  }

  // ---------------------------------------------------------
  // ASSESSMENT NAVIGATION
  // ---------------------------------------------------------

  function goToAssessments(skillName?: string) {
    if (skillName) {
      router.push(
        `/student/assessments?skill=${encodeURIComponent(skillName)}`
      );
      return;
    }

    router.push("/student/assessments");
  }

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading your Student Portal...
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (error && !student) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <div className="max-w-3xl mx-auto bg-red-950/30 border border-red-500/30 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-red-400">
            Could not load Student Portal
          </h1>

          <p className="text-slate-300 mt-2">
            {error}
          </p>

          <button
            onClick={loadStudentData}
            className="mt-5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const level = getSkillLevel(readinessScore);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
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
                Student Portal • SIH 26044
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <button
              type="button"
              onClick={() => router.push("/student")}
              className="text-emerald-400 hover:text-emerald-300 transition"
            >
              Student Dashboard
            </button>

            <button
              type="button"
              onClick={() => document.getElementById("my-skills")?.scrollIntoView({ behavior: "smooth" })}
              className="hover:text-white transition"
            >
              Skills
            </button>

            <button
              type="button"
              onClick={() => goToAssessments()}
              className="hover:text-white transition"
            >
              Assessments
            </button>

            <button
              type="button"
              onClick={() => router.push("/student/courses")}
              className="hover:text-white transition"
            >
              Courses
            </button>

            <button
              type="button"
              onClick={() => document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" })}
              className="hover:text-white transition"
            >
              Jobs
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 text-slate-400 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 bg-red-950/30 border border-red-500/30 text-red-300 rounded-xl p-4">
            {error}
          </div>
        )}

        {/* =====================================================
            PROFILE + READINESS
        ====================================================== */}

        <section className="grid lg:grid-cols-3 gap-5 mb-10">

          {/* PROFILE */}

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex flex-col sm:flex-row gap-5">

              <div className="h-20 w-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <User className="h-9 w-9 text-emerald-400" />
              </div>

              <div className="flex-1">

                <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">
                  Student Profile
                </p>

                <h2 className="text-3xl font-bold mt-1">
                  {student?.name}
                </h2>

                <p className="text-slate-400 mt-1">
                  {student?.degree}
                  {student?.specialization
                    ? ` • ${student.specialization}`
                    : ""}
                </p>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">

                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-400" />
                    {student?.email}
                  </span>

                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-emerald-400" />
                    {student?.phone || "Not added"}
                  </span>

                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-400" />
                    Year {student?.year_of_study ?? "—"}
                  </span>

                </div>

              </div>

            </div>
          </div>

          {/* READINESS */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Industry Readiness
              </p>

              <Target className="h-5 w-5 text-emerald-400" />
            </div>

            <p className="text-4xl font-bold text-emerald-400 mt-2">
              {readinessScore}%
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-lg border ${getLevelStyle(
                  readinessScore
                )}`}
              >
                {level}
              </span>
            </div>

            <div className="h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${readinessScore}%`,
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => goToAssessments()}
              className="w-full mt-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Award className="h-4 w-4" />
              Take Assessment
            </button>

          </div>
        </section>

        {/* =====================================================
            MY SKILLS
        ====================================================== */}

        <section id="my-skills" className="mb-10">

          <div className="flex items-end justify-between mb-5">
            <div>
              <h3 className="text-2xl font-bold">
                My Skills
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Your current competency profile from Supabase.
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {mySkills.length} skills
            </span>
          </div>

          {mySkills.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400">
                No skills have been added to your profile yet.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

              {mySkills.map((skill) => {

                const skillLevel =
                  skill.skill_level ||
                  getSkillLevel(skill.proficiency);

                return (
                  <div
                    key={skill.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition"
                  >

                    <div className="flex justify-between gap-3">

                      <div>
                        <h4 className="font-bold">
                          {skill.name}
                        </h4>

                        <p className="text-xs text-slate-500 mt-1">
                          {skill.category}
                        </p>
                      </div>

                      <span className="text-xl font-bold text-emerald-400">
                        {skill.proficiency}%
                      </span>

                    </div>

                    <div className="h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          skill.proficiency >= 70
                            ? "bg-emerald-500"
                            : skill.proficiency >= 50
                            ? "bg-amber-400"
                            : "bg-red-500"
                        }`}
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
                        className={`text-[11px] px-2 py-1 rounded-md border ${getLevelStyle(
                          skill.proficiency
                        )}`}
                      >
                        {skillLevel}
                      </span>

                      <span className="text-[11px] text-slate-500">
                        {skill.verification_status ||
                          "Not verified"}
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() => goToAssessments(skill.name)}
                      className="w-full mt-4 bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 border border-slate-700 text-slate-200 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
                    >
                      Assess {skill.name}
                      <ArrowRight className="h-4 w-4" />
                    </button>

                  </div>
                );
              })}

              {/* ADD SKILL */}

              <button
                type="button"
                onClick={() => goToAssessments()}
                className="min-h-[160px] border border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition"
              >
                <div className="h-11 w-11 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-emerald-400" />
                </div>

                <p className="font-bold mt-3">
                  + Add / Assess Skill
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Take an assessment to update your score
                </p>
              </button>

            </div>
          )}

        </section>

        {/* =====================================================
            SKILL GAPS
        ====================================================== */}

        <section className="mb-10">

          <div className="mb-5">
            <h3 className="text-2xl font-bold">
              Skills To Improve
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Skills below 70% are highlighted as improvement areas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">

            {skillGaps.slice(0, 3).map((skill) => (
              <div
                key={skill.id}
                className="bg-slate-900 border border-amber-500/20 rounded-2xl p-5"
              >

                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />

                  <span className="text-xs font-semibold uppercase">
                    Skill Gap
                  </span>
                </div>

                <h4 className="font-bold text-lg mt-4">
                  {skill.name}
                </h4>

                <p className="text-sm text-slate-500 mt-1">
                  Current proficiency: {skill.proficiency}%
                </p>

                <button
                  type="button"
                  onClick={() => goToAssessments(skill.name)}
                  className="w-full mt-5 bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 border border-slate-700 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
                >
                  Take Assessment
                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>
            ))}

            {skillGaps.length === 0 && (
              <div className="md:col-span-3 bg-slate-900 border border-emerald-500/20 rounded-2xl p-6 text-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-400 mx-auto" />

                <p className="font-semibold mt-3">
                  No major skill gaps detected.
                </p>
              </div>
            )}

          </div>
        </section>

        {/* =====================================================
            INDUSTRY JOBS
        ====================================================== */}

        <section id="jobs" className="mb-10">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">

            <div>
              <h3 className="text-2xl font-bold">
                Jobs & Internships
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Live opportunities posted by Industry partners.
              </p>
            </div>

            <button
              onClick={loadStudentData}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

          </div>

          {sortedOpportunities.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

              <BriefcaseBusiness className="h-8 w-8 text-slate-600 mx-auto" />

              <p className="font-semibold mt-3">
                No opportunities available yet.
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Industry jobs will appear here automatically when recruiters post them.
              </p>

            </div>
          ) : (

            <div className="space-y-4">

              {sortedOpportunities.map((opportunity) => (

                <div
                  key={opportunity.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >

                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">

                    {/* JOB */}

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {opportunity.opportunity_type}
                        </span>

                        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400">
                          {opportunity.location}
                        </span>

                      </div>

                      <h4 className="text-xl font-bold mt-4">
                        {opportunity.title}
                      </h4>

                      <p className="text-slate-400 mt-1">
                        {opportunity.company}
                      </p>

                      {opportunity.description && (
                        <p className="text-sm text-slate-500 mt-4">
                          {opportunity.description}
                        </p>
                      )}

                      {/* REQUIRED SKILLS */}

                      {opportunity.requirements.length > 0 && (
                        <div className="mt-5">

                          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                            Required Skills
                          </p>

                          <div className="grid sm:grid-cols-2 gap-3 mt-3">

                            {opportunity.requirements.map(
                              (requirement) => (
                                <div
                                  key={requirement.skillId}
                                  className="bg-slate-950 border border-slate-800 rounded-xl p-3"
                                >

                                  <div className="flex justify-between gap-3">

                                    <div>
                                      <span className="text-sm font-semibold">
                                        {requirement.skillName}
                                      </span>
                                      <p className="text-[10px] text-slate-500 mt-1">
                                        {displayLevel(requirement.minimumLevel)} level • Required {requirement.required}%
                                      </p>
                                      <p className="text-[10px] mt-1">
                                        Your level:{" "}
                                        <span
                                          className={
                                            requirement.levelMet
                                              ? "text-emerald-400"
                                              : "text-amber-400"
                                          }
                                        >
                                          {displayLevel(requirement.studentSkillLevel)}
                                        </span>
                                        {" • "}
                                        {requirement.acceptHigherLevels
                                          ? "Higher levels accepted"
                                          : "Exact level required"}
                                      </p>
                                    </div>

                                    <span
                                      className={
                                        requirement.studentProficiency >=
                                        requirement.required
                                          ? "text-emerald-400 text-xs font-bold"
                                          : "text-amber-400 text-xs font-bold"
                                      }
                                    >
                                      {requirement.studentProficiency}%
                                    </span>

                                  </div>

                                  <div className="flex justify-between mt-2 text-[11px]">

                                    <span className="text-slate-500">
                                      Required {requirement.required}%
                                    </span>

                                    {!requirement.levelMet ? (
                                      <span className="text-amber-400">
                                        Upgrade to {displayLevel(requirement.minimumLevel)}
                                      </span>
                                    ) : requirement.gap > 0 ? (
                                      <span className="text-amber-400">
                                        Gap {requirement.gap}%
                                      </span>
                                    ) : (
                                      <span className="text-emerald-400">
                                        Requirement met
                                      </span>
                                    )}

                                  </div>

                                </div>
                              )
                            )}

                          </div>
                        </div>
                      )}

                    </div>

                    {/* MATCH */}

                    <div className="lg:w-48 flex flex-col items-center lg:border-l lg:border-slate-800 lg:pl-6">

                      <p className="text-4xl font-bold text-emerald-400">
                        {opportunity.matchScore}%
                      </p>

                      <p className="text-[11px] uppercase tracking-widest text-slate-500 mt-1">
                        Skill Match
                      </p>

                      <p
                        className={`text-xs font-semibold mt-3 ${
                          opportunity.isQualified
                            ? "text-emerald-400"
                            : opportunity.upgradeRequired
                              ? "text-amber-400"
                              : "text-slate-400"
                        }`}
                      >
                        {opportunity.isQualified
                          ? "✓ Qualified"
                          : opportunity.upgradeRequired
                            ? "⚠ Skill level upgrade needed"
                            : "Skill score below requirement"}
                      </p>

                      <div className="w-full h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              opportunity.matchScore
                            )}%`,
                          }}
                        />
                      </div>

                      {applications.includes(
                        opportunity.id
                      ) ? (

                        <button
                          disabled
                          className="w-full mt-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-3 rounded-xl font-bold"
                        >
                          ✓ Applied
                        </button>

                      ) : opportunity.isQualified ? (

                        <button
                          onClick={() =>
                            applyToOpportunity(opportunity)
                          }
                          disabled={
                            applying === opportunity.id
                          }
                          className="w-full mt-5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 py-3 rounded-xl font-bold"
                        >
                          {applying === opportunity.id
                            ? "Applying..."
                            : "Apply Now"}
                        </button>

                      ) : opportunity.upgradeRequired ? (

                        <button
                          type="button"
                          onClick={() => {
                            const upgradeRequirement =
                              opportunity.requirements.find(
                                (requirement) =>
                                  !requirement.levelMet &&
                                  requirement.levelGap > 0
                              );

                            goToAssessments(
                              upgradeRequirement?.skillName
                            );
                          }}
                          className="w-full mt-5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 py-3 rounded-xl font-bold"
                        >
                          Upgrade Skill
                          <span className="block text-[10px] font-normal mt-1 opacity-80">
                            Take the required-level assessment
                          </span>
                        </button>

                      ) : (

                        <button
                          type="button"
                          onClick={() => {
                            const gapRequirement =
                              opportunity.requirements.find(
                                (requirement) =>
                                  !requirement.scoreMet
                              );

                            goToAssessments(
                              gapRequirement?.skillName
                            );
                          }}
                          className="w-full mt-5 bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-300 border border-slate-700 py-3 rounded-xl font-bold"
                        >
                          Improve Skill
                        </button>

                      )}

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* =====================================================
            LEARNING
        ====================================================== */}

        <section id="learning">

          <div className="mb-5">
            <h3 className="text-2xl font-bold">
              Recommended Learning
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Build the CSE skills you need for industry.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">

            {skillGaps.slice(0, 3).map((skill) => (

              <div
                key={skill.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
              >

                <BookOpen className="h-5 w-5 text-emerald-400" />

                <h4 className="font-bold mt-4">
                  Improve {skill.name}
                </h4>

                <p className="text-sm text-slate-500 mt-2">
                  Current score: {skill.proficiency}%
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/student/courses")}
                  className="mt-5 text-sm text-emerald-400 font-semibold flex items-center gap-2 hover:text-emerald-300 transition"
                >
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>

            ))}

            {skillGaps.length === 0 && (
              <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
                <BookOpen className="h-7 w-7 text-emerald-400 mx-auto" />

                <p className="font-semibold mt-3">
                  You're doing well across your current skills.
                </p>
              </div>
            )}

          </div>

        </section>

      </div>
    </main>
  );
}