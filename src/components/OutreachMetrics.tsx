import React from "react";
import { voiceGuidelines } from "../data";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

interface MetricsProps {
  emailText: string;
}

// Simple estimate of syllable count
function countSyllables(word: string): number {
  let w = word.toLowerCase().trim();
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  w = w.replace(/^y/, '');
  const syllables = w.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

export default function OutreachMetrics({ emailText }: MetricsProps) {
  if (!emailText) return null;

  // Words list
  const words = emailText
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"\n]/g, " ")
    .split(/\s+/)
    .filter(w => w.trim().length > 0);
  
  const wordCount = words.length;

  // Sentences count
  const sentences = emailText
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  // Total syllables
  const totalSyllables = words.reduce((acc, word) => acc + countSyllables(word), 0);

  // Flesch-Kincaid Grade Level formula
  // Grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
  let gradeLevel = 0;
  if (wordCount > 0) {
    gradeLevel = 0.39 * (wordCount / sentenceCount) + 11.8 * (totalSyllables / wordCount) - 15.59;
  }
  // Clamp value
  if (gradeLevel < 1) gradeLevel = 1;
  if (gradeLevel > 16) gradeLevel = 16;
  
  const formattedGrade = gradeLevel.toFixed(1);

  // Check for banned words
  const foundBanned: string[] = [];
  const textLower = emailText.toLowerCase();
  voiceGuidelines.banned_words.forEach(bw => {
    // Escape regex characters
    const escaped = bw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(textLower)) {
      foundBanned.push(bw);
    }
  });

  // Count questions
  const questionCount = (emailText.match(/\?/g) || []).length;

  return (
    <div id="outreach-metrics" className="bg-slate-950/60 border border-white/10 rounded-xl p-4 mt-6">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        Pat's Outbox Guard & Quality Metrics
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
        {/* Metric 1: Word Count */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-white/5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Word Count</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold ${wordCount >= 60 && wordCount <= 90 ? "text-brand" : "text-amber-400"}`}>
              {wordCount}
            </span>
            <span className="text-xs text-slate-500">words</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Target: 60-90 words
          </div>
        </div>

        {/* Metric 2: Readability Grade */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-white/5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Reading Level</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold ${gradeLevel <= 7 ? "text-brand" : "text-amber-400"}`}>
              Grade {formattedGrade}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Target: Mid 6th Grade
          </div>
        </div>

        {/* Metric 3: Question Limit */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-white/5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Questions in Body</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold ${questionCount <= 1 ? "text-brand" : "text-rose-400"}`}>
              {questionCount}
            </span>
            <span className="text-xs text-slate-500">/ 1 max</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            No bullet points.
          </div>
        </div>
      </div>

      {/* Banned Words Check */}
      <div className="bg-slate-900/80 px-3 py-2.5 rounded-lg border border-white/5 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          {foundBanned.length === 0 ? (
            <CheckCircle2 className="w-4 h-4 text-brand" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          )}
          <span className="text-xs font-semibold text-slate-200">
            {foundBanned.length === 0 ? "Zero buzzwords or jargon detected" : "Corporate buzzword alert!"}
          </span>
        </div>

        {foundBanned.length === 0 ? (
          <p className="text-[11px] text-slate-400">
            Excellent. Your copy is clean of fluff words like "leverage", "robust", or "empower".
          </p>
        ) : (
          <div>
            <p className="text-[11px] text-rose-400 font-medium mb-1.5">
              Pat wants these polished out before hit send:
            </p>
            <div className="flex flex-wrap gap-1">
              {foundBanned.map(bw => (
                <span key={bw} className="text-[10px] px-2 py-0.5 rounded bg-rose-950/40 border border-rose-900/30 text-rose-300 font-mono">
                  {bw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
