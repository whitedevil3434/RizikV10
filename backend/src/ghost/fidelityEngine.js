"use strict";
// Godly Chaos Engine: N-gram & Phrase-Level Fidelity Engine v1.1
// Ensures transitions and collocations match real human statistical patterns.
// v1.1: Deterministic with seeded PRNG (no Math.random()).
Object.defineProperty(exports, "__esModule", { value: true });
exports.FidelityEngine = void 0;
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}
class FidelityEngine {
    // Pre-computed common human n-grams (sampled from consortium)
    // In v3.1, these will be loaded from Cloudflare D1
    static HUMAN_3GRAMS = {
        "i think that": ["it appears that", "it seems that", "the evidence suggests"],
        "it is very": ["it is quite", "it remains", "it is notably"],
        "in addition to": ["furthermore", "also", "in addition"],
        "the fact that": ["the way that", "the reality that", "the observation that"],
        "moreover it is": ["moreover, it is", "additionally, it is", "it is also"],
        "however there are": ["however, there are", "yet there are", "nevertheless, there are"],
    };
    static ACADEMIC_3GRAMS = {
        "i think that": ["it appears that", "one might argue", "the evidence suggests"],
        "its like basically": ["effectively", "essentially", "in essence"],
        "tbh it is": ["arguably", "notably", "it is imperative to note"],
        "kinda like": ["similar to", "analogous to", "comparable to"],
    };
    /**
     * Fidelity Filter: Replaces low-frequency/AI-typical n-grams
     * with high-frequency human collocations.
     * Now deterministic with seeded PRNG (v1.1).
     */
    static alignPhrasing(text, isAcademic = false, seed = 42) {
        let aligned = text;
        const lookup = isAcademic ? this.ACADEMIC_3GRAMS : this.HUMAN_3GRAMS;
        let currentSeed = seed;
        for (const [aiPhrase, humanPhrases] of Object.entries(lookup)) {
            const regex = new RegExp(aiPhrase, 'gi');
            if (regex.test(aligned)) {
                currentSeed = simpleHash(currentSeed.toString() + aiPhrase);
                const replacement = humanPhrases[Math.floor(seededRandom(currentSeed) * humanPhrases.length)];
                aligned = aligned.replace(regex, replacement);
            }
        }
        return aligned;
    }
    /**
     * Slang Purge: Enforces zero-slang policy for Academic Mode.
     */
    static purgeSlang(text) {
        const slangBlacklist = {
            "lol": "",
            "tbh": "to be honest",
            "idk": "i do not know",
            "bruh": "",
            "lowkey": "subtly",
            "highkey": "distinctly",
            "kinda": "somewhat",
            "sorta": "rather",
            "gonna": "going to",
            "wana": "want to",
            "u": "you",
            "r": "are",
            "fr": "truly",
            "no cap": "assuredly"
        };
        let purged = text;
        for (const [slang, formal] of Object.entries(slangBlacklist)) {
            const regex = new RegExp(`\\b${slang}\\b`, 'gi');
            purged = purged.replace(regex, formal);
        }
        // Clean up double spaces from empty string replacements
        return purged.replace(/\s\s+/g, ' ').trim();
    }
    /**
     * AI Cliche Purge: Aggressively strips statistical AI transition phrases
     * and highly predictable AI vocabulary to destroy Perplexity scores.
     */
    static aiClichePurge(text) {
        let purged = text;
        // 1. Strip entire leading transition lines that AI loves
        const aiPrefixes = [
            "in the realm of", "embark on a journey", "it is important to note that",
            "it is crucial to understand", "in today's fast-paced world", "in the digital landscape",
            "at its core", "at first glance", "when it comes to", "let's delve into",
            "as we navigate", "in conclusion", "to summarize", "furthermore", "moreover",
            "additionally", "in summary", "overall", "ultimately", "a testament to",
            "those who dare to", "unlock the potential", "weaving together", "across the globe",
            "pave the way", "look no further", "in a nutshell", "the bottom line is", "it is worth noting",
            "diving deep", "step into", "at the end of the day", "take a closer look", "unlock the secrets",
            "one can argue that", "it is evident that", "there is no doubt that", "a closer inspection reveals"
        ];
        for (const prefix of aiPrefixes) {
            // V6.5: Remove '^' to catch cliches anywhere in the string
            const regex = new RegExp(`\\b${prefix}\\b(?:,\\s*|\\s+)?`, 'gi');
            purged = purged.replace(regex, '');
        }
        // 2. Replace high-perplexity AI vocabulary with simpler human equivalents
        const aiVocabularyMap = {
            "tapestry": "mix",
            "delve": "look",
            "nuances": "details",
            "testament": "proof",
            "paramount": "crucial",
            "indispensable": "necessary",
            "multifaceted": "complex",
            "embark": "start",
            "pivotal": "key",
            "underscore": "highlight",
            "comprehensive": "full",
            "arguably": "likely",
            "myriad": "many",
            "intricate": "detailed",
            "leverage": "use",
            "landscape": "field",
            "uncover": "find",
            "abound": "exist",
            "seamlessly": "smoothly",
            "treasure trove": "collection",
            "potential": "possibility",
            "intricacies": "details",
            "weaving": "joining",
            "understanding the": "knowing the",
            "transform": "change",
            "abound for": "exist for",
            "explore beyond": "look past",
            "potential waiting": "possible things waiting",
            "discover a": "see a",
            "potential that": "possibility that",
            "unlock": "show",
            "explore": "look into",
            "journey": "process",
            "property holds": "place has",
            "potential to": "possibility to",
            "think outside the box": "think differently",
            "the surface": "the obvious stuff",
            "intricate nuances": "small details",
            "unlocking": "showing",
            "the intricacies of": "how the things work in"
        };
        for (const [aiWord, humanWord] of Object.entries(aiVocabularyMap)) {
            const regex = new RegExp(`\\b${aiWord}\\b`, 'gi');
            purged = purged.replace(regex, (match) => {
                // preserve capitalization
                if (match[0] === match[0].toUpperCase()) {
                    return humanWord.charAt(0).toUpperCase() + humanWord.slice(1);
                }
                return humanWord;
            });
        }
        return purged.trim();
    }
}
exports.FidelityEngine = FidelityEngine;
