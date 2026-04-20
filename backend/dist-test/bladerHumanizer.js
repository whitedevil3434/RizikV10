"use strict";
// Blader Humanizer Policy (Rizik integration)
// Source inspiration: https://github.com/blader/humanizer (MIT) + Wikipedia "Signs of AI writing".
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyBladerHumanizerPolicy = applyBladerHumanizerPolicy;
function detectCaseStyle(word) {
    if (!word)
        return "lower";
    if (word.toUpperCase() === word && /[A-Z]/.test(word))
        return "upper";
    const first = word[0] || "";
    const rest = word.slice(1);
    if (first.toUpperCase() === first && rest.toLowerCase() === rest && /[A-Za-z]/.test(first)) {
        return "capitalized";
    }
    if (word.toLowerCase() === word)
        return "lower";
    return "mixed";
}
function applyCaseStyle(template, replacement) {
    const style = detectCaseStyle(template);
    if (style === "upper")
        return replacement.toUpperCase();
    if (style === "capitalized")
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    if (style === "lower")
        return replacement.toLowerCase();
    return replacement;
}
function replacePhrase(text, phrase, replacement) {
    const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "gi");
    return text.replace(re, (m) => applyCaseStyle(m, replacement));
}
function stripCommonChatbotArtifacts(text) {
    // Remove standalone "chatbot" lines and preambles (keep content).
    const lines = String(text || "")
        .split(/\r?\n/)
        .map((l) => l.trimEnd());
    const bannedLine = /^(great question|glad you asked|i hope this helps|let me know if|feel free to ask|here(?:'| i)s (?:what|the)|sure[,!.\s]|certainly[,!.\s]|of course[,!.\s])/i;
    const cleaned = [];
    for (const line of lines) {
        if (!line.trim()) {
            cleaned.push("");
            continue;
        }
        if (bannedLine.test(line.trim()))
            continue;
        cleaned.push(line);
    }
    let out = cleaned.join("\n");
    // Remove trailing/inline artifacts when they appear as standalone sentences.
    out = out
        .replace(/\b(i hope this helps|hope this helps)\b[.!?]*\s*/gi, "")
        .replace(/\b(let me know if|feel free to ask)\b[^.!?\n]{0,80}[.!?]*\s*/gi, "");
    return out.trim();
}
function stripSignposting(text) {
    let out = String(text || "");
    // Start-of-paragraph signposting.
    out = out.replace(/(^|\n\s*\n)\s*(let['’]s dive in|here['’]s what you need to know|below (?:is|are)|in this (?:section|article)|to summarize|in summary|in conclusion)\s*[:.\-—]*\s*/gi, "$1");
    // End-of-text generic conclusions.
    out = out.replace(/\n?\s*(in conclusion|in summary|to sum up)[\s\S]*$/i, (m) => {
        // Only strip if it looks like a generic boilerplate (short and vague).
        const compact = m.replace(/\s+/g, " ").trim();
        if (compact.length <= 120)
            return "";
        return m;
    });
    return out;
}
function simplifyFillerPhrases(text) {
    let out = String(text || "");
    const replacements = [
        [/\bin order to\b/gi, "to"],
        [/\bdue to the fact that\b/gi, "because"],
        [/\bat this point in time\b/gi, "now"],
        [/\bit is important to note that\b/gi, ""],
        [/\bneedless to say\b/gi, ""],
        [/\bthe fact that\b/gi, "that"],
    ];
    for (const [re, rep] of replacements)
        out = out.replace(re, rep);
    return out;
}
function simplifyCopulaAvoidance(text) {
    let out = String(text || "");
    out = out.replace(/\b(serves as|stands as)\b/gi, (m) => applyCaseStyle(m, "is"));
    out = out.replace(/\b(boasts|features|offers)\b/gi, (m) => applyCaseStyle(m, "has"));
    return out;
}
function reduceEmDashes(text) {
    let out = String(text || "");
    // Normalize spaced em-dashes to commas.
    out = out.replace(/\s*[—–]\s*/g, ", ");
    // Normalize double-hyphen used as dash.
    out = out.replace(/\s*--\s*/g, ", ");
    return out;
}
function replaceAIVocabulary(text) {
    let out = String(text || "");
    // Multi-word phrases first.
    out = replacePhrase(out, "at its core", "basically");
    out = replacePhrase(out, "in today’s rapidly evolving", "in today’s");
    out = replacePhrase(out, "in today's rapidly evolving", "in today's");
    // Single-word replacements (conservative; avoid semantic drift).
    const wordMap = {
        additionally: "also",
        moreover: "also",
        furthermore: "also",
        crucial: "important",
        pivotal: "important",
        underscore: "show",
        showcasing: "showing",
        enhance: "improve",
        enhancing: "improving",
        fostering: "building",
        garner: "get",
        delve: "look",
        landscape: "area",
        testament: "sign",
        vibrant: "lively",
        intricate: "complex",
    };
    for (const [token, replacement] of Object.entries(wordMap)) {
        const re = new RegExp(`\\b${token}\\b`, "gi");
        out = out.replace(re, (m) => applyCaseStyle(m, replacement));
    }
    return out;
}
function normalizeWhitespaceAndPunctuation(text) {
    return String(text || "")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\s+([,.;:!?])/g, "$1")
        .replace(/,\s*,/g, ", ")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
function applyBladerHumanizerPolicy(text) {
    let out = String(text || "");
    out = stripCommonChatbotArtifacts(out);
    out = stripSignposting(out);
    out = simplifyFillerPhrases(out);
    out = simplifyCopulaAvoidance(out);
    out = replaceAIVocabulary(out);
    out = reduceEmDashes(out);
    out = normalizeWhitespaceAndPunctuation(out);
    return out;
}
