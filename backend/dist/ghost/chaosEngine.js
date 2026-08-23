// Godly Chaos Engine: Structural Chaos Shuffler & Intra-Sentence Tone Blender
// 100% Rule-based, TypeScript Heuristic Parsing (Zero Generative LLM Calls)
// Simulates spaCy dependency parsing mathematically via structural markers.
// Strictly curated from highly formal DB
const FORMAL_MARKERS = {
    transitional: [
        "it appears that",
        "one could argue that",
        "evidence suggests that",
        "it is worth noting that",
        "importantly",
        "significantly",
        "as a result",
        "from a technical standpoint",
        "it follows that",
        "clearly",
        "given this context",
        "traditionally",
        "consequently",
        "interestingly",
        "paradoxically",
        "moreover"
    ],
    conversational: [
        "in a sense",
        "somewhat surprisingly",
        "to a certain extent",
        "broadly speaking",
        "as one might expect",
        "in practice",
        "basically",
        "honestly",
        "really",
        "I mean",
        "actually"
    ],
    connectors: {
        addition: [
            "what stands out is",
            "an additional point is",
            "alongside this",
            "not to mention",
            "plus",
            "coupled with this",
            "on top of that"
        ],
        contrast: [
            "however",
            "yet",
            "in contrast",
            "nevertheless",
            "on the other hand",
            "alternatively",
            "even so",
            "nonetheless"
        ],
        cause: [
            "thus",
            "therefore",
            "consequently",
            "hence",
            "accordingly"
        ]
    },
    subordinate_triggers: new Set(["because", "although", "while", "whereas", "since", "unless", "if"])
};
// --- VOCABULARY MATRIX (Formal Core -> Accessible) ---
const VOCABULARY_MATRIX = {
    "demonstrate": ["show", "suggest", "indicate"],
    "demonstrated": ["showed", "suggested", "indicated"],
    "conclude": ["determine", "find", "infer"],
    "concluded": ["determined", "found", "inferred"],
    "produce": ["yield", "make", "generate"],
    "produced": ["yielded", "made", "generated"],
    "significance": ["importance", "weight", "impact"],
    "significant": ["important", "notable", "clear"],
    "essential": ["crucial", "key", "vital"],
    "utilize": ["use", "apply", "employ"],
    "utilized": ["used", "applied", "employed"],
    "subsequently": ["later", "afterward", "then"],
    "accordingly": ["thus", "so", "therefore"],
    "elucidate": ["clarify", "explain", "outline"],
    "facilitate": ["help", "ease", "enable"],
    "facilitated": ["helped", "eased", "enabled"],
    "advantageous": ["helpful", "useful", "beneficial"],
    "optimal": ["best", "ideal", "most effective"],
    // V25: Absorbed from bladerHumanizer (Stochastic Path)
    "additionally": ["also", "on top of that", "plus"],
    "moreover": ["also", "furthermore", "and another thing"],
    "furthermore": ["also", "not to mention", "plus"],
    "crucial": ["important", "key", "huge"],
    "pivotal": ["important", "central", "main"],
    "underscore": ["show", "point out", "highlight"],
    "enhance": ["improve", "boost", "fix up"],
    "landscape": ["area", "scene", "field"],
    "testament": ["sign", "proof", "mark"],
    "vibrant": ["lively", "active", "bright"],
    "intricate": ["complex", "tangled", "tricky"]
};
// --- COLLOCATIONS & ASIDES (Extreme Chaos) ---
const COLLOCATION_MATRIX = {
    "important to note": ["worth distinguishing", "crucial to contextualize", "notable"],
    "plays a crucial role": ["serves inherently to", "acts as a central mechanism", "functions fundamentally"],
    "significant improvement": ["notable enhancement", "marked progress", "clear advancement"],
    "clear evidence": ["distinct indications", "substantive proof", "demonstrable support"],
    "strong correlation": ["pronounced relationship", "robust association"],
    "demonstrates that": ["illustrates how", "reveals that", "indicates conceptually that"],
    "in addition to": ["alongside", "coupled with"],
    "due to the fact that": ["given that", "because"],
    "it can be seen that": ["one can observe", "evidence suggests"],
    // V25: Absorbed from bladerHumanizer
    "at its core": ["basically", "essentially", "realistically"],
    "in today's rapidly evolving": ["nowadays", "in this current scene", "right now"],
    "in order to": ["to", "just to"],
    "at this point in time": ["now", "currently"],
    "it is important to note that": ["mind you,", "it's worth saying,", "honestly,"],
    "needless to say": ["obviously,", "of course,"],
    "serves as": ["is", "works as"],
    "boasts": ["has", "comes with"]
};
const REFLECTIVE_ASIDES = [
    "albeit in a limited sense",
    "which raises further contextual questions",
    "in a purely statistical sense",
];
// --- CORE UTILITIES ---
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
export function wordCount(str) {
    return (str.match(/\b\w+\b/g) || []).length;
}
// --- INTRA-WORD VOCAB MIXER & GRAMMAR VARIATIONS (with Global Distribution Tracker) ---
function mixVocabularyAndGrammar(sentence, seedBase, isAcademic, globalWordUsage) {
    let modified = sentence;
    let r = seededRandom(seedBase);
    // 1. Vocabulary Mixing (Global Entropy Distribution)
    const words = modified.split(/([ \t.,;!?—\-]+)/);
    let swappedCount = 0;
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (!word.trim() || !/[a-zA-Z]/.test(word))
            continue;
        const lowerWord = word.toLowerCase();
        globalWordUsage[lowerWord] = (globalWordUsage[lowerWord] || 0) + 1;
        if (VOCABULARY_MATRIX[lowerWord] && swappedCount < 4) {
            // Swap probability spikes if the word has been repeated heavily globally
            const isRepeated = globalWordUsage[lowerWord] > 2;
            const dynamicSwapThreshold = isRepeated ? 0.45 : 0.15;
            if (r < dynamicSwapThreshold) {
                const synonyms = VOCABULARY_MATRIX[lowerWord];
                const swapIdx = Math.floor(seededRandom(seedBase + i) * synonyms.length);
                const replacement = synonyms[swapIdx];
                // Maintain casing
                if (word.charAt(0) === word.charAt(0).toUpperCase()) {
                    words[i] = replacement.charAt(0).toUpperCase() + replacement.slice(1);
                }
                else {
                    words[i] = replacement;
                }
                swappedCount++;
            }
        }
        r = seededRandom(r * 100);
    }
    modified = words.join("");
    // 2. Phrase-Level Collocation Entropy Booster
    for (const [aiPhrase, variants] of Object.entries(COLLOCATION_MATRIX)) {
        const phraseRegex = new RegExp(`\\b${aiPhrase}\\b`, "i");
        if (phraseRegex.test(modified) && seededRandom(r * 50) < 0.25) {
            const replacement = variants[Math.floor(seededRandom(r * 75) * variants.length)];
            modified = modified.replace(phraseRegex, (match) => {
                return match.charAt(0) === match.charAt(0).toUpperCase()
                    ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
                    : replacement;
            });
        }
    }
    // 3. Grammar Micro-Variations
    // We only perform safe deterministic sweeps.
    if (r > 0.8) {
        // Variation: Shift "is/are primarily X" to "is/are explicitly X"
        modified = modified.replace(/\b(is|are|was|were) primarily\b/ig, "$1 explicitly");
    }
    else if (r > 0.6) {
        // Variation: Swap passive marker if safe
        modified = modified.replace(/\bcan be seen\b/ig, "is evident");
        modified = modified.replace(/\bwas produced by\b/ig, "resulted from");
    }
    else if (r < 0.1 && isAcademic) {
        // Safe comma drops before 'and' in compound closures
        modified = modified.replace(/, and\b/ig, " and");
    }
    // 3. Very subtle accessible mix (e.g. slight contractions if allowed - in Academic we usually avoid, 
    // but the prompt explicitly asked to "allow light contractions only if user DNA shows them". 
    // We will hardcode a low 5% chance to mix it safely for extreme realism if r is highly specific).
    if (r < 0.05 && isAcademic) {
        // Only universally academic-safe contractions
        modified = modified.replace(/\b(it is)\b/ig, (match) => match.charAt(0) === "I" ? "It's" : "it's");
        modified = modified.replace(/\b(do not)\b/ig, (match) => match.charAt(0) === "D" ? "Don't" : "don't");
    }
    return modified;
}
// --- HEURISTIC CLAUSE PARSER (spaCy Alternative) ---
/**
 * Splits a sentence into deterministic clause bounds using punctuation and academic subordinating conjunctions.
 */
function heuristicClauseRegexSplit(sentence) {
    const tokens = sentence.split(/\b/);
    const clauses = [];
    let currentClause = "";
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const lowerT = t.toLowerCase();
        if (t === "," || t === ";") {
            if (wordCount(currentClause) >= 4) {
                clauses.push(currentClause.trim() + t);
                currentClause = "";
            }
            else {
                currentClause += t;
            }
        }
        else if (FORMAL_MARKERS.subordinate_triggers.has(lowerT) && wordCount(currentClause) >= 5) {
            clauses.push(currentClause.trim() + " ");
            currentClause = t;
        }
        else {
            currentClause += t;
        }
    }
    if (currentClause.trim()) {
        clauses.push(currentClause.trim());
    }
    return clauses.filter(c => wordCount(c) > 2);
}
/**
 * V22.3: Structural Deformity (Clause Re-Ordering)
 * Intentionally swaps main and subordinate clauses to destroy AI statistical symmetry.
 */
function applyStructuralDeformity(sentence, seed) {
    const clauses = heuristicClauseRegexSplit(sentence);
    if (clauses.length < 2)
        return sentence;
    const r = seededRandom(seed);
    if (r < 0.4) {
        // Swap first and last clause if they are long enough
        let newClauses = [...clauses];
        const last = newClauses.pop();
        const first = newClauses.shift();
        if (last && first) {
            // Check for subordinate triggers to maintain basic logic
            const triggers = Array.from(FORMAL_MARKERS.subordinate_triggers);
            const hasTrigger = triggers.some(t => first.toLowerCase().startsWith(t));
            if (hasTrigger) {
                // If first clause starts with "Although", moving it to end is very human.
                return [...newClauses, last, first.replace(/,$/, "")].join(" ").replace(/\s{2,}/g, " ").trim();
            }
            else {
                return [last, ...newClauses, first].join(" ").replace(/\s{2,}/g, " ").trim();
            }
        }
    }
    return sentence;
}
/**
 * V25: Voice Flip (Active <-> Passive)
 * Heuristic conversion to break AI structural symmetry.
 */
function applyVoiceFlip(sentence, seed) {
    const r = seededRandom(seed);
    if (r > 0.15)
        return sentence; // Low density but high impact
    // Passive -> Active: "X was analyzed by Y" -> "Y analyzed X"
    const passiveRegex = /\b([A-Za-z]+)\s+(?:was|were)\s+([A-Za-z]+)ed\s+by\s+([A-Za-z]+)\b/i;
    if (passiveRegex.test(sentence)) {
        return sentence.replace(passiveRegex, (m, target, verb, actor) => {
            return `${actor.charAt(0).toUpperCase() + actor.slice(1)} ${verb}ed ${target.toLowerCase()}`;
        });
    }
    // Active -> Passive: "Y analyzed X" -> "X was analyzed by Y"
    const activeRegex = /\b([I|We|The studies])\s+([A-Za-z]+)ed\s+([A-Za-z]+)\b/i;
    if (activeRegex.test(sentence)) {
        return sentence.replace(activeRegex, (m, actor, verb, target) => {
            return `${target.charAt(0).toUpperCase() + target.slice(1)} was ${verb}ed by ${actor.toLowerCase()}`;
        });
    }
    return sentence;
}
/**
 * V25: Narrative Swap (Direct <-> Indirect)
 * Converts formal reported speech into conversational narrative.
 */
function applyNarrativeSwap(sentence, seed) {
    if (seededRandom(seed) > 0.12)
        return sentence;
    // Indirect -> Direct: "Researchers stated that X" -> "Researchers were clearly like, 'X'"
    const reportedRegex = /\b([A-Za-z]+)\s+(stated|claimed|suggested|argued)\s+that\b/i;
    if (reportedRegex.test(sentence)) {
        return sentence.replace(reportedRegex, (m, actor, verb) => {
            const colloquialVerb = verb === "stated" ? "were like" : "basically said";
            return `${actor} ${colloquialVerb}, `;
        });
    }
    return sentence;
}
/**
 * V26: Punctuation Stutter
 * Injects "fat-finger" or "cognitive hesitation" marks.
 */
function applyPunctuationStutter(sentence, seed) {
    if (seededRandom(seed) > 0.03)
        return sentence;
    const r = seededRandom(seed + 1);
    if (r < 0.3)
        return sentence.replace(/([.!?])/, "$1$1"); // Double marks
    if (r < 0.6)
        return sentence.replace(/,/, ", ,"); // Double comma stutter
    return sentence.replace(/\b([a-z]+)\s+([a-z]+)\b/i, "$1, $2"); // Unnecessary comma
}
/**
 * V26: Case Flux
 * Omissions of capitalization for 'i' or sentence starts.
 */
function applyCaseFlux(sentence, seed) {
    let out = sentence;
    if (seededRandom(seed) < 0.02) {
        out = out.replace(/\bI\b/g, "i");
    }
    if (seededRandom(seed + 2) < 0.015) {
        out = out.charAt(0).toLowerCase() + out.slice(1);
    }
    return out;
}
/**
 * V26: Fragment Bomb
 * Intentionally breaks a sentence to create human-like dysfluency.
 */
function applyFragmentBomb(sentence, seed) {
    if (seededRandom(seed) > 0.04 || wordCount(sentence) < 12)
        return [sentence];
    const words = sentence.split(" ");
    const pivot = Math.floor(words.length / 2);
    return [
        words.slice(0, pivot).join(" ") + "..",
        words.slice(pivot).join(" ")
    ];
}
function labelClause(text) {
    const lowerText = text.toLowerCase();
    // Type assessment
    let type = "main";
    for (const sub of FORMAL_MARKERS.subordinate_triggers) {
        if (lowerText.includes(sub)) {
            type = "subordinate";
            break;
        }
    }
    for (const con of FORMAL_MARKERS.connectors.contrast) {
        if (lowerText.includes(con)) {
            type = "contrast";
            break;
        }
    }
    // MicroStyle assessment
    let microStyle = "pure-formal";
    let isTransitional = FORMAL_MARKERS.transitional.some(marker => lowerText.includes(marker));
    let isConversational = FORMAL_MARKERS.conversational.some(marker => lowerText.includes(marker));
    if (isConversational)
        microStyle = "conversational-formal";
    else if (isTransitional)
        microStyle = "transitional-formal";
    return {
        text: text.trim(),
        type,
        microStyle,
        wordCount: wordCount(text)
    };
}
// --- INTRA-SENTENCE TONE BLENDER ---
function blendClauses(clauses, seedBase, isAcademic) {
    if (clauses.length === 0)
        return "";
    if (clauses.length === 1)
        return clauses[0].text;
    const seed = seedBase + clauses.length;
    let r = seededRandom(seed);
    let output = "";
    clauses.forEach((clause, idx) => {
        let modifiedText = clause.text;
        // Weaponize Chaos: Force tone mixing if pure-formal density is too high
        if (clause.microStyle === "pure-formal" && isAcademic && wordCount(modifiedText) > 6) {
            if (r < 0.25 && idx === 0) {
                // Insert transitional hedge at beginning
                const hedge = FORMAL_MARKERS.transitional[Math.floor(seededRandom(seed + idx) * FORMAL_MARKERS.transitional.length)];
                modifiedText = `${hedge}, ${modifiedText.charAt(0).toLowerCase()}${modifiedText.slice(1)}`;
            }
            else if (r >= 0.25 && r < 0.45 && idx > 0) {
                // Insert a light aside without em-dash wrappers.
                const aside = FORMAL_MARKERS.conversational[Math.floor(seededRandom(seed + idx + 1) * FORMAL_MARKERS.conversational.length)];
                modifiedText = `${aside}, ${modifiedText.replace(/^[,\s]+/, '')}`;
            }
        }
        // Clean up punctuation between merged clauses
        if (idx > 0) {
            const prevChar = output.trim().slice(-1);
            if (![",", ";"].includes(prevChar)) {
                output += " ";
            }
            else {
                output += " ";
                modifiedText = modifiedText.replace(/^[,\s]+/, ''); // remove leading commas if we already attached to one
                // Ensure correct casing after punctuation
                if (modifiedText.length > 0 && prevChar === ",") {
                    modifiedText = modifiedText.charAt(0).toLowerCase() + modifiedText.slice(1);
                }
            }
        }
        output += modifiedText;
        r = seededRandom(r * 100);
    });
    return output.trim();
}
// --- STRUCTURAL CHAOS SHUFFLER ---
export function applyStructuralChaos(text, userDnaHash, isAcademic) {
    if (!text)
        return text;
    // Base deterministic seed generated from user DNA. 
    // This guarantees the exact same rhythm signature every time the same user DNA processes text!
    const baseSeed = simpleHash(userDnaHash || "godly_chaos_default");
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    const shuffledOutput = [];
    let currentSeed = baseSeed;
    // Global tracking to eliminate AI repetition
    const globalWordUsage = {};
    let asidesInserted = 0;
    // Strict Structural Tracking
    let lastStructureType = "";
    for (let i = 0; i < sentences.length; i++) {
        let sentence = sentences[i].trim();
        let r = seededRandom(currentSeed);
        currentSeed = simpleHash(currentSeed.toString());
        // 1. Break into clauses
        const rawClauses = heuristicClauseRegexSplit(sentence);
        const labeledClauses = rawClauses.map(labelClause);
        // 2. Intra-Sentence Tone Blend
        let blendedSentence = blendClauses(labeledClauses, currentSeed, isAcademic);
        // V22.3: Apply Structural Deformity (Linguistic Fragmentation)
        if (seededRandom(currentSeed + 10) < 0.35) {
            blendedSentence = applyStructuralDeformity(blendedSentence, currentSeed + 11);
        }
        // 2.5 Intra-Word Vocabulary, Grammar Mix, & Collocation Swaps
        blendedSentence = mixVocabularyAndGrammar(blendedSentence, currentSeed, isAcademic, globalWordUsage);
        // 2.8 Subtle Self-Referential & Reflective Micro-Insertions (Extreme Chaos)
        if (isAcademic && REFLECTIVE_ASIDES.length > 0 && wordCount(blendedSentence) > 18 && asidesInserted < 1 && r < 0.04) {
            const aside = REFLECTIVE_ASIDES[Math.floor(seededRandom(currentSeed * 2) * REFLECTIVE_ASIDES.length)];
            // Insert aside safely near the middle
            const words = blendedSentence.split(" ");
            const midIndex = Math.floor(words.length / 2);
            words.splice(midIndex, 0, `(${aside})`);
            blendedSentence = words.join(" ").replace(/\s{2,}/g, " ");
            asidesInserted++;
        }
        // 3. Extreme Burstiness & Chaos Density Control (Inter-Sentence Merging)
        // Highly formal texts often merge two mid-length simple sentences into a compound/complex one.
        if (i < sentences.length - 1 && r < (isAcademic ? 0.35 : 0.20)) {
            const nextSentence = sentences[i + 1].trim();
            const nextClauses = heuristicClauseRegexSplit(nextSentence).map(labelClause);
            if (wordCount(blendedSentence) < 20 && wordCount(nextSentence) < 20) {
                // Merge them structurally!
                const connectorType = r < 0.15 ? "contrast" : "addition";
                const connectorList = FORMAL_MARKERS.connectors[connectorType];
                const connector = connectorList[Math.floor(seededRandom(currentSeed) * connectorList.length)];
                blendedSentence = blendedSentence.replace(/[.!?]$/, "") + `; ${connector}, ` +
                    nextSentence.charAt(0).toLowerCase() + nextSentence.slice(1);
                i++; // skip next since we consumed it
            }
        }
        // 4. Force Sentence Type Variety (Simple/Complex Distribution check)
        let wordsInCurrent = wordCount(blendedSentence);
        let currentType = wordsInCurrent < 12 ? "SHORT" : (wordsInCurrent < 25 ? "MED" : "LONG");
        // EXTREME CHAOS ENFORCEMENT: Never repeat same structural bin (Strict anti-repetition)
        if (currentType === lastStructureType) {
            if (currentType === "SHORT" && i < sentences.length - 1) {
                // Force Merge with next to create a LONG sentence
                const connectorList = FORMAL_MARKERS.connectors["addition"];
                const connector = connectorList[Math.floor(seededRandom(currentSeed + 1) * connectorList.length)];
                const nextSentence = sentences[i + 1].trim();
                blendedSentence = blendedSentence.replace(/[.!?]$/, "") + `; ${connector}, ` +
                    nextSentence.charAt(0).toLowerCase() + nextSentence.slice(1);
                i++; // Consume next
                currentType = "LONG";
            }
            else if (currentType === "LONG") {
                // Force Split to create SHORT fragments naturally
                const splitMatch = blendedSentence.match(/;\s+(however|furthermore|therefore|thus|consequently|moreover|yet|and)[, ]/i)
                    || blendedSentence.match(/,\s+(and|but|so)[ ]/i);
                if (splitMatch && splitMatch.index && splitMatch.index > 15) {
                    const firstPart = blendedSentence.slice(0, splitMatch.index) + ".";
                    let secondPart = blendedSentence.slice(splitMatch.index + splitMatch[0].length).trim();
                    secondPart = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
                    shuffledOutput.push(firstPart.charAt(0).toUpperCase() + firstPart.slice(1));
                    blendedSentence = secondPart;
                    currentType = "SHORT";
                }
                else {
                    // Fallback to disruptive introductory hedge if we can't split
                    const hedge = FORMAL_MARKERS.transitional[Math.floor(seededRandom(currentSeed + 2) * FORMAL_MARKERS.transitional.length)];
                    blendedSentence = `${hedge}, ${blendedSentence.charAt(0).toLowerCase()}${blendedSentence.slice(1)}`;
                }
            }
            else if (currentType === "MED") {
                // Force variety via connector (avoid decorative dash-asides).
                const connector = FORMAL_MARKERS.connectors.addition[Math.floor(seededRandom(currentSeed + 3) * FORMAL_MARKERS.connectors.addition.length)];
                blendedSentence = `${connector}, ${blendedSentence.charAt(0).toLowerCase()}${blendedSentence.slice(1)}`;
            }
        }
        lastStructureType = currentType;
        // Ensure sentences end with proper punctuation
        if (!/[.!?]$/.test(blendedSentence)) {
            blendedSentence += ".";
        }
        // V25: Voice & Narrative Swaps
        if (seededRandom(currentSeed + 12) < 0.20) {
            blendedSentence = applyVoiceFlip(blendedSentence, currentSeed + 13);
        }
        if (seededRandom(currentSeed + 14) < 0.15) {
            blendedSentence = applyNarrativeSwap(blendedSentence, currentSeed + 15);
        }
        // Capitalize correctly
        blendedSentence = blendedSentence.charAt(0).toUpperCase() + blendedSentence.slice(1);
        // V25: Lung Capacity Pulse (Burstiness state check)
        const lastWc = shuffledOutput.length > 0 ? wordCount(shuffledOutput[shuffledOutput.length - 1]) : 0;
        const currentWc = wordCount(blendedSentence);
        // If last sentence was long (>25), force this one to be short or fragmented
        if (lastWc > 22 && currentWc > 12 && seededRandom(currentSeed + 16) < 0.5) {
            const parts = blendedSentence.split(/[,;]/);
            if (parts.length > 1) {
                shuffledOutput.push(parts[0].trim() + ".");
                blendedSentence = parts.slice(1).join(", ").trim();
                blendedSentence = blendedSentence.charAt(0).toUpperCase() + blendedSentence.slice(1);
            }
        }
        // V26: Case Flux & Punctuation Stutter
        blendedSentence = applyCaseFlux(blendedSentence, currentSeed + 17);
        blendedSentence = applyPunctuationStutter(blendedSentence, currentSeed + 18);
        // V26: Fragment Bombs
        const fragmented = applyFragmentBomb(blendedSentence, currentSeed + 19);
        for (let fragment of fragmented) {
            shuffledOutput.push(fragment);
        }
    }
    return shuffledOutput.join(" ")
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([.!?])/g, "$1")
        .trim();
}
