"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Trophy,
  X,
  AlertTriangle,
} from "lucide-react";

type Question = {
  question: string;
  options: string[];
  answer: number;
};

type Level = "beginner" | "intermediate" | "advanced";

type AssessmentModalProps = {
  skillName: string;
  onClose: () => void;
  onComplete?: (score: number) => void;
};

const levels: {
  value: Level;
  label: string;
  description: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Fundamentals and basic concepts",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Practical understanding and application",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Deep concepts and problem solving",
  },
];

export default function AssessmentModal({
  skillName,
  onClose,
  onComplete,
}: AssessmentModalProps) {
  const [level, setLevel] = useState<Level>("beginner");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const [score, setScore] = useState(0);

  const answeredCount = answers.filter(
    (answer) => answer !== undefined
  ).length;

  const currentAnswer = answers[currentQuestion];

  const unansweredCount = questions.length - answeredCount;

  const calculatedScore = useMemo(() => {
    if (!questions.length) return 0;

    const correct = questions.reduce((count, question, index) => {
      return count + (answers[index] === question.answer ? 1 : 0);
    }, 0);

    return Math.round((correct / questions.length) * 100);
  }, [questions, answers]);

  useEffect(() => {
    generateAssessment();
  }, []);

  async function generateAssessment() {
    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill: skillName,
          level,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Could not generate assessment."
        );
      }

      if (!data.questions || data.questions.length !== 10) {
        throw new Error(
          "The AI did not generate exactly 10 questions."
        );
      }

      setQuestions(data.questions);
      setAnswers([]);
      setCurrentQuestion(0);
      setSubmitted(false);
      setScore(0);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Could not generate the assessment."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function changeLevel(newLevel: Level) {
    setLevel(newLevel);

    setQuestions([]);
    setAnswers([]);
    setCurrentQuestion(0);
    setSubmitted(false);
    setScore(0);
    setError("");

    setGenerating(true);

    try {
      const response = await fetch("/api/generate-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill: skillName,
          level: newLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Could not generate assessment."
        );
      }

      setQuestions(data.questions || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Could not generate the assessment."
      );
    } finally {
      setGenerating(false);
    }
  }

  function selectAnswer(optionIndex: number) {
    if (submitted) return;

    setAnswers((current) => {
      const updated = [...current];
      updated[currentQuestion] = optionIndex;
      return updated;
    });
  }

  function submitAssessment() {
    const finalScore = calculatedScore;

    setScore(finalScore);
    setSubmitted(true);
    setShowSubmitConfirm(false);

    onComplete?.(finalScore);
  }

  function handleSubmitClick() {
    if (unansweredCount > 0) {
      setShowSubmitConfirm(true);
      return;
    }

    submitAssessment();
  }

  function goToQuestion(index: number) {
    if (index < 0 || index >= questions.length) return;

    setCurrentQuestion(index);
  }

  function getOptionLetter(index: number) {
    return String.fromCharCode(65 + index);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">

      <div className="w-full max-w-4xl max-h-[94vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">

          <div>
            <div className="flex items-center gap-2">

              <Sparkles className="h-4 w-4 text-emerald-400" />

              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">
                AI Skill Assessment
              </p>

            </div>

            <h3 className="text-xl sm:text-2xl font-bold mt-1">
              {skillName}
            </h3>

            {questions.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {levelLabels(level)} • 10 AI-generated questions
              </p>
            )}

          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        {/* Loading */}
        {generating && (
          <div className="p-12 text-center">

            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
            </div>

            <h4 className="font-bold text-lg mt-5">
              Generating your assessment...
            </h4>

            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              AI is creating 10 questions specifically for{" "}
              {skillName} at the {level} level.
            </p>

          </div>
        )}

        {/* Error */}
        {!generating && error && (
          <div className="p-8 text-center">

            <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>

            <h4 className="font-bold mt-4">
              Assessment could not be generated
            </h4>

            <p className="text-sm text-red-300 mt-2">
              {error}
            </p>

            <button
              onClick={generateAssessment}
              className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Assessment */}
        {!generating &&
          !error &&
          questions.length === 10 &&
          !submitted && (
            <div className="overflow-y-auto">

              {/* Level selector */}
              <div className="p-5 sm:p-6 border-b border-slate-800">

                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
                  Assessment Level
                </p>

                <div className="grid grid-cols-3 gap-2">

                  {levels.map((item) => {
                    const active = level === item.value;

                    return (
                      <button
                        key={item.value}
                        onClick={() =>
                          changeLevel(item.value)
                        }
                        className={`text-left p-3 rounded-xl border transition ${
                          active
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <p
                          className={`text-sm font-semibold ${
                            active
                              ? "text-emerald-400"
                              : "text-slate-300"
                          }`}
                        >
                          {item.label}
                        </p>

                        <p className="text-[10px] text-slate-500 mt-1 hidden sm:block">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}

                </div>

              </div>

              {/* Question boxes */}
              <div className="p-5 sm:p-6 border-b border-slate-800">

                <div className="flex items-center justify-between mb-3">

                  <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                    Questions
                  </p>

                  <p className="text-xs text-slate-500">
                    {answeredCount}/10 answered
                  </p>

                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">

                  {questions.map((_, index) => {

                    const answered =
                      answers[index] !== undefined;

                    const active =
                      currentQuestion === index;

                    return (
                      <button
                        key={index}
                        onClick={() =>
                          goToQuestion(index)
                        }
                        className={`h-10 rounded-lg text-xs font-bold border transition ${
                          active
                            ? "bg-emerald-500 text-slate-950 border-emerald-500"
                            : answered
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {answered && !active ? "✓" : index + 1}
                      </button>
                    );
                  })}

                </div>

              </div>

              {/* Question */}
              <div className="p-5 sm:p-7">

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">

                  <span>
                    Question {currentQuestion + 1} of 10
                  </span>

                  <span>
                    {Math.round(
                      ((currentQuestion + 1) / 10) * 100
                    )}
                    %
                  </span>

                </div>

                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-7">

                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: `${
                        ((currentQuestion + 1) / 10) * 100
                      }%`,
                    }}
                  />

                </div>

                <h4 className="text-lg sm:text-xl font-bold leading-relaxed">
                  {questions[currentQuestion].question}
                </h4>

                <div className="space-y-3 mt-6">

                  {questions[currentQuestion].options.map(
                    (option, index) => {

                      const selected =
                        currentAnswer === index;

                      return (
                        <button
                          key={index}
                          onClick={() =>
                            selectAnswer(index)
                          }
                          className={`w-full text-left p-4 rounded-xl border transition ${
                            selected
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-slate-800 bg-slate-950 hover:border-slate-700"
                          }`}
                        >

                          <div className="flex items-center gap-3">

                            <div
                              className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                selected
                                  ? "bg-emerald-500 text-slate-950"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {getOptionLetter(index)}
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

                {/* Navigation */}
                <div className="flex gap-3 mt-7">

                  <button
                    onClick={() =>
                      goToQuestion(currentQuestion - 1)
                    }
                    disabled={currentQuestion === 0}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>

                  {currentQuestion < 9 ? (
                    <button
                      onClick={() =>
                        goToQuestion(currentQuestion + 1)
                      }
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitClick}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl font-bold"
                    >
                      Submit Assessment
                    </button>
                  )}

                </div>

                {/* Always-visible submit */}
                {currentQuestion !== 9 && (
                  <button
                    onClick={handleSubmitClick}
                    className="w-full mt-3 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 py-3 rounded-xl text-sm font-semibold"
                  >
                    Submit Assessment
                  </button>
                )}

              </div>

            </div>
          )}

        {/* Results */}
        {!generating &&
          !error &&
          submitted &&
          questions.length === 10 && (
            <div className="overflow-y-auto">

              <div className="p-6 sm:p-8">

                <div className="text-center">

                  <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-emerald-400" />
                  </div>

                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mt-5">
                    Assessment Complete
                  </p>

                  <h3 className="text-5xl font-bold mt-2">
                    {score}%
                  </h3>

                  <p className="text-slate-400 mt-2">
                    {Math.round(score / 10)} / 10 correct
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-sm">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    {skillName} •{" "}
                    {levelLabels(level)}
                  </div>

                </div>

                {/* Result summary */}
                <div className="grid sm:grid-cols-3 gap-3 mt-8">

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                      {score}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Score
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold">
                      {answeredCount}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Attempted
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold">
                      {unansweredCount}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Unanswered
                    </p>
                  </div>

                </div>

                {/* Question review */}
                <div className="mt-8">

                  <h4 className="font-bold text-lg mb-4">
                    Question Review
                  </h4>

                  <div className="space-y-4">

                    {questions.map((question, index) => {

                      const selected =
                        answers[index];

                      const isCorrect =
                        selected === question.answer;

                      return (
                        <div
                          key={index}
                          className="bg-slate-950 border border-slate-800 rounded-2xl p-5"
                        >

                          <div className="flex items-start gap-3">

                            {isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                            ) : (
                              <X className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                            )}

                            <div className="min-w-0 flex-1">

                              <p className="text-xs text-slate-500 mb-2">
                                Question {index + 1}
                              </p>

                              <p className="font-semibold leading-relaxed">
                                {question.question}
                              </p>

                              <div className="mt-4 space-y-2">

                                <div
                                  className={`p-3 rounded-lg ${
                                    isCorrect
                                      ? "bg-emerald-500/10 border border-emerald-500/20"
                                      : "bg-red-500/10 border border-red-500/20"
                                  }`}
                                >
                                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                                    Your answer
                                  </p>

                                  <p className="text-sm mt-1">
                                    {selected !== undefined
                                      ? `${getOptionLetter(
                                          selected
                                        )}. ${
                                          question.options[
                                            selected
                                          ]
                                        }`
                                      : "Not answered"}
                                  </p>

                                </div>

                                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">

                                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                                    Correct answer
                                  </p>

                                  <p className="text-sm text-emerald-400 mt-1 font-semibold">
                                    {getOptionLetter(
                                      question.answer
                                    )}
                                    .{" "}
                                    {
                                      question.options[
                                        question.answer
                                      ]
                                    }
                                  </p>

                                </div>

                              </div>

                            </div>

                          </div>

                        </div>
                      );
                    })}

                  </div>

                </div>

                <button
                  onClick={onClose}
                  className="w-full mt-7 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl"
                >
                  Back to My Skills
                </button>

              </div>

            </div>
          )}

        {/* Submit confirmation */}
        {showSubmitConfirm && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-5">

            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">

              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              </div>

              <h4 className="text-lg font-bold mt-4">
                Submit Assessment?
              </h4>

              <p className="text-sm text-slate-400 mt-2">
                You have answered{" "}
                <span className="text-white font-semibold">
                  {answeredCount} of 10
                </span>{" "}
                questions.
              </p>

              <p className="text-sm text-amber-400 mt-2">
                {unansweredCount} unanswered question
                {unansweredCount === 1 ? "" : "s"} will be
                marked incorrect.
              </p>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() =>
                    setShowSubmitConfirm(false)
                  }
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold"
                >
                  Continue Assessment
                </button>

                <button
                  onClick={submitAssessment}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl font-bold"
                >
                  Submit Anyway
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );

  function levelLabels(value: Level) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}