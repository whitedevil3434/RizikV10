// Godly Chaos Engine: Forensic Transformer v3.0
// Implementation: 100% Non-Generative Structural Hull Resin (SHR).
// NO LLM CALLS: Rule-based mapping from Human Consortium.
import { FidelityEngine } from './fidelityEngine';
import { applyStructuralChaos } from './chaosEngine';
import { applyHumanErrors, lightReInjectErrors, PRESERVE_ERRORS_SYSTEM_PROMPT } from './humanErrorEngine';
const NOISE_PATTERNS = [
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
function stripNoise(text) {
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
function pickHullRhythm(hullText) {
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
    },
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
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function countWords(text) {
    return (text.match(/\b[A-Za-z']+\b/g) || []).length;
}
export function calculateMaxAllowedFillers(wordCount) {
    if (wordCount >= 100) {
        return Math.max(2, Math.ceil((wordCount / 100) * 3));
    }
    return Math.max(0, Math.ceil((wordCount / 100) * 2));
}
function replaceForbiddenShortForms(text) {
    let next = text;
    for (const [token, replacement] of Object.entries(fillerPolicy.forbiddenReplacements)) {
        const regex = new RegExp(`\\b${escapeRegExp(token)}\\b`, "gi");
        next = next.replace(regex, replacement);
    }
    return next.replace(/\s{2,}/g, " ").trim();
}
function extractLeadFiller(sentence) {
    const trimmed = sentence.trim().toLowerCase();
    for (const filler of allLeadFillers) {
        const regex = new RegExp(`^${escapeRegExp(filler)}\\b(?:,\\s*|\\s+)`, "i");
        if (regex.test(trimmed))
            return filler;
    }
    return null;
}
function removeLeadFiller(sentence, filler) {
    const regex = new RegExp(`^\\s*${escapeRegExp(filler)}\\b(?:,\\s*|\\s+)`, "i");
    return sentence.replace(regex, "").trim();
}
export function getQualityMetrics(text) {
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
        if (lead && lead === lastLead)
            repeatedLeadCount += 1;
        if (lead)
            lastLead = lead;
    }
    return { wordCount, fillerCount, forbiddenCount, repeatedLeadCount };
}
export function applyHumanizerQualityPolicy(text) {
    let output = replaceForbiddenShortForms(stripNoise(text || ""));
    const maxFillers = calculateMaxAllowedFillers(countWords(output));
    const usage = {};
    let keptFillers = 0;
    let lastKept = "";
    const sentences = output
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
    const cleanedSentences = sentences.map((sentence) => {
        let next = replaceForbiddenShortForms(sentence);
        const lead = extractLeadFiller(next);
        if (!lead)
            return next;
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
        if (!lead)
            return sentence;
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
function isUsableAtom(atom) {
    const cleaned = atom.toLowerCase().replace(/[^a-z\s']/g, " ").trim();
    if (!cleaned)
        return false;
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length < 3)
        return false;
    const stopwords = new Set(["the", "a", "an", "to", "of", "in", "on", "for", "and", "or", "but", "with", "by"]);
    const contentWords = words.filter((w) => !stopwords.has(w));
    return contentWords.length >= 2;
}
function normalizeSentenceCase(text) {
    return (text || "")
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([,.;:!?])/g, "$1")
        .replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => `${p1}${p2.toUpperCase()}`)
        .trim();
}
function normalizeTypographyArtifacts(text) {
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
function lowerInitialForEmbeddedClause(text) {
    const trimmed = (text || "").trim();
    if (!trimmed)
        return trimmed;
    if (/^[A-Z][a-z]/.test(trimmed)) {
        return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
    }
    return trimmed;
}
function stripLeadDiscourse(sentence) {
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
function dedupeAndRepairFlow(text) {
    const lines = (text || "")
        .split(/(?<=[.!?])\s+/)
        .map((s) => normalizeSentenceCase(s))
        .map((s) => s.trim())
        .filter(Boolean);
    const seen = new Set();
    const out = [];
    let lastCore = "";
    for (const sentence of lines) {
        const normalized = sentence.toLowerCase().replace(/\s+/g, " ").trim();
        if (seen.has(normalized))
            continue;
        seen.add(normalized);
        const core = stripLeadDiscourse(sentence).toLowerCase();
        if (core && core === lastCore)
            continue;
        lastCore = core;
        out.push(sentence);
    }
    return out.join(" ").replace(/\s{2,}/g, " ").trim();
}
function pickLeadByUsage(pool, usage, seed) {
    const ordered = [...pool].sort((a, b) => {
        const ua = usage[a] || 0;
        const ub = usage[b] || 0;
        if (ua !== ub)
            return ua - ub;
        const ah = simpleStableHash(`${a}:${seed}`);
        const bh = simpleStableHash(`${b}:${seed}`);
        return ah - bh;
    });
    return ordered[0];
}
function simpleStableHash(input) {
    let h = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h >>> 0);
}
function sentenceWordCount(text) {
    return (text.match(/\b[A-Za-z']+\b/g) || []).length;
}
function ensureTerminalPunctuation(sentence) {
    const trimmed = sentence.trim();
    if (!trimmed)
        return trimmed;
    if (/[.!?]$/.test(trimmed))
        return trimmed;
    return `${trimmed}.`;
}
function splitLongSentence(sentence, maxWords) {
    const normalized = sentence.trim();
    if (sentenceWordCount(normalized) <= maxWords)
        return [normalized];
    const separators = [", ", "; ", " - ", " — "];
    let best = null;
    for (const sep of separators) {
        let from = 0;
        while (from < normalized.length) {
            const index = normalized.indexOf(sep, from);
            if (index < 0)
                break;
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
export function applyStructureRefinement(text, mode) {
    if (!text.trim())
        return text;
    const rawSentences = text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
    const maxWords = mode === "strong" ? 22 : mode === "balanced" ? 28 : 34;
    const splitSentences = rawSentences.flatMap((s) => splitLongSentence(s, maxWords));
    const merged = [];
    const shortLimit = mode === "strong" ? 9 : 7;
    for (let i = 0; i < splitSentences.length; i += 1) {
        const current = splitSentences[i];
        const next = splitSentences[i + 1];
        if (next &&
            sentenceWordCount(current) <= shortLimit &&
            sentenceWordCount(next) <= shortLimit &&
            !/[!?]$/.test(current) &&
            !/[!?]$/.test(next)) {
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
 * Strips markdown, preamble, and explanations from LLM output.
 * Models often add "Here is the edited text:" or markdown formatting despite instructions.
 */
function cleanLlmOutput(raw) {
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
        .replace(/^#+\s+.+\n*/gm, "") // headers
        .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
        .replace(/\*([^*]+)\*/g, "$1") // italic
        .replace(/```[\s\S]*?```/g, "") // code blocks
        .replace(/`([^`]+)`/g, "$1"); // inline code
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
function resolveStrength(options) {
    const raw = String(options.strength || "balanced").toLowerCase().trim();
    if (raw === "conservative" || raw === "strong")
        return raw;
    return "balanced";
}
function isHeader(text) {
    const trimmed = text.trim();
    if (trimmed.length === 0)
        return false;
    // Common header patterns: "Introduction", "Point 1:", "1. Analysis", etc.
    // Usually short, no ending punctuation except colon, or specific keywords.
    const words = trimmed.split(/\s+/);
    if (words.length > 8)
        return false; // Headers are usually short
    const headerKeywords = /^(introduction|conclusion|summary|background|abstract|discussion|analysis|results|recommendations|methodology)$/i;
    if (headerKeywords.test(trimmed.replace(/[:.]/g, "")))
        return true;
    const pointPattern = /^(\d+|[a-z]|[A-Z])[\.)]\s+.+/i; // 1. or A. etc
    if (pointPattern.test(trimmed))
        return true;
    const colonHeader = /^[A-Z][^:]+:$/; // Title: style
    if (colonHeader.test(trimmed))
        return true;
    // If it's short and uppercase or bold-ish (all caps)
    if (trimmed.length < 50 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed))
        return true;
    return false;
}
export async function transformText(aiText, dnaProfile, env, options = {}) {
    if (!aiText || !dnaProfile)
        return { pipelineOutput: aiText, llmOutput: null };
    const isAcademic = options.academic || false;
    // Split into structural blocks (paragraphs and headers)
    const lines = aiText.split(/\r?\n/);
    const blocks = [];
    let currentParagraph = "";
    for (const line of lines) {
        if (isHeader(line)) {
            if (currentParagraph.trim()) {
                blocks.push({ type: 'paragraph', content: currentParagraph.trim() });
                currentParagraph = "";
            }
            blocks.push({ type: 'header', content: line.trim() });
        }
        else if (line.trim() === "") {
            if (currentParagraph.trim()) {
                blocks.push({ type: 'paragraph', content: currentParagraph.trim() });
                currentParagraph = "";
            }
        }
        else {
            currentParagraph += (currentParagraph ? " " : "") + line.trim();
        }
    }
    if (currentParagraph.trim()) {
        blocks.push({ type: 'paragraph', content: currentParagraph.trim() });
    }
    // Map 0-1.0 chaosLevel to strength if provided
    let strength = "balanced";
    if (options.chaosLevel !== undefined) {
        if (options.chaosLevel < 0.4)
            strength = "conservative";
        else if (options.chaosLevel > 0.7)
            strength = "strong";
        else
            strength = "balanced";
    }
    else {
        strength = resolveStrength(options);
    }
    const useConsortium = options.useConsortium !== false;
    const humanErrorThreshold = options.humanErrorThreshold ?? 0;
    const errorFactor = dnaProfile?.errorFingerprint?.error_factor ?? 0.8;
    const userDnaSeed = dnaProfile ? JSON.stringify(dnaProfile).slice(0, 80) : "default_dna";
    const errorConfig = {
        chaosThreshold: humanErrorThreshold,
        errorFactor: errorFactor,
        isAcademic: isAcademic,
        dnaSeed: userDnaSeed,
    };
    console.log(`🧬 Ghost v3.2: Initializing Section-Aware Pipeline [Blocks: ${blocks.length}]...`);
    let finalPipelineOutputArray = [];
    let finalLlmOutputArray = [];
    try {
        for (const block of blocks) {
            if (block.type === 'header') {
                finalPipelineOutputArray.push(block.content);
                finalLlmOutputArray.push(block.content);
                continue;
            }
            // Process Paragraph
            const paragraphText = block.content;
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
            let humanHulls = [];
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
                        humanHulls = searchRes.matches.map((m) => m.metadata);
                    }
                }
                catch (cErr) {
                    console.error("Consortium Search Error:", cErr);
                }
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
            const leadUsage = {};
            const leadBudget = Math.max(1, Math.floor(factAtoms.length / 6));
            let leadCount = 0;
            factAtoms.forEach((atom, idx) => {
                if (/^(and|but|or|so|yet)$/i.test(atom))
                    return;
                const hullMetadata = humanHulls[idx % (humanHulls.length || 1)];
                const hullText = hullMetadata?.text || "i was just thinking about it.";
                let connector = connectors[(idx * 3 + 1) % connectors.length];
                if (connector === lastConnector)
                    connector = connectors[(idx * 5 + 2) % connectors.length];
                let targetContent = atom.trim();
                let hullRhythm = isAcademic
                    ? pickHullRhythm(hullText)
                    : pickLeadByUsage(casualLeadPool, leadUsage, simpleStableHash(`${paragraphText}:${idx}`));
                if (hullRhythm === lastRhythm) {
                    hullRhythm = pickLeadByUsage(casualLeadPool, leadUsage, simpleStableHash(`${paragraphText}:retry:${idx}`));
                }
                if (isAcademic) {
                    if ((idx % 4 === 0) && (Math.random() < 0.15)) {
                        assembly += `${targetContent.charAt(0).toUpperCase() + targetContent.slice(1)}. `;
                    }
                    else {
                        assembly += `${hullRhythm}, ${targetContent}. `;
                    }
                }
                else {
                    const shouldLeadWithFiller = (idx % 6 === 0) && (leadUsage[hullRhythm] || 0) < 1 && leadCount < leadBudget;
                    const shouldUseConnector = !shouldLeadWithFiller && idx % 5 === 1;
                    if (shouldLeadWithFiller) {
                        assembly += `${hullRhythm}, ${lowerInitialForEmbeddedClause(targetContent)}. `;
                        leadUsage[hullRhythm] = (leadUsage[hullRhythm] || 0) + 1;
                        leadCount += 1;
                    }
                    else if (shouldUseConnector) {
                        assembly += `${connector}, ${lowerInitialForEmbeddedClause(targetContent)}. `;
                    }
                    else {
                        assembly += `${targetContent}. `;
                    }
                }
                lastConnector = connector;
                lastRhythm = hullRhythm;
            });
            let outputParagraph = assembly.trim();
            outputParagraph = FidelityEngine.alignPhrasing(outputParagraph, isAcademic);
            if (isAcademic) {
                outputParagraph = FidelityEngine.purgeSlang(outputParagraph);
                outputParagraph = outputParagraph.replace(/\bi\b/g, 'I');
            }
            else {
                outputParagraph = normalizeSentenceCase(outputParagraph);
            }
            // Phase IV: Chaos Entropy Validator Loop
            let finalParagraphOutput = outputParagraph;
            let passCount = 0;
            let entropySufficient = false;
            let userHash = userDnaSeed;
            while (passCount < 2 && !entropySufficient) {
                passCount++;
                finalParagraphOutput = applyStructuralChaos(finalParagraphOutput, userHash + passCount.toString(), isAcademic);
                const wc = (finalParagraphOutput.match(/\b\w+\b/g) || []).length;
                const uniqueWords = new Set(finalParagraphOutput.toLowerCase().match(/\b\w+\b/g) || []).size;
                const uniqueRatio = wc > 0 ? (uniqueWords / wc) : 0;
                if (uniqueRatio > 0.42)
                    entropySufficient = true;
            }
            outputParagraph = finalParagraphOutput;
            outputParagraph = applyHumanizerQualityPolicy(outputParagraph);
            outputParagraph = applyStructureRefinement(outputParagraph, strength);
            outputParagraph = dedupeAndRepairFlow(outputParagraph);
            outputParagraph = normalizeTypographyArtifacts(outputParagraph);
            // Human Error Injection Stage 1
            if (humanErrorThreshold > 0) {
                const errorResult = applyHumanErrors(outputParagraph, errorConfig);
                outputParagraph = errorResult.text;
            }
            finalPipelineOutputArray.push(outputParagraph);
            // Stage LLM
            if (env.AI) {
                let llmPara = outputParagraph;
                try {
                    const sysPrompt = humanErrorThreshold > 0 ? PRESERVE_ERRORS_SYSTEM_PROMPT(isAcademic) : `You are a GOD-MODE sentence restructuring engine. TOTAL STRUCTURAL INVERSION.`;
                    const response = await env.AI.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
                        messages: [{ role: "system", content: sysPrompt }, { role: "user", content: llmPara }],
                        temperature: 1.0, max_tokens: 2000
                    });
                    if (response?.response) {
                        const cleaned = cleanLlmOutput(response.response);
                        if (cleaned.length > llmPara.length * 0.6)
                            llmPara = cleaned;
                    }
                }
                catch (e) {
                    console.error("Para LLM Error:", e);
                }
                // Stage 3: Safety net
                if (humanErrorThreshold > 0) {
                    const reInjectResult = lightReInjectErrors(llmPara, errorConfig);
                    llmPara = reInjectResult.text;
                }
                llmPara = normalizeTypographyArtifacts(llmPara);
                finalLlmOutputArray.push(llmPara);
            }
            else {
                finalLlmOutputArray.push(outputParagraph);
            }
        }
        const assemble = (arr) => arr.join("\n\n").trim();
        return {
            pipelineOutput: assemble(finalPipelineOutputArray),
            llmOutput: env.AI ? assemble(finalLlmOutputArray) : null
        };
    }
    catch (err) {
        console.error("Ghost v3.2 Critical Error:", err);
        return { pipelineOutput: aiText, llmOutput: null };
    }
}
