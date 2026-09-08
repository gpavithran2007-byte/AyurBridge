"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Database,
  Globe,
  Layers3,
  Search,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

type Skill = {
  id: string;
  name: string;
  category?: string | null;
};

type CourseContent = {
  id: string;
  skill_id: string;
  title: string;
  description: string | null;
  level: "beginner" | "intermediate" | "advanced";
  content_type: "lesson" | "website" | "pdf" | "video";
  url: string | null;
};

const skillIcons: Record<string, React.ReactNode> = {
  Java: <Code2 className="h-5 w-5" />,
  "Data Structures & Algorithms": <Layers3 className="h-5 w-5" />,
  "DBMS / SQL": <Database className="h-5 w-5" />,
  Python: <Code2 className="h-5 w-5" />,
  "Web Development": <Globe className="h-5 w-5" />,
};

const levelOrder = ["beginner", "intermediate", "advanced"] as const;

const levelLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const studentCourseSkills = [
  "Java",
  "Data Structures & Algorithms",
  "DBMS / SQL",
  "Python",
  "Web Development",
];

export default function CoursesPage() {
  const router = useRouter();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [content, setContent] = useState<CourseContent[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedLevel, setSelectedLevel] =
    useState<(typeof levelOrder)[number]>("beginner");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    setError("");

    const [skillsResult, contentResult] = await Promise.all([
      supabase
        .from("skills")
        .select("id, name, category")
        .order("name"),

      supabase
        .from("course_content")
        .select(
          "id, skill_id, title, description, level, content_type, url"
        )
        .order("created_at"),
    ]);

    if (skillsResult.error) {
      console.error(skillsResult.error);
      setError("Could not load skills.");
      setLoading(false);
      return;
    }

    if (contentResult.error) {
      console.error(contentResult.error);
      setError("Could not load course content.");
      setLoading(false);
      return;
    }

    const allSkills = skillsResult.data || [];
    const loadedContent = contentResult.data || [];

    // The Courses page is for the five skills used by the student portal.
    // Keep the existing database IDs so course_content.skill_id matches
    // the exact skills rows returned by Supabase.
const loadedSkills: Skill[] = [];

for (const name of studentCourseSkills) {
  const skill = allSkills.find((item: Skill) => item.name === name);

  if (skill) {
    loadedSkills.push(skill);
  }
}

setSkills(loadedSkills);
setContent(loadedContent);

const defaultSkill =
  loadedSkills.find((item: Skill) => item.name === "Java") ||
  loadedSkills[0] ||
  null;

setSelectedSkill(defaultSkill);

    setSelectedSkill(defaultSkill);

    setLoading(false);
  }

  function getSkillContent(skillId: string) {
    return content.filter(
      (item) => String(item.skill_id) === String(skillId)
    );
  }

  function getLevelContent(skillId: string, level: string) {
    return content.filter(
      (item) =>
        String(item.skill_id) === String(skillId) &&
        item.level === level
    );
  }

  function openResource(item: CourseContent) {
    if (!item.url) return;

    window.open(item.url, "_blank", "noopener,noreferrer");
  }

  function getIcon(skillName: string) {
    return (
      skillIcons[skillName] || <BookOpen className="h-5 w-5" />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-slate-950" />
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

          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <button
              onClick={() => router.push("/student")}
              className="text-slate-400 hover:text-white transition"
            >
              Student Dashboard
            </button>

            <button
              onClick={() => router.push("/student")}
              className="text-slate-400 hover:text-white transition"
            >
              Skills
            </button>

            <span className="text-emerald-400 font-medium">
              Courses
            </span>

            <button
              onClick={() => router.push("/student")}
              className="text-slate-400 hover:text-white transition"
            >
              Assessments
            </button>

            <button
              onClick={() => router.push("/student")}
              className="text-slate-400 hover:text-white transition"
            >
              Jobs
            </button>
          </nav>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Back */}
        <button
          onClick={() => router.push("/student")}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-7 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Student Dashboard
        </button>

        {/* Heading */}
        <div className="mb-8">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">
            Learning Hub
          </p>

          <h2 className="text-3xl font-bold mt-2">
            Learn & Improve Your Skills
          </h2>

          <p className="text-slate-400 mt-2 max-w-2xl">
            Explore curated learning resources for the skills used
            in your industry-readiness profile.
          </p>
        </div>

        {loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
            Loading learning content...
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">

            {/* Skills */}
            <aside>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">

                <div className="flex items-center gap-2 px-2 mb-4">
                  <Search className="h-4 w-4 text-slate-500" />
                  <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                    Your Skills
                  </span>
                </div>

                <div className="space-y-2">
                  {skills.map((skill) => {
                    const active = selectedSkill?.id === skill.id;
                    const resourceCount = getSkillContent(skill.id).length;

                    return (
                      <button
                        key={skill.id}
                        onClick={() => {
                          setSelectedSkill(skill);
                          setSelectedLevel("beginner");
                        }}
                        className={`w-full text-left rounded-xl p-3 transition border ${
                          active
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">

                          <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                              active
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-slate-800 text-emerald-400"
                            }`}
                          >
                            {getIcon(skill.name)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">
                              {skill.name}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {resourceCount} resources
                            </p>
                          </div>

                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            </aside>

            {/* Course Content */}
            <section>

              {selectedSkill && (
                <>

                  {/* Course Header */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                      <div className="flex items-center gap-4">

                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          {getIcon(selectedSkill.name)}
                        </div>

                        <div>
                          <p className="text-xs text-emerald-400 uppercase tracking-widest font-semibold">
                            Learning Path
                          </p>

                          <h3 className="text-2xl font-bold mt-1">
                            {selectedSkill.name}
                          </h3>

                          {selectedSkill.category && (
                            <p className="text-sm text-slate-500 mt-1">
                              {selectedSkill.category}
                            </p>
                          )}
                        </div>

                      </div>

                      <button
                        onClick={() => {
                          const skillSlug = selectedSkill.name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "");

                          router.push(
                            `/student/assessments?skill=${encodeURIComponent(
                              skillSlug
                            )}`
                          );
                        }}
                        className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Take Assessment
                      </button>

                    </div>

                    <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <p className="text-sm text-slate-400">
                        Learning is optional. You can take the assessment
                        anytime — completing these resources does not
                        automatically change your verified skill score.
                      </p>
                    </div>

                  </div>

                  {/* Level Tabs */}
                  <div className="flex gap-2 mb-5 overflow-x-auto">

                    {levelOrder.map((level) => {
                      const count = getLevelContent(
                        selectedSkill.id,
                        level
                      ).length;

                      const active = selectedLevel === level;

                      return (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold whitespace-nowrap transition ${
                            active
                              ? "bg-emerald-500 text-slate-950 border-emerald-500"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {levelLabels[level]}

                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              active
                                ? "bg-slate-950/20"
                                : "bg-slate-800"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}

                  </div>

                  {/* Resources */}
                  <div className="space-y-4">

                    {getLevelContent(
                      selectedSkill.id,
                      selectedLevel
                    ).map((item, index) => (

                      <div
                        key={item.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/30 transition"
                      >

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                          <div className="flex gap-4">

                            <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                              {index + 1}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">

                                <h4 className="font-bold text-lg">
                                  {item.title}
                                </h4>

                                <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                  {item.content_type}
                                </span>

                              </div>

                              <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                                {item.description}
                              </p>
                            </div>

                          </div>

                          {item.url && (
                            <button
                              onClick={() => openResource(item)}
                              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition"
                            >
                              Open Resource
                              <ArrowUpRight className="h-4 w-4" />
                            </button>
                          )}

                        </div>

                      </div>

                    ))}

                    {getLevelContent(
                      selectedSkill.id,
                      selectedLevel
                    ).length === 0 && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

                        <BookOpen className="h-8 w-8 text-slate-600 mx-auto mb-3" />

                        <p className="font-semibold">
                          No content available yet
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          More learning resources will be added soon.
                        </p>

                      </div>
                    )}

                  </div>

                </>
              )}

            </section>

          </div>
        )}

      </div>
    </main>
  );
}