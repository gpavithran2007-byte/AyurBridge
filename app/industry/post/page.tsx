"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  BriefcaseBusiness,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type Skill = {
  id: string;
  name: string;
  category: string;
};

type RequiredSkill = {
  skill_id: string;
  name: string;
  category: string;
  proficiency: number;
};

export default function PostOpportunityPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("internship");

  const [skills, setSkills] = useState<Skill[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([]);

  const [selectedSkill, setSelectedSkill] = useState("");
  const [proficiency, setProficiency] = useState(70);

  const [loadingSkills, setLoadingSkills] = useState(true);
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* Load available skills from Supabase */
  useEffect(() => {
    async function loadSkills() {
      const { data, error } = await supabase
        .from("skills")
        .select("id, name, category")
        .order("name");

    if (error) {
     setError(`Could not load skills: ${error.message}`);
    console.log("Supabase skills error:", error);
    }else {
        setSkills(data || []);
      }

      setLoadingSkills(false);
    }

    loadSkills();
  }, []);

  /* Add a skill to the job */
  function addSkill() {
    if (!selectedSkill) return;

    const skill = skills.find((s) => s.id === selectedSkill);

    if (!skill) return;

    // Don't allow duplicate skills
    if (requiredSkills.some((s) => s.skill_id === skill.id)) {
      setError("This skill has already been added.");
      return;
    }

    setRequiredSkills([
      ...requiredSkills,
      {
        skill_id: skill.id,
        name: skill.name,
        category: skill.category,
        proficiency,
      },
    ]);

    setSelectedSkill("");
    setProficiency(70);
    setError("");
  }

  /* Remove a skill */
  function removeSkill(skillId: string) {
    setRequiredSkills(
      requiredSkills.filter((skill) => skill.skill_id !== skillId)
    );
  }

  /* Update required percentage */
  function updateProficiency(skillId: string, value: number) {
    setRequiredSkills(
      requiredSkills.map((skill) =>
        skill.skill_id === skillId
          ? { ...skill, proficiency: value }
          : skill
      )
    );
  }

  /* Submit opportunity */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title || !company || !location) {
      setError("Please fill in all opportunity details.");
      return;
    }

    if (requiredSkills.length === 0) {
      setError("Add at least one required skill.");
      return;
    }

    setPosting(true);

    try {
      /*
       * STEP 1:
       * Create the opportunity.
       */
      const { data: opportunity, error: opportunityError } = await supabase
        .from("opportunities")
        .insert({
          title,
          company,
          location,
          opportunity_type: type,
        })
        .select("id")
        .single();

      if (opportunityError || !opportunity) {
        console.error(opportunityError);
        throw new Error(
          opportunityError?.message || "Could not create opportunity."
        );
      }

      /*
       * STEP 2:
       * Connect the opportunity with its required skills.
       */
      const skillRows = requiredSkills.map((skill) => ({
        opportunity_id: opportunity.id,
        skill_id: skill.skill_id,
        required_proficiency: skill.proficiency,
        importance: skill.proficiency,
      }));

      const { error: skillsError } = await supabase
        .from("opportunity_skills")
        .insert(skillRows);

      /*
       * If inserting skills fails, remove the opportunity
       * so we don't leave an incomplete job behind.
       */
      if (skillsError) {
        console.error(skillsError);

        await supabase
          .from("opportunities")
          .delete()
          .eq("id", opportunity.id);

        throw new Error(
          skillsError.message || "Could not save required skills."
        );
      }

      setSuccess("Opportunity posted successfully!");

      /*
       * Give the success message a moment,
       * then return to Industry Dashboard.
       */
      setTimeout(() => {
        router.push("/industry");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setPosting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

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

        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Back */}
        <button
          onClick={() => router.push("/industry")}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-7"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Industry Dashboard
        </button>

        {/* Heading */}
        <div className="mb-8">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">
            Industry Partner
          </p>

          <h2 className="text-3xl font-bold mt-2">
            Post a New Opportunity
          </h2>

          <p className="text-slate-400 mt-2">
            Define the skills your organization needs and the minimum
            proficiency required.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Basic Details */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">

            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BriefcaseBusiness className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <h3 className="font-bold">
                  Opportunity Details
                </h3>

                <p className="text-xs text-slate-500">
                  Basic information about the role
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              {/* Job Title */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-300">
                  Job / Internship Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Java Software Developer Intern"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              {/* Company */}
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Company / Organization
                </label>

                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. TCS"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Location
                </label>

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chennai / Remote"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Opportunity Type
                </label>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="internship">Internship</option>
                  <option value="job">Full-time Job</option>
                  <option value="research">Research</option>
                </select>
              </div>

            </div>
          </section>

          {/* Skills */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">

            <div className="mb-6">
              <h3 className="font-bold text-lg">
                Required Skills
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Select the skills required for this opportunity and define
                their minimum proficiency.
              </p>
            </div>

            {/* Add Skill */}
            <div className="grid md:grid-cols-[1fr_150px_auto] gap-3 items-end">

              <div>
                <label className="text-xs text-slate-400">
                  Skill
                </label>

                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  disabled={loadingSkills}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="">
                    {loadingSkills
                      ? "Loading skills..."
                      : "Select a skill"}
                  </option>

                  {skills
                    .filter(
                      (skill) =>
                        !requiredSkills.some(
                          (selected) => selected.skill_id === skill.id
                        )
                    )
                    .map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400">
                  Required %
                </label>

                <input
                  type="number"
                  min="1"
                  max="100"
                  value={proficiency}
                  onChange={(e) =>
                    setProficiency(Number(e.target.value))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={addSkill}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-xl text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add Skill
              </button>

            </div>

            {/* Selected Skills */}
            {requiredSkills.length > 0 && (
              <div className="mt-7 space-y-3">

                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  Selected Requirements
                </p>

                {requiredSkills.map((skill) => (
                  <div
                    key={skill.skill_id}
                    className="border border-slate-800 bg-slate-950 rounded-xl p-4"
                  >

                    <div className="flex flex-col md:flex-row md:items-center gap-4">

                      <div className="flex-1">
                        <p className="font-semibold">
                          {skill.name}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {skill.category}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">

                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={skill.proficiency}
                          onChange={(e) =>
                            updateProficiency(
                              skill.skill_id,
                              Number(e.target.value)
                            )
                          }
                          className="w-24 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-center"
                        />

                        <span className="text-sm text-slate-500">
                          required
                        </span>

                        <button
                          type="button"
                          onClick={() => removeSkill(skill.skill_id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>

                    </div>

                    {/* Percentage bar */}
                    <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{
                          width: `${skill.proficiency}%`,
                        }}
                      />
                    </div>

                  </div>
                ))}

              </div>
            )}

          </section>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end">

            <button
              type="submit"
              disabled={posting}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-7 py-3.5 rounded-xl transition"
            >
              <Send className="h-4 w-4" />

              {posting
                ? "Posting..."
                : "Post Opportunity"}

            </button>

          </div>

        </form>

      </div>
    </main>
  );
}