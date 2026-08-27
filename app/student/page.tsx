"use client";

import React, { useMemo, useState } from "react";
import {
  GraduationCap,
  Code2,
  Brain,
  Database,
  Globe,
  Trophy,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Briefcase,
  Target,
  X,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock3,
} from "lucide-react";

type Skill = {
  id: string;
  name: string;
  score: number;
  category: string;
  icon: React.ElementType;
};

type Question = {
  question: string;
  options: string[];
  answer: number;
};

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  skills: {
    name: string;
    weight: number;
    required: number;
  }[];
};

const initialSkills: Skill[] = [
  {
    id: "java",
    name: "Java",
    score: 78,
    category: "Programming",
    icon: Code2,
  },
  {
    id: "cpp",
    name: "C++",
    score: 71,
    category: "Programming",
    icon: Code2,
  },
  {
    id: "python",
    name: "Python",
    score: 64,
    category: "Programming",
    icon: Code2,
  },
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    score: 52,
    category: "Core CS",
    icon: Brain,
  },
  {
    id: "dbms",
    name: "DBMS / SQL",
    score: 73,
    category: "Core CS",
    icon: Database,
  },
  {
    id: "web",
    name: "Web Development",
    score: 61,
    category: "Development",
    icon: Globe,
  },
];

const assessmentQuestions: Record<string, Question[]> = {
  dsa: [
    {
      question: "Which data structure follows the LIFO principle?",
      options: ["Queue", "Stack", "Linked List", "Heap"],
      answer: 1,
    },
    {
      question: "What is the average time complexity of binary search?",
      options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
      answer: 2,
    },
    {
      question: "Which data structure is commonly used for BFS?",
      options: ["Stack", "Queue", "Heap", "Array"],
      answer: 1,
    },
    {
      question: "Which traversal of a Binary Search Tree gives sorted order?",
      options: ["Preorder", "Postorder", "Level Order", "Inorder"],
      answer: 3,
    },
    {
      question: "What is the worst-case time complexity of Quick Sort?",
      options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
      answer: 3,
    },
  ],

  java: [
    {
      question: "Which concept allows one class to acquire properties of another?",
      options: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
      answer: 1,
    },
    {
      question: "Which keyword is used to create an object in Java?",
      options: ["class", "object", "new", "create"],
      answer: 2,
    },
    {
      question: "Which collection does not allow duplicate elements?",
      options: ["List", "Set", "ArrayList", "LinkedList"],
      answer: 1,
    },
    {
      question: "Which method is the entry point of a Java application?",
      options: [
        "start()",
        "run()",
        "main()",
        "execute()",
      ],
      answer: 2,
    },
    {
      question: "Which keyword prevents a class from being inherited?",
      options: ["static", "private", "final", "protected"],
      answer: 2,
    },
  ],

  python: [
    {
      question: "Which symbol is used to create a list in Python?",
      options: ["{}", "[]", "()", "<>"],
      answer: 1,
    },
    {
      question: "Which keyword defines a function?",
      options: ["function", "func", "def", "define"],
      answer: 2,
    },
    {
      question: "Which data type stores key-value pairs?",
      options: ["List", "Tuple", "Set", "Dictionary"],
      answer: 3,
    },
    {
      question: "What does len() return?",
      options: [
        "The data type",
        "The number of elements",
        "The memory address",
        "The last element",
      ],
      answer: 1,
    },
    {
      question: "Which keyword is used to handle exceptions?",
      options: ["catch", "error", "try", "handle"],
      answer: 2,
    },
  ],

  cpp: [
    {
      question: "Which feature allows multiple functions with the same name?",
      options: ["Inheritance", "Overloading", "Encapsulation", "Casting"],
      answer: 1,
    },
    {
      question: "Which symbol is used to access members through a pointer?",
      options: [".", "::", "->", "#"],
      answer: 2,
    },
    {
      question: "Which is used for dynamic memory allocation?",
      options: ["malloc only", "new", "alloc", "memory"],
      answer: 1,
    },
    {
      question: "Which concept hides implementation details?",
      options: [
        "Abstraction",
        "Inheritance",
        "Compilation",
        "Overloading",
      ],
      answer: 0,
    },
    {
      question: "Which container stores elements in contiguous memory?",
      options: ["vector", "map", "set", "queue"],
      answer: 0,
    },
  ],

  dbms: [
    {
      question: "What does SQL stand for?",
      options: [
        "Structured Query Language",
        "Simple Query Language",
        "System Query Logic",
        "Structured Question Language",
      ],
      answer: 0,
    },
    {
      question: "Which command is used to retrieve data?",
      options: ["INSERT", "SELECT", "UPDATE", "DELETE"],
      answer: 1,
    },
    {
      question: "Which key uniquely identifies a row?",
      options: ["Foreign Key", "Primary Key", "Candidate Value", "Index"],
      answer: 1,
    },
    {
      question: "Which normal form removes partial dependency?",
      options: ["1NF", "2NF", "3NF", "BCNF"],
      answer: 1,
    },
    {
      question: "Which JOIN returns matching rows from both tables?",
      options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"],
      answer: 2,
    },
  ],

  web: [
    {
      question: "Which language structures the content of a webpage?",
      options: ["CSS", "HTML", "JavaScript", "SQL"],
      answer: 1,
    },
    {
      question: "Which technology is primarily used for styling webpages?",
      options: ["HTML", "CSS", "SQL", "Node"],
      answer: 1,
    },
    {
      question: "Which language adds interactivity to webpages?",
      options: ["HTML", "CSS", "JavaScript", "XML"],
      answer: 2,
    },
    {
      question: "What does API commonly stand for?",
      options: [
        "Application Programming Interface",
        "Application Process Internet",
        "Advanced Program Integration",
        "Applied Programming Input",
      ],
      answer: 0,
    },
    {
      question: "Which HTTP method is commonly used to retrieve data?",
      options: ["POST", "GET", "DELETE", "PATCH"],
      answer: 1,
    },
  ],
};

const jobs: Job[] = [
  {
    id: 1,
    title: "Software Developer Intern",
    company: "TechNova Solutions",
    location: "Bengaluru • Hybrid",
    type: "Internship",
    skills: [
      { name: "Java", weight: 30, required: 65 },
      { name: "Data Structures & Algorithms", weight: 35, required: 70 },
      { name: "DBMS / SQL", weight: 20, required: 60 },
      { name: "Web Development", weight: 15, required: 50 },
    ],
  },
  {
    id: 2,
    title: "Backend Developer Intern",
    company: "CloudAxis Technologies",
    location: "Chennai • Hybrid",
    type: "Internship",
    skills: [
      { name: "Java", weight: 30, required: 70 },
      { name: "DBMS / SQL", weight: 25, required: 65 },
      { name: "Data Structures & Algorithms", weight: 25, required: 65 },
      { name: "Python", weight: 20, required: 55 },
    ],
  },
  {
    id: 3,
    title: "Python Developer Intern",
    company: "DataWorks AI",
    location: "Remote",
    type: "Internship",
    skills: [
      { name: "Python", weight: 40, required: 70 },
      { name: "Data Structures & Algorithms", weight: 25, required: 60 },
      { name: "DBMS / SQL", weight: 20, required: 55 },
      { name: "Web Development", weight: 15, required: 45 },
    ],
  },
];

const courses = [
  {
    skill: "Data Structures & Algorithms",
    title: "Data Structures & Algorithms",
    provider: "NPTEL / SWAYAM",
    duration: "8 Weeks",
    level: "Intermediate",
  },
  {
    skill: "Java",
    title: "Programming in Java",
    provider: "NPTEL",
    duration: "12 Weeks",
    level: "Intermediate",
  },
  {
    skill: "Python",
    title: "Programming, Data Structures & Algorithms Using Python",
    provider: "NPTEL",
    duration: "8 Weeks",
    level: "Intermediate",
  },
  {
    skill: "DBMS / SQL",
    title: "Database Management Systems",
    provider: "SWAYAM",
    duration: "6 Weeks",
    level: "Intermediate",
  },
];

export default function StudentPage() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);

  const [assessmentSkill, setAssessmentSkill] = useState<string | null>(null);
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [assessmentFinished, setAssessmentFinished] = useState(false);
  const [assessmentScore, setAssessmentScore] = useState(0);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);

  const [showSkills, setShowSkills] = useState(false);

  const questions = assessmentSkill
    ? assessmentQuestions[assessmentSkill] || []
    : [];

  const readiness = useMemo(() => {
    if (!skills.length) return 0;

    return Math.round(
      skills.reduce((sum, skill) => sum + skill.score, 0) /
        skills.length
    );
  }, [skills]);

  const weakSkills = skills
    .filter((skill) => skill.score < 70)
    .sort((a, b) => a.score - b.score);

  function getSkillScore(skillName: string) {
    return (
      skills.find((skill) => skill.name === skillName)?.score ?? 0
    );
  }

  function calculateMatch(job: Job) {
    return Math.round(
      job.skills.reduce((total, requirement) => {
        const studentScore = getSkillScore(requirement.name);

        const performance = Math.min(
          studentScore / requirement.required,
          1
        );

        return total + performance * requirement.weight;
      }, 0)
    );
  }

  function startAssessment(skillId: string) {
    setAssessmentSkill(skillId);
    setAssessmentIndex(0);
    setAnswers([]);
    setAssessmentFinished(false);
    setAssessmentScore(0);
  }

  function selectAnswer(optionIndex: number) {
    if (!assessmentSkill || assessmentFinished) return;

    const newAnswers = [...answers];
    newAnswers[assessmentIndex] = optionIndex;
    setAnswers(newAnswers);
  }

  function nextQuestion() {
    if (!assessmentSkill) return;

    if (assessmentIndex < questions.length - 1) {
      setAssessmentIndex(assessmentIndex + 1);
      return;
    }

    const correct = answers.reduce((count, answer, index) => {
      return count + (answer === questions[index].answer ? 1 : 0);
    }, 0);

    const percentage = Math.round(
      (correct / questions.length) * 100
    );

    setAssessmentScore(percentage);
    setAssessmentFinished(true);

    // Practical demo progression:
    // Better assessment performance = larger skill improvement.
    const improvement =
      percentage >= 80
        ? 12
        : percentage >= 60
          ? 8
          : percentage >= 40
            ? 4
            : 2;

    setSkills((current) =>
      current.map((skill) => {
        if (skill.id !== assessmentSkill) return skill;

        return {
          ...skill,
          score: Math.min(100, skill.score + improvement),
        };
      })
    );
  }

  function closeAssessment() {
    setAssessmentSkill(null);
    setAssessmentIndex(0);
    setAnswers([]);
    setAssessmentFinished(false);
    setAssessmentScore(0);
  }

  function applyForJob(jobId: number) {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId]);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-slate-950" />
            </div>

            <div>
              <h1 className="font-bold text-xl">
                Ayur<span className="text-emerald-400">Bridge</span>
              </h1>

              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                Student Portal • CSE
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold">
                CSE Student
              </p>
              <p className="text-xs text-slate-500">
                Software Development Track
              </p>
            </div>

            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-400">
                CS
              </span>
            </div>

          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-8">

        {/* WELCOME */}
        <section className="mb-8">

          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            Student Skill Intelligence
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            Build skills. Improve your match.
          </h2>

          <p className="text-slate-400 mt-2 max-w-2xl">
            Your skill profile continuously changes as you complete
            assessments. Stronger verified skills unlock better
            opportunities.
          </p>

        </section>

        {/* READINESS */}
        <section className="grid lg:grid-cols-[1.3fr_0.7fr] gap-5 mb-8">

          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-6">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

              <div>

                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <Target className="h-4 w-4" />
                  Industry Readiness
                </div>

                <p className="text-4xl font-bold mt-3">
                  {readiness}%
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Based on your current verified skill profile.
                </p>

              </div>

              <div className="w-full md:w-64">

                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500">
                    Overall progress
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {readiness}%
                  </span>
                </div>

                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${readiness}%` }}
                  />

                </div>

              </div>

            </div>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <AlertCircle className="h-4 w-4" />
              Priority Improvement
            </div>

            {weakSkills.length > 0 ? (
              <>
                <p className="text-lg font-bold mt-3">
                  {weakSkills[0].name}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Current score:{" "}
                  <span className="text-amber-400 font-semibold">
                    {weakSkills[0].score}%
                  </span>
                </p>

                <button
                  onClick={() => startAssessment(weakSkills[0].id)}
                  className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Improve this skill
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-400 mt-3">
                Great work! No major skill gaps detected.
              </p>
            )}

          </div>

        </section>

        {/* MY SKILLS */}
        <section className="mb-10">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">

            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="text-xl font-bold">
                  My Skills
                </h3>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Your current competency profile.
              </p>
            </div>

            <button
              onClick={() => setShowSkills(!showSkills)}
              className="text-sm text-emerald-400 font-semibold"
            >
              {showSkills ? "Hide details" : "View details"}
            </button>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            {skills.map((skill) => {

              const Icon = skill.icon;

              const status =
                skill.score >= 75
                  ? "Strong"
                  : skill.score >= 60
                    ? "Developing"
                    : "Needs Work";

              return (
                <div
                  key={skill.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>

                      <div>
                        <p className="font-semibold text-sm">
                          {skill.name}
                        </p>

                        <p className="text-[11px] text-slate-500">
                          {skill.category}
                        </p>
                      </div>

                    </div>

                    <span
                      className={`text-xs font-bold ${
                        skill.score >= 75
                          ? "text-emerald-400"
                          : skill.score >= 60
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}
                    >
                      {skill.score}%
                    </span>

                  </div>

                  <div className="h-2 bg-slate-800 rounded-full mt-5 overflow-hidden">

                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        skill.score >= 75
                          ? "bg-emerald-500"
                          : skill.score >= 60
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${skill.score}%` }}
                    />

                  </div>

                  {showSkills && (
                    <div className="mt-4 flex items-center justify-between">

                      <span className="text-xs text-slate-500">
                        {status}
                      </span>

                      <button
                        onClick={() => startAssessment(skill.id)}
                        className="text-xs text-emerald-400 font-semibold flex items-center gap-1"
                      >
                        Assess
                        <ChevronRight className="h-3 w-3" />
                      </button>

                    </div>
                  )}

                </div>
              );
            })}

            {/* ADD SKILL */}
            <button
              onClick={() => setShowSkills(true)}
              className="min-h-[145px] rounded-2xl border border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950 hover:bg-slate-900 transition flex flex-col items-center justify-center"
            >

              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>

              <p className="font-semibold text-sm">
                + Get New Skill
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Take an assessment
              </p>

            </button>

          </div>

        </section>

        {/* RECOMMENDED COURSES */}
        <section className="mb-10">

          <div className="mb-5">

            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-400" />

              <h3 className="text-xl font-bold">
                Recommended Learning
              </h3>
            </div>

            <p className="text-sm text-slate-500 mt-1">
              Courses selected according to your current skill gaps.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

            {courses.map((course) => {

              const studentScore = getSkillScore(course.skill);

              return (
                <div
                  key={course.title}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                      {course.level}
                    </span>

                    <BookOpen className="h-4 w-4 text-slate-600" />

                  </div>

                  <h4 className="font-bold mt-4 text-sm leading-relaxed">
                    {course.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-2">
                    {course.provider}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
                    <Clock3 className="h-3.5 w-3.5" />
                    {course.duration}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800">

                    <p className="text-[11px] text-slate-500">
                      Your {course.skill} score
                    </p>

                    <p className="font-bold text-amber-400 mt-1">
                      {studentScore}%
                    </p>

                  </div>

                  <button className="w-full mt-4 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-xs font-semibold">
                    View Course
                  </button>

                </div>
              );
            })}

          </div>

        </section>

        {/* JOB MATCHING */}
        <section>

          <div className="flex items-end justify-between mb-5">

            <div>

              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-400" />

                <h3 className="text-xl font-bold">
                  Opportunities Matched For You
                </h3>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Match scores are calculated from your current skill profile.
              </p>

            </div>

          </div>

          <div className="grid lg:grid-cols-3 gap-5">

            {jobs.map((job) => {

              const match = calculateMatch(job);

              return (
                <div
                  key={job.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <h4 className="font-bold">
                        {job.title}
                      </h4>

                      <p className="text-sm text-slate-400 mt-1">
                        {job.company}
                      </p>

                    </div>

                    <div className="text-right shrink-0">

                      <p className="text-xl font-bold text-emerald-400">
                        {match}%
                      </p>

                      <p className="text-[10px] uppercase text-slate-500">
                        Match
                      </p>

                    </div>

                  </div>

                  <p className="text-xs text-slate-500 mt-3">
                    {job.location} • {job.type}
                  </p>

                  <div className="mt-5">

                    <p className="text-xs font-semibold text-slate-300 mb-3">
                      Skill compatibility
                    </p>

                    <div className="space-y-2">

                      {job.skills.map((requirement) => {

                        const score = getSkillScore(
                          requirement.name
                        );

                        const meets = score >= requirement.required;

                        return (
                          <div
                            key={requirement.name}
                            className="flex items-center justify-between text-xs"
                          >

                            <span className="text-slate-400">
                              {requirement.name}
                            </span>

                            <span
                              className={
                                meets
                                  ? "text-emerald-400 font-semibold"
                                  : "text-amber-400 font-semibold"
                              }
                            >
                              {score}%
                            </span>

                          </div>
                        );
                      })}

                    </div>

                  </div>

                  <button
                    onClick={() => setSelectedJob(job)}
                    className="w-full mt-5 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    Why this match?
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => applyForJob(job.id)}
                    disabled={appliedJobs.includes(job.id)}
                    className={`w-full mt-2 py-3 rounded-xl text-xs font-bold transition ${
                      appliedJobs.includes(job.id)
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    }`}
                  >
                    {appliedJobs.includes(job.id)
                      ? "✓ Application Submitted"
                      : "Apply Now"}
                  </button>

                </div>
              );
            })}

          </div>

        </section>

      </div>

      {/* ASSESSMENT MODAL */}
      {assessmentSkill && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">

            {!assessmentFinished ? (
              <>
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">

                  <div>

                    <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">
                      Skill Assessment
                    </p>

                    <h3 className="text-xl font-bold mt-1">
                      {skills.find(
                        (skill) => skill.id === assessmentSkill
                      )?.name}
                    </h3>

                  </div>

                  <button
                    onClick={closeAssessment}
                    className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>

                <div className="p-6">

                  <div className="flex justify-between text-xs text-slate-500 mb-3">

                    <span>
                      Question {assessmentIndex + 1} of{" "}
                      {questions.length}
                    </span>

                    <span>
                      {Math.round(
                        ((assessmentIndex + 1) /
                          questions.length) *
                          100
                      )}
                      %
                    </span>

                  </div>

                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-8">

                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{
                        width: `${
                          ((assessmentIndex + 1) /
                            questions.length) *
                          100
                        }%`,
                      }}
                    />

                  </div>

                  <h4 className="text-xl font-bold leading-relaxed">
                    {questions[assessmentIndex]?.question}
                  </h4>

                  <div className="space-y-3 mt-6">

                    {questions[assessmentIndex]?.options.map(
                      (option, index) => {

                        const selected =
                          answers[assessmentIndex] === index;

                        return (
                          <button
                            key={option}
                            onClick={() => selectAnswer(index)}
                            className={`w-full text-left p-4 rounded-xl border transition ${
                              selected
                                ? "border-emerald-500 bg-emerald-500/10"
                                : "border-slate-800 bg-slate-950 hover:border-slate-700"
                            }`}
                          >

                            <div className="flex items-center gap-3">

                              <div
                                className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  selected
                                    ? "bg-emerald-500 text-slate-950"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {String.fromCharCode(
                                  65 + index
                                )}
                              </div>

                              <span className="text-sm">
                                {option}
                              </span>

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>

                  <button
                    onClick={nextQuestion}
                    disabled={
                      answers[assessmentIndex] === undefined
                    }
                    className="w-full mt-7 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
                  >
                    {assessmentIndex === questions.length - 1
                      ? "Finish Assessment"
                      : "Next Question"}

                    <ArrowRight className="h-4 w-4" />
                  </button>

                </div>
              </>
            ) : (
              <div className="p-8 text-center">

                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-emerald-400" />
                </div>

                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mt-5">
                  Assessment Complete
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  {assessmentScore}%
                </h3>

                <p className="text-slate-400 mt-2">
                  Assessment score
                </p>

                <div className="mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left">

                  <div className="flex items-start gap-3">

                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />

                    <div>

                      <p className="font-semibold">
                        Your skill profile has been updated.
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        Your {skills.find(
                          (skill) =>
                            skill.id === assessmentSkill
                        )?.name} score has improved based on your
                        assessment performance.
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  onClick={closeAssessment}
                  className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl"
                >
                  Back to My Skills
                </button>

              </div>
            )}

          </div>

        </div>
      )}

      {/* JOB MATCH EXPLANATION MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">

            <div className="p-6 border-b border-slate-800 flex items-center justify-between">

              <div>

                <p className="text-xs text-emerald-400 uppercase tracking-widest font-semibold">
                  AI Match Explanation
                </p>

                <h3 className="text-xl font-bold mt-1">
                  {selectedJob.title}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedJob.company}
                </p>

              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            <div className="p-6">

              <div className="text-center mb-7">

                <p className="text-4xl font-bold text-emerald-400">
                  {calculateMatch(selectedJob)}%
                </p>

                <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                  Overall Compatibility
                </p>

              </div>

              <div className="space-y-4">

                {selectedJob.skills.map((requirement) => {

                  const score = getSkillScore(
                    requirement.name
                  );

                  const meets =
                    score >= requirement.required;

                  return (
                    <div key={requirement.name}>

                      <div className="flex justify-between items-center mb-2">

                        <span className="text-sm text-slate-300">
                          {requirement.name}
                        </span>

                        <span className="text-xs text-slate-500">
                          Weight: {requirement.weight}%
                        </span>

                      </div>

                      <div className="flex items-center gap-3">

                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">

                          <div
                            className={`h-full rounded-full ${
                              meets
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                score,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                        <span
                          className={`text-xs font-bold ${
                            meets
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {score}%
                        </span>

                      </div>

                      <p className="text-[11px] text-slate-500 mt-1">
                        Required: {requirement.required}%
                        {" • "}
                        {meets
                          ? "Requirement met"
                          : "Skill improvement recommended"}
                      </p>

                    </div>
                  );
                })}

              </div>

              <div className="mt-7 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">

                <div className="flex items-start gap-3">

                  <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5" />

                  <p className="text-xs text-slate-400 leading-relaxed">

                    Improving your weakest required skill can
                    increase your compatibility score for this
                    opportunity.

                  </p>

                </div>

              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="w-full mt-5 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-sm font-semibold"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}