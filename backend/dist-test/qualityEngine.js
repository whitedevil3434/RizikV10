"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateHumanQuality = evaluateHumanQuality;
exports.shouldRegenerateByQuality = shouldRegenerateByQuality;
const STOPWORDS = new Set([
    "the", "a", "an", "to", "of", "in", "on", "for", "and", "or", "but", "with",
    "by", "is", "are", "was", "were", "be", "been", "this", "that", "it", "as",
    "at", "from", "into", "about", "than", "then", "so", "if", "while", "when",
]);
function words(text) {
    return (text.toLowerCase().match(/[a-z']+/g) || []).filter(Boolean);
}
function sentences(text) {
    return (text || "")
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function distinctContentTokens(tokens) {
    return new Set(tokens.filter((t) => t.length > 2 && !STOPWORDS.has(t)));
}
function repeatedNgramRatio(tokens) {
    if (tokens.length < 8)
        return 0;
    const seen = new Map();
    let repeated = 0;
    let total = 0;
    for (let i = 0; i < tokens.length - 2; i += 1) {
        const key = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
        total += 1;
        const next = (seen.get(key) || 0) + 1;
        seen.set(key, next);
        if (next > 1)
            repeated += 1;
    }
    return total ? repeated / total : 0;
}
function evaluateHumanQuality(output, sourceText = "") {
    const out = (output || "").trim();
    const src = (sourceText || "").trim();
    const outWords = words(out);
    const outSentences = sentences(out);
    const wordCount = outWords.length;
    const sentenceCount = outSentences.length || 1;
    const lexicalDiversity = wordCount ? distinctContentTokens(outWords).size / wordCount : 0;
    const avgSentenceWords = wordCount / sentenceCount;
    const normalizedSentences = outSentences.map((s) => s.toLowerCase().replace(/\s+/g, " ").trim());
    const sentenceSet = new Set();
    let repeatedSentenceCount = 0;
    for (const sentence of normalizedSentences) {
        if (sentenceSet.has(sentence))
            repeatedSentenceCount += 1;
        sentenceSet.add(sentence);
    }
    const repeatedSentenceRatio = sentenceCount ? repeatedSentenceCount / sentenceCount : 0;
    const repeatedNgrams = repeatedNgramRatio(outWords);
    let sourceCoverage = 1;
    if (src) {
        const srcTokens = distinctContentTokens(words(src));
        const outTokens = distinctContentTokens(outWords);
        if (srcTokens.size > 0) {
            let overlap = 0;
            for (const token of srcTokens) {
                if (outTokens.has(token))
                    overlap += 1;
            }
            sourceCoverage = overlap / srcTokens.size;
        }
    }
    let score = 100;
    const reasons = [];
    if (wordCount < 40) {
        score -= 15;
        reasons.push("too-short");
    }
    if (lexicalDiversity < 0.22) {
        score -= 15;
        reasons.push("low-lexical-diversity");
    }
    if (avgSentenceWords < 8 || avgSentenceWords > 34) {
        score -= 10;
        reasons.push("sentence-length-imbalance");
    }
    if (repeatedSentenceRatio > 0.15) {
        score -= 20;
        reasons.push("repeated-sentences");
    }
    if (repeatedNgrams > 0.12) {
        score -= 20;
        reasons.push("high-ngram-repetition");
    }
    if (sourceCoverage < 0.45) {
        score -= 20;
        reasons.push("low-source-coverage");
    }
    return {
        score: clamp(Math.round(score), 0, 100),
        metrics: {
            wordCount,
            sentenceCount,
            lexicalDiversity: Number(lexicalDiversity.toFixed(4)),
            avgSentenceWords: Number(avgSentenceWords.toFixed(2)),
            repeatedSentenceRatio: Number(repeatedSentenceRatio.toFixed(4)),
            repeatedNgramRatio: Number(repeatedNgrams.toFixed(4)),
            sourceCoverage: Number(sourceCoverage.toFixed(4)),
        },
        reasons,
    };
}
function shouldRegenerateByQuality(score) {
    return score.score < 78 || score.reasons.includes("repeated-sentences") || score.reasons.includes("high-ngram-repetition");
}
