"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

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
  date_of_birth?: string | null;
};

export default function StudentProfilePage() {
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    degree: "",
    specialization: "",
    year_of_study: "",
    date_of_birth: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("You are not logged in.");

      let studentData: Student | null = null;

      const { data: userStudent, error: userStudentError } = await supabase
        .from("students")
        .select(
          "id,user_id,name,email,phone,degree,specialization,year_of_study,bio,date_of_birth"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (userStudentError) throw userStudentError;

      studentData = userStudent;

      // Same safe fallback used by the Student Dashboard.
      if (!studentData && user.email) {
        const { data: emailStudent, error: emailStudentError } =
          await supabase
            .from("students")
            .select(
              "id,user_id,name,email,phone,degree,specialization,year_of_study,bio,date_of_birth"
            )
            .eq("email", user.email)
            .maybeSingle();

        if (emailStudentError) throw emailStudentError;
        studentData = emailStudent;
      }

      if (!studentData) {
        throw new Error(
          `No student profile is connected to ${user.email}.`
        );
      }

      setStudent(studentData);
      setForm({
        name: studentData.name || "",
        phone: studentData.phone || "",
        degree: studentData.degree || "",
        specialization: studentData.specialization || "",
        year_of_study:
          studentData.year_of_study != null
            ? String(studentData.year_of_study)
            : "",
        date_of_birth: studentData.date_of_birth || "",
        bio: studentData.bio || "",
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile() {
    if (!student) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!form.name.trim()) {
        throw new Error("Name is required.");
      }

      const year =
        form.year_of_study.trim() === ""
          ? null
          : Number(form.year_of_study);

      if (year !== null && (!Number.isInteger(year) || year < 1 || year > 8)) {
        throw new Error("Year of study must be a valid number.");
      }

      const { data, error: updateError } = await supabase
        .from("students")
        .update({
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          degree: form.degree.trim(),
          specialization: form.specialization.trim(),
          year_of_study: year,
          date_of_birth: form.date_of_birth || null,
          bio: form.bio.trim() || null,
        })
        .eq("id", student.id)
        .select(
          "id,user_id,name,email,phone,degree,specialization,year_of_study,bio,date_of_birth"
        )
        .single();

      if (updateError) throw updateError;

      setStudent(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        degree: data.degree || "",
        specialization: data.specialization || "",
        year_of_study:
          data.year_of_study != null ? String(data.year_of_study) : "",
        date_of_birth: data.date_of_birth || "",
        bio: data.bio || "",
      });

      setMessage("Profile saved successfully.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-emerald-400">Loading your profile...</p>
      </main>
    );
  }

  if (error && !student) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-2xl mx-auto pt-10">
          <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-6">
            <h1 className="text-xl font-bold text-red-400">
              Could not load profile
            </h1>
            <p className="text-slate-300 mt-2">{error}</p>
            <button
              type="button"
              onClick={() => router.push("/student")}
              className="mt-5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-xl">
                Ayur<span className="text-emerald-400">Bridge</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                Student Profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/student")}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">
            Your Profile
          </p>
          <h2 className="text-3xl font-bold mt-2">Personal Information</h2>
          <p className="text-slate-500 mt-2">
            Keep your details up to date so your faculty and industry profile
            stays accurate.
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-950/30 border border-red-500/30 text-red-300 rounded-xl p-4">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {message}
          </div>
        )}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-5">
            <Field
              label="Full Name"
              icon={<User className="h-4 w-4" />}
              value={form.name}
              onChange={(value) => updateField("name", value)}
              placeholder="Your full name"
              required
            />

            <div>
              <label className="text-sm font-semibold text-slate-300">
                Email
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  value={student?.email || ""}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Login email is managed by your account.
              </p>
            </div>

            <Field
              label="Phone Number"
              icon={<Phone className="h-4 w-4" />}
              value={form.phone}
              onChange={(value) => updateField("phone", value)}
              placeholder="e.g. +91 98765 43210"
              type="tel"
            />

            <Field
              label="Date of Birth"
              icon={<CalendarDays className="h-4 w-4" />}
              value={form.date_of_birth}
              onChange={(value) => updateField("date_of_birth", value)}
              type="date"
            />

            <Field
              label="Degree"
              value={form.degree}
              onChange={(value) => updateField("degree", value)}
              placeholder="e.g. B.Tech"
            />

            <Field
              label="Specialization"
              value={form.specialization}
              onChange={(value) => updateField("specialization", value)}
              placeholder="e.g. Computer Science & Engineering"
            />

            <Field
              label="Year of Study"
              value={form.year_of_study}
              onChange={(value) => updateField("year_of_study", value)}
              placeholder="e.g. 3"
              type="number"
              min="1"
              max="8"
            />

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-300">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                placeholder="Tell us a little about yourself..."
                rows={5}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Changes are saved to your student profile.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/student")}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold flex items-center gap-2 transition"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  max,
}: {
  label: string;
  icon?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-300">
        {label}
        {required && <span className="text-emerald-400 ml-1">*</span>}
      </label>

      <div className="relative mt-2">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          required={required}
          className={`w-full ${
            icon ? "pl-10" : "px-4"
          } pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500/50`}
        />
      </div>
    </div>
  );
}
