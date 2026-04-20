// Godly Chaos Engine: Forensic Transformer v3.3
// Implementation: 100% Non-Generative Structural Hull Resin (SHR).
// v3.3: Structure-Preserving Pipeline + Extreme Mode Integration.
// NO LLM CALLS: Rule-based mapping from Human Consortium.

import { FidelityEngine } from './fidelityEngine';
import { applyStructuralChaos } from './chaosEngine';
import { evaluateHumanQuality, shouldRegenerateByQuality } from './qualityEngine';
import { applyHumanErrors, lightReInjectErrors, PRECONDITION_SYSTEM_PROMPT, PRESERVE_ERRORS_SYSTEM_PROMPT } from './humanErrorEngine';
import type { HumanErrorConfig } from './humanErrorEngine';
import { applyBladerHumanizerPolicy } from './bladerHumanizer';
export type StrengthMode = "conservative" | "balanced" | "strong";
export { applyBladerHumanizerPolicy } from './bladerHumanizer';

const NOISE_PATTERNS: RegExp[] = [
  /!\[[^\]]*]\([^)]*\)/gi, // markdown images
  /\[[^\]]+]\((?:https?:\/\/|www\.)[^)]*\)/gi, // markdown links
  /https?:\/\/\S+/gi, // raw urls
  /www\.\S+/gi,
  /^\s*>\s?.*$/gim, // blockquote lines
  /\boriginal reddit post\b/gi,
  /\barchived\b/gi,
  /\bauthor\s*:\s*[^\n.]+/gi,
  /\bsource\s*:\s*[^\n.]+/gi
];

function stripNoise(text: string): string {
  let cleaned = text || "";
  for (const pattern of NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, " ");
  }
  cleaned = cleaned
    .replace(/[*_`#~[\]()]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleaned;
}

function pickHullRhythm(hullText: string): string {
  const cleaned = stripNoise(hullText);
  const blocked = new Set([
    "reddit", "post", "author", "source", "archived", "http", "https", "www",
    "bulatlat", "com", "org", "net"
  ]);
  const allowedDiscourse = new Set([
    "i", "think", "to", "be", "fair", "from", "my", "view", "overall", "in", "practice",
    "at", "the", "same", "time", "for", "example", "in", "reality", "on", "this", "point"
  ]);
  const words = (cleaned.match(/[A-Za-z']+/g) || [])
    .map((w) => w.toLowerCase())
    .filter((w) => (w.length > 1 || w === "i") && !blocked.has(w))
    .filter((w) => allowedDiscourse.has(w));

  const selected = words.slice(0, 4);
  return selected.length >= 2 ? selected.join(" ") : "in practice";
}

export const fillerPolicy = {
  allowedNeutralFillers: [
    "in practice",
    "overall",
    "for example",
    "in this context",
    "to some extent",
    "in general",
    "in many cases",
    "at the same time",
    "at this point",
    "in that setting",
    "for this case",
    "in real terms",
    "on that note",
    "to keep it practical",
  ],
  forbiddenReplacements: {
    "tbh": "to be honest",
    "idk": "i do not know",
    "u": "you",
    "r": "are",
    "lol": "",
    "bruh": "",
    "fr": "truly",
    "kinda": "somewhat",
    "sorta": "rather",
    "gonna": "going to",
    "wana": "want to",
    "wanna": "want to",
    "no cap": "assuredly",
    "lowkey": "subtly",
    "highkey": "clearly",
    "sus": "suspicious",
    "ghosted": "ignored",
    "from my view": "in practice",
    "from my perspective": "in practice",
    "in my perspective": "in practice",
    "from this perspective": "at this point",
  } as Record<string, string>,
  // Any non-neutral filler phrase from generator that should be pruned.
  nonAllowedFillerPhrases: [
    "honestly",
    "basically",
    "actually",
    "i think",
    "so like",
    "to be fair",
    "if you think about it",
    "in real terms",
    "plus like",
    "not to mention",
    "from my view",
    "from my perspective",
    "in my perspective",
    "from this perspective",
  ],
};

const allLeadFillers = [
  ...fillerPolicy.allowedNeutralFillers,
  ...fillerPolicy.nonAllowedFillerPhrases,
].sort((a, b) => b.length - a.length);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countWords(text: string): number {
  return (text.match(/\b[A-Za-z']+\b/g) || []).length;
}

export function calculateMaxAllowedFillers(wordCount: number): number {
  if (wordCount >= 100) {
    return Math.max(2, Math.ceil((wordCount / 100) * 3));
  }
  return Math.max(0, Math.ceil((wordCount / 100) * 2));
}

function replaceForbiddenShortForms(text: string): string {
  let next = text;
  for (const [token, replacement] of Object.entries(fillerPolicy.forbiddenReplacements)) {
    const regex = new RegExp(`\\b${escapeRegExp(token)}\\b`, "gi");
    next = next.replace(regex, replacement);
  }
  return next.replace(/\s{2,}/g, " ").trim();
}

function extractLeadFiller(sentence: string): string | null {
  const trimmed = sentence.trim().toLowerCase();
  for (const filler of allLeadFillers) {
    const regex = new RegExp(`^${escapeRegExp(filler)}\\b(?:,\\s*|\\s+)`, "i");
    if (regex.test(trimmed)) return filler;
  }
  return null;
}

function removeLeadFiller(sentence: string, filler: string): string {
  const regex = new RegExp(`^\\s*${escapeRegExp(filler)}\\b(?:,\\s*|\\s+)`, "i");
  return sentence.replace(regex, "").trim();
}

export function getQualityMetrics(text: string) {
  const normalized = (text || "").trim();
  const wordCount = countWords(normalized);
  const fillerCount = fillerPolicy.allowedNeutralFillers.reduce((sum, phrase) => {
    const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "gi");
    return sum + (normalized.match(regex) || []).length;
  }, 0);
  const forbiddenCount = Object.keys(fillerPolicy.forbiddenReplacements).reduce((sum, token) => {
    const regex = new RegExp(`\\b${escapeRegExp(token)}\\b`, "gi");
    return sum + (normalized.match(regex) || []).length;
  }, 0);

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  let repeatedLeadCount = 0;
  let lastLead = "";
  for (const sentence of sentences) {
    const lead = extractLeadFiller(sentence) || "";
    if (lead && lead === lastLead) repeatedLeadCount += 1;
    if (lead) lastLead = lead;
  }

  return { wordCount, fillerCount, forbiddenCount, repeatedLeadCount };
}

export function applyHumanizerQualityPolicy(text: string): string {
  let output = replaceForbiddenShortForms(stripNoise(text || ""));
  const maxFillers = calculateMaxAllowedFillers(countWords(output));
  const usage: Record<string, number> = {};
  let keptFillers = 0;
  let lastKept = "";

  const sentences = output
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const cleanedSentences = sentences.map((sentence) => {
    let next = replaceForbiddenShortForms(sentence);
    const lead = extractLeadFiller(next);
    if (!lead) return next;

    const isAllowed = fillerPolicy.allowedNeutralFillers.includes(lead);
    if (!isAllowed) {
      return removeLeadFiller(next, lead);
    }

    if (keptFillers >= maxFillers || lead === lastKept || (usage[lead] || 0) >= 2) {
      return removeLeadFiller(next, lead);
    }

    usage[lead] = (usage[lead] || 0) + 1;
    keptFillers += 1;
    lastKept = lead;
    return next;
  });

  output = cleanedSentences.join(" ");
  output = replaceForbiddenShortForms(output)
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();

  // Final cap enforcement after all cleanup (word count can shrink during sanitization).
  const finalCap = calculateMaxAllowedFillers(countWords(output));
  let kept = 0;
  const finalSentences = output
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((sentence) => {
      const lead = extractLeadFiller(sentence);
      if (!lead) return sentence;
      if (!fillerPolicy.allowedNeutralFillers.includes(lead)) {
        return removeLeadFiller(sentence, lead);
      }
      if (kept >= finalCap) {
        return removeLeadFiller(sentence, lead);
      }
      kept += 1;
      return sentence;
    });
  output = finalSentences.join(" ").replace(/\s{2,}/g, " ").trim();

  return output;
}

function isUsableAtom(atom: string): boolean {
  const cleaned = atom.toLowerCase().replace(/[^a-z\s']/g, " ").trim();
  if (!cleaned) return false;
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length < 3) return false;
  const stopwords = new Set(["the", "a", "an", "to", "of", "in", "on", "for", "and", "or", "but", "with", "by"]);
  const contentWords = words.filter((w) => !stopwords.has(w));
  return contentWords.length >= 2;
}

function normalizeSentenceCase(text: string): string {
  return (text || "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => `${p1}${p2.toUpperCase()}`)
    .trim();
}

function normalizeTypographyArtifacts(text: string): string {
  return (text || "")
    // Convert decorative em-dash asides into parenthetical commas.
    .replace(/\s*—\s*([^—\n]{2,120}?)\s*—\s*/g, ", $1, ")
    // Remove repeated dash chains.
    .replace(/\s*(?:—\s*){2,}/g, " ")
    .replace(/\s*(?:-\s*){2,}/g, " ")
    // Normalize hyphen spacing inside compound tokens.
    .replace(/([A-Za-z0-9])\s*-\s*([A-Za-z0-9])/g, "$1-$2")
    // Collapse accidental doubled punctuation.
    .replace(/([,.;:!?])\1+/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function lowerInitialForEmbeddedClause(text: string): string {
  const trimmed = (text || "").trim();
  if (!trimmed) return trimmed;
  if (/^[A-Z][a-z]/.test(trimmed)) {
    return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  }
  return trimmed;
}

function stripLeadDiscourse(sentence: string): string {
  const prefixes = fillerPolicy.allowedNeutralFillers.sort((a, b) => b.length - a.length);
  let next = sentence.trim();
  for (const prefix of prefixes) {
    const regex = new RegExp(`^${escapeRegExp(prefix)}\\b(?:,\\s*|\\s+)`, "i");
    if (regex.test(next)) {
      next = next.replace(regex, "").trim();
      break;
    }
  }
  return next;
}

function dedupeAndRepairFlow(text: string): string {
  const lines = (text || "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => normalizeSentenceCase(s))
    .map((s) => s.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const out: string[] = [];
  let lastCore = "";
  for (const sentence of lines) {
    const normalized = sentence.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    const core = stripLeadDiscourse(sentence).toLowerCase();
    if (core && core === lastCore) continue;
    lastCore = core;
    out.push(sentence);
  }

  return out.join(" ").replace(/\s{2,}/g, " ").trim();
}

function pickLeadByUsage(pool: string[], usage: Record<string, number>, seed: number): string {
  const ordered = [...pool].sort((a, b) => {
    const ua = usage[a] || 0;
    const ub = usage[b] || 0;
    if (ua !== ub) return ua - ub;
    const ah = simpleStableHash(`${a}:${seed}`);
    const bh = simpleStableHash(`${b}:${seed}`);
    return ah - bh;
  });
  return ordered[0];
}

function simpleStableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function sentenceWordCount(text: string): number {
  return (text.match(/\b[A-Za-z']+\b/g) || []).length;
}

function ensureTerminalPunctuation(sentence: string): string {
  const trimmed = sentence.trim();
  if (!trimmed) return trimmed;
  if (/[.!?]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

function splitLongSentence(sentence: string, maxWords: number): string[] {
  const normalized = sentence.trim();
  if (sentenceWordCount(normalized) <= maxWords) return [normalized];
  const separators = [", ", "; ", " - ", " — "];
  let best: { index: number; sep: string; distance: number } | null = null;
  for (const sep of separators) {
    let from = 0;
    while (from < normalized.length) {
      const index = normalized.indexOf(sep, from);
      if (index < 0) break;
      if (index > 18 && index < normalized.length - 18) {
        const mid = normalized.length / 2;
        const distance = Math.abs(index - mid);
        if (!best || distance < best.distance) {
          best = { index, sep, distance };
        }
      }
      from = index + sep.length;
    }
  }
  if (best) {
    const left = normalizeSentenceCase(normalized.slice(0, best.index).trim());
    const right = normalizeSentenceCase(normalized.slice(best.index + best.sep.length).trim());
    if (sentenceWordCount(left) >= 6 && sentenceWordCount(right) >= 6) {
      return [left, right];
    }
  }
  return [normalized];
}

export function applyStructureRefinement(text: string, mode: StrengthMode): string {
  if (!text.trim()) return text;
  const rawSentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const maxWords = mode === "strong" ? 22 : mode === "balanced" ? 28 : 34;
  const splitSentences = rawSentences.flatMap((s) => splitLongSentence(s, maxWords));

  const merged: string[] = [];
  const shortLimit = mode === "strong" ? 9 : 7;
  for (let i = 0; i < splitSentences.length; i += 1) {
    const current = splitSentences[i];
    const next = splitSentences[i + 1];
    if (
      next &&
      sentenceWordCount(current) <= shortLimit &&
      sentenceWordCount(next) <= shortLimit &&
      !/[!?]$/.test(current) &&
      !/[!?]$/.test(next)
    ) {
      merged.push(`${current.replace(/[.!?]$/, "")} ${lowerInitialForEmbeddedClause(next.replace(/[.!?]$/, ""))}.`);
      i += 1;
      continue;
    }
    merged.push(current);
  }

  if (mode === "strong" && merged.length > 1) {
    const first = merged[0];
    if (extractLeadFiller(first)) {
      const second = merged[1];
      merged[0] = second;
      merged[1] = first;
    }
  }

  return merged
    .map((s) => normalizeSentenceCase(ensureTerminalPunctuation(s)))
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * V9.0: Nuclear Spacing Jitter
 * Randomly injects double spaces or spacing irregularities between words 
 * to mimic natural human typing flows. AI never produces these patterns.
 */
function applyNuclearSpacingJitter(text: string, seed: number): string {
  const words = text.split(/\s+/);
  let s = seed;
  let jittered = "";

  for (let i = 0; i < words.length; i++) {
    jittered += words[i];
    if (i < words.length - 1) {
      s = simpleStableHash(s.toString() + words[i]);
      const roll = seededRandom(s);
      // 5% chance of double space, 2% chance of triple space
      if (roll < 0.05) jittered += "  ";
      else if (roll < 0.02) jittered += "   ";
      else jittered += " ";
    }
  }
  return jittered;
}

/**
 * Strips markdown, preamble, and explanations from LLM output.
 * Models often add "Here is the edited text:" or markdown formatting despite instructions.
 */
function cleanLlmOutput(raw: string): string {
  let cleaned = (raw || "").trim();

  // Strip common LLM preamble patterns
  cleaned = cleaned
    .replace(/^(here\s+(is|are)\s+(the\s+)?(edited|humanized|polished|revised|final)\s+(text|version|output)\s*[:.\-—]*\s*\n*)/i, "")
    .replace(/^(sure[!,.]?\s*(here\s+(is|you\s+go)\s*[:.\-—]*\s*\n*))/i, "")
    .replace(/^(certainly[!,.]?\s*\n*)/i, "")
    .replace(/^(of course[!,.]?\s*\n*)/i, "")
    .replace(/^(below is\s+(the\s+)?(edited|humanized|polished)\s+(text|version)\s*[:.\-—]*\s*\n*)/i, "");

  // Strip markdown formatting
  cleaned = cleaned
    .replace(/^#+\s+.+\n*/gm, "")        // headers
    .replace(/\*\*([^*]+)\*\*/g, "$1")     // bold
    .replace(/\*([^*]+)\*/g, "$1")         // italic
    .replace(/```[\s\S]*?```/g, "")        // code blocks
    .replace(/`([^`]+)`/g, "$1");          // inline code

  // Strip trailing notes/explanations
  const trailingPatterns = [
    /\n+(note|explanation|comment|i\s+have|i\s+made|i\s+kept|changes\s+made|key\s+changes)[\s\S]*$/i,
    /\n+---[\s\S]*$/,
  ];
  for (const pattern of trailingPatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  return cleaned.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function resolveStrength(options: { strength?: string }): StrengthMode {
  const raw = String(options.strength || "balanced").toLowerCase().trim();
  if (raw === "conservative" || raw === "strong") return raw;
  return "balanced";
}

// ─── Document Structure Classifier v3.3 ────────────────────────────────────
// Classifies every line into one of 5 types. Only 'body' gets humanized.
// Reference section is a ONE-WAY GATE: once detected, everything after is 'reference'.

type BlockType = 'title' | 'toc' | 'heading' | 'subheading' | 'reference' | 'body' | 'list_item';

const HEADING_KEYWORDS = /^(introduction|conclusion|summary|background|abstract|discussion|analysis|results|recommendations|methodology|literature\s+review|theoretical\s+framework|data\s+(collection|analysis)|research\s+(design|questions?|methodology)|findings|implications|limitations|acknowledgements?|appendix|appendices)$/i;

const REFERENCE_TRIGGERS = /^(references|bibliography|works\s+cited|cited\s+works|reference\s+list|sources|literature\s+cited)\s*:?\s*$/i;

const TOC_HEADER = /^(table\s+of\s+contents|contents|list\s+of\s+(tables|figures))\s*:?\s*$/i;

// ToC line: "1.1 Background ..... 3" or "1.1 Background   3"
const TOC_LINE = /^\s*(?:\d+(?:\.\d+)*|[ivxlc]+|[a-z])(?:[.):]|\s)\s*.+\s*(?:\.{2,}|\s{3,})\s*\d+\s*$/i;

function classifyLine(text: string, lineIndex: number, totalLines: number, isInReferenceSection: boolean, isInTocSection: boolean): BlockType {
  const originalTrimmed = text.trim();
  if (originalTrimmed.length === 0) return 'body'; // blank lines handled separately

  // 1. ONE-WAY GATE: References
  if (isInReferenceSection) return 'reference';

  // Strip markdown formatting specifically for classification to avoid misses
  // e.g. "## Table of Contents", "**Introduction**", "### 1.1 Background"
  const classifyText = originalTrimmed.replace(/^#+\s*/, '').replace(/[*_~`]/g, '').trim();
  const trimmed = classifyText;

  // 2. HARD MARKDOWN HEADING GUARD
  // If the raw text explicitly stars with Markdown heading (###), it's ALWAYS a heading/subheading
  let isExplicitMarkdownHeading = false;
  if (/^#{1,2}\s+/.test(originalTrimmed)) {
    isExplicitMarkdownHeading = true;
  } else if (/^#{3,6}\s+/.test(originalTrimmed)) {
    return 'subheading';
  }

  // Reference section trigger
  if (REFERENCE_TRIGGERS.test(trimmed) || (isExplicitMarkdownHeading && REFERENCE_TRIGGERS.test(trimmed))) {
    return 'reference';
  }

  // Table of Contents header
  if (TOC_HEADER.test(trimmed) || (isExplicitMarkdownHeading && TOC_HEADER.test(trimmed))) {
    return 'toc'; // This will trigger isInTocSection in the loop
  }

  // If inside TOC, treat list items, short lines, and numbered entries as 'toc' untouched lines
  if (isInTocSection) {
    // If it's a very long body-like paragraph, we've likely exited the TOC
    if (trimmed.length > 150 && !/^\s*(?:\d+[-.)]|\*|-|\+)\s/.test(originalTrimmed)) {
      // Exit TOC natively (handled in loop), but for now return body
      return 'body';
    }
    // If it's a hard markdown heading, and we are in TOC, it means TOC finished, real section begins
    if (isExplicitMarkdownHeading) return 'heading';
    
    return 'toc';
  }

  if (isExplicitMarkdownHeading) return 'heading';

  // ToC entry line (page numbers with dots)
  if (TOC_LINE.test(trimmed)) return 'toc';

  // Title detection: first non-empty line if short and title-like
  if (lineIndex === 0 && trimmed.length < 120 && trimmed.length > 3) {
    const words = trimmed.split(/\s+/);
    if (words.length <= 20 && !/[.!?]$/.test(trimmed)) return 'title';
  }

  // Heading patterns
  const words = trimmed.split(/\s+/);

  // Keyword-only headings: "Introduction", "Methodology", etc.
  if (HEADING_KEYWORDS.test(trimmed.replace(/[:.]/g, ""))) return 'heading';

  // Numbered headings: "1.", "1.1", "1.1.1", "2.3.1 Data Collection"
  if (/^\d+(\.\d+)*[.):]?\s+.+/i.test(trimmed) && words.length <= 12) return 'heading';

  // Lettered headings: "A.", "a)", "B."
  if (/^[a-zA-Z][.):]\s+.+/i.test(trimmed) && words.length <= 10) return 'heading';

  // Roman numeral headings: "IV. Discussion", "III. Results"
  if (/^[IVXLC]+[.):]\s+.+/i.test(trimmed) && words.length <= 10) return 'heading';

  // Chapter/Section/Part: "Chapter 2: Analysis"
  if (/^(chapter|section|part)\s+\d+/i.test(trimmed) && words.length <= 12) return 'heading';

  // Colon-terminated titles: "Background:" or "Data Analysis:"
  if (/^[A-Z][^:]{2,60}:\s*$/.test(trimmed) && words.length <= 8) return 'heading';

  // ALL CAPS short lines (< 80 chars): "LITERATURE REVIEW"
  if (trimmed.length < 80 && trimmed === trimmed.toUpperCase() && /[A-Z]{2,}/.test(trimmed) && words.length <= 10) return 'heading';

  // Short non-punctuated lines that look like sub-headings
  if (words.length <= 6 && trimmed.length < 60 && !/[.!?;,]$/.test(trimmed) && /^[A-Z]/.test(trimmed)) {
    // Additional check: no lowercase articles at start (avoid catching short sentences)
    if (!/^(the|a|an|this|that|it|we|he|she|they|in|on|at|for|to)\s/i.test(trimmed)) return 'heading';
  }

  // List Items
  if (/^\s*[-*+]\s+/.test(originalTrimmed) || /^\s*\d+[\.)]\s+/.test(originalTrimmed)) {
    return 'list_item';
  }

  return 'body';
}

export async function transformText(
  aiText: string,
  dnaProfile: any,
  env: any,
  options: {
    academic?: boolean;
    useConsortium?: boolean;
    humanErrorThreshold?: number;
    assignmentMode?: boolean;
    bladerHumanizer?: boolean;
    persona?: any; // PersonaID
  } = {},
) {
  if (!aiText || !dnaProfile) return { pipelineOutput: aiText, llmOutput: null };
  const isAcademic = options.academic || false;
  const isAssignmentMode = options.assignmentMode || false;
  const useBladerHumanizer = options.bladerHumanizer !== false;
  const activePersonaID = options.persona || "AUTO";
  
  // ─── Document Structure Parsing (v3.3) ──────────────────────────────
  // Split into structural blocks. Only 'body' blocks get humanized.
  const rawLines = aiText.split(/\r?\n/);
  const blocks: { type: BlockType, content: string }[] = [];
  let currentParagraph = "";
  let isInReferenceSection = false;
  let isInTocSection = false;
  let firstNonEmptyLineIndex = -1;

  // Find first non-empty line index for title detection
  for (let i = 0; i < rawLines.length; i++) {
    if (rawLines[i].trim().length > 0) { firstNonEmptyLineIndex = i; break; }
  }

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const relativeIndex = i === firstNonEmptyLineIndex ? 0 : 1; // pass 0 only for actual first content line
    
    // Classify
    const lineType = classifyLine(line, relativeIndex, rawLines.length, isInReferenceSection, isInTocSection);

    // One-way gate transitions
    if (lineType === 'reference') isInReferenceSection = true;
    
    // TOC transitions
    if (lineType === 'toc' && !isInTocSection && TOC_HEADER.test(line.replace(/^#+\s*/, '').replace(/[*_~`]/g, '').trim())) {
      isInTocSection = true;
    } else if (isInTocSection && (lineType === 'body' || lineType === 'heading' || lineType === 'subheading')) {
      isInTocSection = false;
    }

    if (lineType !== 'body') {
      // Flush any accumulated body paragraph
      if (currentParagraph.trim()) {
        blocks.push({ type: 'body', content: currentParagraph.trim() });
        currentParagraph = "";
      }
      // Pass structural lines through exactly (preserve original line)
      blocks.push({ type: lineType, content: line });
    } else if (line.trim() === "") {
      // Blank line: flush paragraph
      if (currentParagraph.trim()) {
        blocks.push({ type: 'body', content: currentParagraph.trim() });
        currentParagraph = "";
      }
    } else {
      // Accumulate body text
      // We only merge consecutive body lines that are part of the same paragraph block.
      currentParagraph += (currentParagraph ? " " : "") + line.trim();
    }
  }
  if (currentParagraph.trim()) {
    blocks.push({ type: 'body', content: currentParagraph.trim() });
  }

  console.log(`📄 Ghost v3.3: AST Parser — ${blocks.filter(b => b.type === 'body').length} body, ${blocks.filter(b => b.type === 'heading' || b.type === 'subheading').length} headers, ${blocks.filter(b => b.type === 'toc').length} toc, ${blocks.filter(b => b.type === 'list_item').length} lists`);

  // Map 0-1.0 chaosLevel to strength if provided
  let strength: StrengthMode = "balanced";
  if (options.chaosLevel !== undefined) {
    if (options.chaosLevel < 0.4) strength = "conservative";
    else if (options.chaosLevel > 0.7) strength = "strong";
    else strength = "balanced";
  } else {
    strength = resolveStrength(options);
  }

  const useConsortium = options.useConsortium !== false;
  const humanErrorThreshold = options.humanErrorThreshold ?? 0;
  const errorFactor = dnaProfile?.errorFingerprint?.error_factor ?? 0.8;
  const userDnaSeed = dnaProfile ? JSON.stringify(dnaProfile).slice(0, 80) : "default_dna";

  const errorConfig: HumanErrorConfig = {
    chaosThreshold: humanErrorThreshold,
    errorFactor: errorFactor,
    isAcademic: isAcademic,
    dnaSeed: userDnaSeed,
    assignmentMode: isAssignmentMode,
    persona: activePersonaID,
  };

  // ─── Extreme Mode Multiplier (v3.3) ──────────────────────────────────
  const extremeMultiplier = humanErrorThreshold < 40 ? 1.0
    : humanErrorThreshold < 60 ? 1.3
    : humanErrorThreshold < 80 ? 1.6
    : 2.0;

  console.log(`🧬 Ghost v3.3: Pipeline [Blocks: ${blocks.length}] [ExtremeMultiplier: ${extremeMultiplier}x]...`);

  let finalPipelineOutputArray: string[] = [];
  let finalLlmOutputArray: string[] = [];
  let bodyParagraphIndex = 0;

  try {
    for (const block of blocks) {
      // PARTIAL PASS THROUGH & STRUCTURAL MUTATION
      if (block.type !== 'body') {
        // 1. Structural Markdown Purge
        let cleanContent = block.content.replace(/^#+\s*/, '').replace(/[*_~`]/g, '').trim();

        // 2. Exact fact preservation for References (no typos allowed)
        if (block.type === 'reference') {
           finalPipelineOutputArray.push(cleanContent);
           finalLlmOutputArray.push(cleanContent);
           continue;
        }

        // 3. Deterministic Sync-Mutation for TOC, Headings, and Lists
        if (humanErrorThreshold > 0 && cleanContent.length > 2) {
            const blockSeedHash = simpleStableHash(cleanContent.toLowerCase());
            const structuralErrorConfig = {
               ...errorConfig,
               // Seed depends strictly on the string itself, guaranteeing TOC matches Headers
               dnaSeed: userDnaSeed + "_" + blockSeedHash, 
               extremeMultiplier: 1.0, // Keep structural headers relatively stable, don't over-mutate
               persona: activePersonaID
            };
            const errorResult = applyHumanErrors(cleanContent, structuralErrorConfig);
            
            // POST-CHECK VALIDATOR: Auto-Repair
            // If the error mutation somehow destroyed the entire text or reduced it significantly, fallback to the original structure
            if (errorResult.text && errorResult.text.length > (cleanContent.length * 0.3)) {
                cleanContent = errorResult.text;
            } else {
                console.warn("Ghost Post-Check: Structural corruption detected. Auto-repairing back to original.");
                // Fallback to original cleanContent
            }
        }

        // Both Pipeline and LLM arrays use the exact identically-mutated header
        finalPipelineOutputArray.push(cleanContent);
        finalLlmOutputArray.push(cleanContent);
        continue;
      }

      // Process Paragraph
      const paragraphText = block.content;
      const pIdx = bodyParagraphIndex++;
      
      // Phase I: Rule-Based Fact Segmentation
      const factAtoms = paragraphText.split(/[.!?;]+/g)
          .map(s => s.trim())
          .filter(s => s.length > 3)
          .filter(isUsableAtom);

      if (factAtoms.length === 0) {
        finalPipelineOutputArray.push(paragraphText);
        finalLlmOutputArray.push(paragraphText);
        continue;
      }

      // Phase II/III: Consortium Retrieval & Assembly
      let humanHulls: any[] = [];
      if (env.CONSORTIUM_DB && useConsortium) {
        try {
          const query = await env.AI.run("@cf/baai/bge-small-en-v1.5", {
            text: [factAtoms[0].slice(0, 500)]
          });
          const vector = query.data[0];
          if (vector) {
            const searchRes = await env.CONSORTIUM_DB.query(vector, { 
              topK: 25, 
              returnMetadata: true,
              filter: isAcademic ? { formality: { $gt: 0.8 } } : {}
            });
            humanHulls = searchRes.matches.map((m: any) => m.metadata);
          }
        } catch (cErr) { console.error("Consortium Search Error:", cErr); }
      }

      let assembly = "";
      const connectors = isAcademic 
          ? ["furthermore", "consequently", "specifically", "notably", "essentially"]
          : ["overall", "in practice", "for example", "in this context", "to some extent"];
      const casualLeadPool = [
        "in practice",
        "overall",
        "for example",
        "in this context",
        "to some extent",
        "in general",
        "in many cases",
        "at the same time",
        "at this point",
        "in that setting",
        "for this case",
        "in real terms",
        "on that note",
        "to keep it practical",
      ];
      let lastConnector = "";
      let lastRhythm = "";
      const leadUsage: Record<string, number> = {};
      const leadBudget = Math.max(1, Math.floor(factAtoms.length / 6));
      let leadCount = 0;
      const recentAssignmentConnectors: string[] = [];

      factAtoms.forEach((atom, idx) => {
          if (/^(and|but|or|so|yet)$/i.test(atom)) return;
          const hullMetadata = humanHulls[idx % (humanHulls.length || 1)];
          const hullText = hullMetadata?.text || "i was just thinking about it.";
          let connector = connectors[(idx * 3 + 1) % connectors.length];
          if (connector === lastConnector) connector = connectors[(idx * 5 + 2) % connectors.length];
          
          let targetContent = atom.trim();
          targetContent = FidelityEngine.aiClichePurge(targetContent);
          if (!targetContent) return; // Skip if it was purely an AI filler phrase
          
          // ─── Phase II: Fragmenting (Assignment Mode Demolition) ─────────
          if (isAssignmentMode && targetContent.split(/\s+/).length > 20) {
            // Attempt a fracture at middle commas or conjunctions
            const fractureRegex = /(.{30,80}), (which|that|because|since|and) (.{30,})/i;
            const fractured = targetContent.replace(fractureRegex, (m, part1, conj, part2) => {
              return `${part1}. This ${conj} ${part2}`;
            });
            if (fractured !== targetContent) {
               targetContent = fractured;
               console.log("🪓 Structural Demolition: Fragmented long AI sentence.");
            }
          }

          // Assignment Mode Override (V7.0 Stealth)
          if (isAssignmentMode) {
              const capContent = targetContent.charAt(0).toUpperCase() + targetContent.slice(1);
              // V7.0 Stealth: Lower Connection Density (30% instead of 70%)
              // High connection density looks like a robot trying to be human.
              const shouldConnect = (seededRandom(simpleStableHash(targetContent + pIdx)) < 0.30);
              let chosenConnector = "";
              
              if (shouldConnect) {
                  for (const conn of connectors) {
                      if (!recentAssignmentConnectors.includes(conn)) {
                          chosenConnector = conn;
                          break;
                      }
                  }
                  if (!chosenConnector) chosenConnector = connectors[0];
              }

              if (chosenConnector) {
                  assembly += `${chosenConnector.charAt(0).toUpperCase() + chosenConnector.slice(1)}, ${lowerInitialForEmbeddedClause(targetContent)}. `;
                  recentAssignmentConnectors.push(chosenConnector);
                  if (recentAssignmentConnectors.length > 5) recentAssignmentConnectors.shift();
              } else {
                  // V7.0: Randomly join sentences using 'and' or ';' to increase burstiness
                  const jitterSeed = seededRandom(simpleStableHash(targetContent + "jitter"));
                  if (jitterSeed < 0.15 && assembly.endsWith(". ")) {
                     assembly = assembly.slice(0, -2) + ` ${jitterSeed < 0.08 ? 'and' : ';'} ${lowerInitialForEmbeddedClause(targetContent)}. `;
                  } else {
                     assembly += `${capContent}. `;
                  }
              }
              return;
          }

          let hullRhythm = isAcademic
            ? pickHullRhythm(hullText)
            : pickLeadByUsage(casualLeadPool, leadUsage, simpleStableHash(`${paragraphText}:${idx}`));
          if (hullRhythm === lastRhythm) {
            hullRhythm = pickLeadByUsage(casualLeadPool, leadUsage, simpleStableHash(`${paragraphText}:retry:${idx}`));
          }
          
          if (isAcademic) {
              if ((idx % 4 === 0) && (seededRandom(simpleStableHash(`${paragraphText}:acad:${idx}`)) < 0.15)) {
                   assembly += `${targetContent.charAt(0).toUpperCase() + targetContent.slice(1)}. `;
              } else {
                   assembly += `${hullRhythm}, ${lowerInitialForEmbeddedClause(targetContent)}. `;
              }
          } else {
              const shouldLeadWithFiller = (idx % 6 === 0) && (leadUsage[hullRhythm] || 0) < 1 && leadCount < leadBudget;
              const shouldUseConnector = !shouldLeadWithFiller && idx % 5 === 1;
              if (shouldLeadWithFiller) {
                assembly += `${hullRhythm}, ${lowerInitialForEmbeddedClause(targetContent)}. `;
                leadUsage[hullRhythm] = (leadUsage[hullRhythm] || 0) + 1;
                leadCount += 1;
              } else if (shouldUseConnector) {
                assembly += `${connector}, ${lowerInitialForEmbeddedClause(targetContent)}. `;
              } else {
                assembly += `${targetContent}. `;
              }
          }
          lastConnector = connector; lastRhythm = hullRhythm;
      });

      let outputParagraph = assembly.trim();
      const fidelitySeed = simpleStableHash(`${userDnaSeed}:fidelity:${outputParagraph.slice(0, 40)}`);
      outputParagraph = FidelityEngine.alignPhrasing(outputParagraph, isAcademic, fidelitySeed);
      if (isAcademic) {
          outputParagraph = FidelityEngine.purgeSlang(outputParagraph);
          outputParagraph = outputParagraph.replace(/\bi\b/g, 'I');
      } else {
          outputParagraph = normalizeSentenceCase(outputParagraph);
      }

      // ─── Quality Gate (v3.3: Bypassed in V6.5 Assignment Mode) ──────
      const qualityCheck: any = isAssignmentMode 
        ? { score: 100, reasons: [], metrics: {} } 
        : evaluateHumanQuality(outputParagraph, paragraphText);
      if (!isAssignmentMode && shouldRegenerateByQuality(qualityCheck)) {
        // One retry with shifted seed
        const retryAssembly = outputParagraph; // save current
        let retryOutput = applyStructuralChaos(outputParagraph, userDnaSeed + '_quality_retry', isAcademic);
        retryOutput = applyHumanizerQualityPolicy(retryOutput);
        if (useBladerHumanizer) retryOutput = applyBladerHumanizerPolicy(retryOutput);
        const retryQuality = evaluateHumanQuality(retryOutput, paragraphText);
        if (retryQuality.score > qualityCheck.score) {
          outputParagraph = retryOutput;
          console.log(`🔄 Quality Gate: Retry improved score ${qualityCheck.score} → ${retryQuality.score}`);
        }
      }

      // Phase IV: Chaos Entropy Validator Loop
      let finalParagraphOutput = outputParagraph;
      let passCount = 0;
      let entropySufficient = false;
      let userHash = userDnaSeed;
      if (!isAssignmentMode) {
        while (passCount < 2 && !entropySufficient) {
            passCount++;
            finalParagraphOutput = applyStructuralChaos(finalParagraphOutput, userHash + passCount.toString(), isAcademic);
            const wc = (finalParagraphOutput.match(/\b\w+\b/g) || []).length;
            const uniqueWords = new Set(finalParagraphOutput.toLowerCase().match(/\b\w+\b/g) || []).size;
            const uniqueRatio = wc > 0 ? (uniqueWords / wc) : 0;
            if (uniqueRatio > 0.42) entropySufficient = true;
        }
      }
      outputParagraph = finalParagraphOutput;
      
      // V6.5: Skip Refinement in Assignment Mode to preserve Human Chaos
      if (!isAssignmentMode) {
        outputParagraph = applyHumanizerQualityPolicy(outputParagraph);
        if (useBladerHumanizer) outputParagraph = applyBladerHumanizerPolicy(outputParagraph);
        outputParagraph = applyStructureRefinement(outputParagraph, strength);
        outputParagraph = dedupeAndRepairFlow(outputParagraph);
        outputParagraph = normalizeTypographyArtifacts(outputParagraph);
      } else {
        // ASSIGNMENT MODE: Narrative Pass (Sovereign V13)
        // We SKIP aiClichePurge because humans USE cliches and it makes it authentic.
        outputParagraph = applyHumanNarrativePass(outputParagraph, simpleStableHash(userDnaSeed + pIdx));
        // V9.0: Inject Nuclear Spacing Jitter
        outputParagraph = applyNuclearSpacingJitter(outputParagraph, simpleStableHash(userDnaSeed + pIdx));
      }

      // Human Error Injection Stage 1 (v3.3: with extreme multiplier)
      if (humanErrorThreshold > 0) {
        // 🎭 Ghost V6.0: Shadow Entropy Jitter
        let shadowEntropyJitter = 1.0;
        if (isAssignmentMode) {
          const modValue = pIdx % 4;
          if (modValue === 0) shadowEntropyJitter = 1.25; // Boosted entropy
          else if (modValue === 1) shadowEntropyJitter = 0.65; // High-perplexity "Focused" stretch
          else if (modValue === 2) shadowEntropyJitter = 1.10; // Medium-high entropy
          else shadowEntropyJitter = 0.85; // Natural variance
        }

        const extremeConfig: HumanErrorConfig = {
          ...errorConfig,
          dnaSeed: `${userDnaSeed}_v6_${pIdx}`, // Salt per paragraph
          extremeMultiplier: extremeMultiplier * shadowEntropyJitter,
          persona: activePersonaID
        };
        const errorResult = applyHumanErrors(outputParagraph, extremeConfig);
        outputParagraph = errorResult.text;
        console.log(`⚡ Error Stage 1: ${errorResult.mutations.length} mutations injected [×${extremeMultiplier}]`);
      }

      finalPipelineOutputArray.push(outputParagraph);

      // Stage LLM (v3.3: Bypass in Assignment Mode to prevent 'Re-AI-ification')
      if (env.AI && !isAssignmentMode) {
        let llmPara = outputParagraph;
        try {
          const sysPrompt = humanErrorThreshold > 0 ? PRESERVE_ERRORS_SYSTEM_PROMPT(isAcademic) : `You are a GOD-MODE sentence restructuring engine. TOTAL STRUCTURAL INVERSION.`;
          const response = await env.AI.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
            messages: [{ role: "system", content: sysPrompt }, { role: "user", content: llmPara }],
            temperature: 1.0, max_tokens: 2000
          });
          if (response?.response) {
            const cleaned = cleanLlmOutput(response.response);
            if (cleaned.length > llmPara.length * 0.6) llmPara = cleaned;
          }
        } catch (e) { console.error("Para LLM Error:", e); }
        
        // Stage 3: Safety net (v3.3: expanded — only runs if LLM was used)
        if (humanErrorThreshold > 0) {
          const safetyConfig: HumanErrorConfig = {
            ...errorConfig,
            extremeMultiplier: extremeMultiplier,
          };
          const reInjectResult = lightReInjectErrors(llmPara, safetyConfig);
          llmPara = reInjectResult.text;
          console.log(`🛡️ Safety Net: ${reInjectResult.mutations.length} re-injected`);
        }
        llmPara = normalizeTypographyArtifacts(llmPara);
        if (useBladerHumanizer) llmPara = applyBladerHumanizerPolicy(llmPara);
        finalLlmOutputArray.push(llmPara);
      } else {
        // If Skip LLM (Assignment Mode) or No AI, use the already humanized outputParagraph
        finalLlmOutputArray.push(outputParagraph);
      }
    }

    const assemble = (arr: string[], blocksRef: any[]) => {
      let result = "";
      for (let i = 0; i < arr.length; i++) {
        const textStr = arr[i];
        const bType = blocksRef[i].type;
        
        result += textStr;
        // Academic document formatting: Headings need clear separation
        if (isAssignmentMode && (bType === 'heading' || bType === 'subheading')) {
          result += "\n\n"; 
        } else {
          result += "\n\n";
        }
      }
      return result.trim();
    };

    // FINAL OUTPUT ISOLATION: 
    // If Assignment Mode is active, we strip the LLM option entirely or return the pure result twice to avoid detector flags.
    const finalPipeline = assemble(finalPipelineOutputArray, blocks);
    const finalHybrid = isAssignmentMode ? null : (env.AI ? assemble(finalLlmOutputArray, blocks) : null);

    console.log(`✅ Ghost Pipeline Finalized: [Pure: ${finalPipeline.length} chars] [Hybrid: ${finalHybrid?.length ?? 0} chars]`);

    return {
      pipelineOutput: finalPipeline,
      llmOutput: finalHybrid
    };

  } catch (err) {
    console.error("Ghost v3.3 Critical Error:", err);
    return { pipelineOutput: aiText, llmOutput: null };
  }
}

/**
 * V13: Human Narrative Pass
 * Converts robotic AI-typical academic structures into conversational human narration.
 */
function applyHumanNarrativePass(text: string, seed: number): string {
  let output = text;
  let s = seed;

  const narrativeSwaps = [
    { regex: /\bFurthermore\b/gi, swaps: ["Also, I should say,", "Plus,", "And another thing is,"] },
    { regex: /\bConsequently\b/gi, swaps: ["So basically,", "As a result,", "Therefore, actually,"] },
    { regex: /\bMoreover\b/gi, swaps: ["Also,", "In fact,", "Wait, also,"] },
    { regex: /\bIn conclusion\b/gi, swaps: ["Finally,", "To wrap it up,", "To be honest, finally,"] },
    { regex: /\bIt is evident that\b/gi, swaps: ["Clearly, we see that", "Obviously, I'd say", "Actually, it is clear that"] },
    { regex: /\bRegarding\b/gi, swaps: ["About", "Speaking of", "Talking about"] },
    { regex: /\butilized\b/gi, swaps: ["used", "took"] },
    { regex: /\bdemonstrates\b/gi, swaps: ["shows", "proves it"] }
  ];

  narrativeSwaps.forEach((swap, idx) => {
    output = output.replace(swap.regex, () => {
      const options = swap.swaps;
      return options[Math.floor(seededRandom(s + idx) * options.length)];
    });
  });

  // Inject random fillers at the start of some sentences
  const sentences = output.split(/(?<=[.!?])\s+/);
  const fillers = ["Actually, ", "Basically, ", "I mean, ", "In real terms, ", "To be honest, "];
  const processed = sentences.map((sent, idx) => {
    if (idx > 0 && seededRandom(s + idx) < 0.2) {
      return fillers[Math.floor(seededRandom(s + idx + 1) * fillers.length)] + sent.charAt(0).toLowerCase() + sent.slice(1);
    }
    return sent;
  });

  return processed.join(' ');
}
