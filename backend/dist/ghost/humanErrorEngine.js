// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  Intentional Human Error & Chaos Injection Engine v1.0                      ║
// ║  35+ Error Types | DNA-Aware | Slider-Controlled | Academic Mode Guard      ║
// ║  100% Rule-Based TypeScript (Zero External Dependencies)                    ║
// ║                                                                              ║
// ║  Pipeline Position: Stage 1 (after Pre-Conditioning, before Llama 4 Polish) ║
// ║  Safety Net:        lightReInjectErrors() runs as Stage 3 (post-LLM)        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
// ─── Seeded Randomness (Deterministic per User DNA) ─────────────────────────
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
// ─── Error Dictionaries ─────────────────────────────────────────────────────
// 1. Complex Academic Spelling Errors (100+ words non-natives commonly misspell)
const SPELLING_ERRORS = {
    "bureaucracy": ["beaurucracy", "bureaucrasy"],
    "accommodation": ["accomodation", "acommodation"],
    "separate": ["seperate", "seperete"],
    "definitely": ["definately", "definatly"],
    "receive": ["recieve"],
    "necessary": ["neccessary", "neccesary"],
    "environment": ["enviroment", "envirnoment"],
    "government": ["goverment", "govermnent"],
    "phenomenon": ["phenomenom", "phenomemon"],
    "hypothesis": ["hypotesis", "hypotheisis"],
    "analysis": ["analisis", "anaylsis"],
    "argument": ["arguement"],
    "embarrass": ["embarass", "embarras"],
    "occurrence": ["occurence", "occurance"],
    "recommend": ["recomend", "reccommend"],
    "particularly": ["particulary", "particualrly"],
    "beginning": ["begining", "beggining"],
    "apparently": ["apparantly", "aparently"],
    "immediately": ["immediatly", "immedietaly"],
    "opportunity": ["oportunity", "oppurtunity"],
    "experience": ["experiance", "expierence"],
    "independent": ["independant", "indipendent"],
    "consequence": ["consequense", "consequnce"],
    "significance": ["significanse", "signifcance"],
    "development": ["developement", "devlopment"],
    "acknowledge": ["aknowledge", "acknowlede"],
    "achievement": ["achievment", "achivement"],
    "assessment": ["assesment", "asessment"],
    "committee": ["comittee", "commitee"],
    "contemporary": ["contempory", "comtemporary"],
    "curriculum": ["cirriculum", "curiculum"],
    "discipline": ["disipline", "disciplin"],
    "efficiency": ["effeciency", "efficency"],
    "exaggerate": ["exagerate", "exaggarate"],
    "fundamental": ["fundamnetal", "fundemental"],
    "guarantee": ["gaurantee", "guarentee"],
    "influential": ["influencial", "influentail"],
    "intelligence": ["inteligence", "intelligense"],
    "maintenance": ["maintainance", "maintenence"],
    "methodology": ["methodolgy", "methedology"],
    "noticeable": ["noticable", "noticible"],
    "philosophy": ["philosphy", "philsophy"],
    "possession": ["posession", "possesion"],
    "professional": ["proffesional", "profesional"],
    "psychology": ["phsychology", "psycology"],
    "questionnaire": ["questionare", "questionaire"],
    "responsibility": ["responsibilty", "responsiblity"],
    "sophisticated": ["sofisticated", "sophistacated"],
    "temperature": ["temprature", "temperture"],
    "unfortunately": ["unfortunatly", "unfortunatley"],
    "perspective": ["prespective", "perspetive"],
    "preliminary": ["prelimenary", "prelimanary"],
    "bibliography": ["bibliograhy", "biblography"],
    "characteristic": ["charachteristic", "characterisitc"],
    "comprehensive": ["comprehinsive", "comperhensive"],
    "controversial": ["contravesial", "controversal"],
    "correspondence": ["correspondance", "corespondence"],
    "determination": ["determintion", "determintaion"],
    "discrimination": ["descrimination", "discrimintion"],
    "implementation": ["implimentation", "implementaion"],
    "infrastructure": ["infastructure", "infrastructre"],
    "investigation": ["investigaton", "investagation"],
    "manufacturing": ["manufactering", "manufaturing"],
    "organization": ["organisaton", "organzation"],
    "participation": ["particiption", "partcipation"],
    "predominantly": ["predominatly", "predominently"],
    "recommendation": ["recomendation", "recommandation"],
    "representation": ["representtion", "represenation"],
    "simultaneously": ["simultaniously", "simultaenously"],
    "interpretation": ["interpretaion", "interpertation"],
    "communication": ["comunication", "commmunication"],
    "approximately": ["approximatly", "approximatley"],
    "collaboration": ["colaboration", "collabration"],
    "sustainability": ["sustainablity", "sutainability"],
    "transformation": ["transfomation", "transormation"],
    "vulnerability": ["vulnerablity", "vulnarability"],
    "rehabilitation": ["rehabilitaion", "rehabiliation"],
    "archaeological": ["archeological", "archaelogical"],
    "administrator": ["administartor", "adminstrator"],
    "categorization": ["categoriztion", "categorsation"],
    "documentation": ["documention", "documentaion"],
    "establishment": ["establishmnet", "establisment"],
    "identification": ["identifaction", "indentification"],
    "justification": ["justificaton", "justifcation"],
    "legitimacy": ["legitimasy", "legtimacy"],
    "miscellaneous": ["miscellanous", "miscellneous"],
};
// 2. Article Error Swaps
const ARTICLE_SWAPS = {
    "a": ["the", "an"],
    "an": ["the", "a"],
    "the": ["a", "an"],
};
// 3. Preposition Swaps (common non-native errors)
const PREPOSITION_SWAPS = {
    "to": ["at", "in", "on", "for", "with"],
    "in": ["on", "at", "to", "of"],
    "on": ["in", "at", "to"],
    "for": ["to", "of", "with"],
    "with": ["by", "from", "to"],
    "about": ["on", "regarding"],
    "from": ["of", "by"],
    "at": ["in", "on", "to"],
    "of": ["from", "about", "for"],
    "by": ["with", "from", "through"],
};
// 4. Confused Similar Words (homophones & false friends)
const CONFUSED_WORDS = {
    "affect": "effect",
    "effect": "affect",
    "its": "it's",
    "it's": "its",
    "then": "than",
    "than": "then",
    "their": "there",
    "there": "their",
    "they're": "their",
    "lose": "loose",
    "loose": "lose",
    "accept": "except",
    "except": "accept",
    "principle": "principal",
    "principal": "principle",
    "complement": "compliment",
    "compliment": "complement",
    "stationary": "stationery",
    "whether": "weather",
    "whose": "who's",
    "who's": "whose",
};
// 5. Uncountable Nouns that non-natives wrongly pluralize
const UNCOUNTABLE_NOUNS = new Set([
    "information", "advice", "knowledge", "equipment", "research",
    "data", "evidence", "feedback", "furniture", "homework",
    "luggage", "machinery", "progress", "software", "traffic",
    "vocabulary", "work", "literature", "music", "poetry",
    "propaganda", "scenery", "clothing", "jewelry", "cash",
]);
// 6. L1 Interference Phrases (South Asian / ESL academic patterns)
const L1_INTERFERENCE = {
    "in my opinion": "according to my opinion",
    "on the other hand": "in the other hand",
    "in this way": "by this way",
    "make a decision": "take a decision",
    "do research": "make a research",
    "in any case": "in any how",
    "it depends on": "it depends from",
    "interested in": "interested on",
    "focus on": "focus to",
    "consist of": "consist from",
    "participate in": "participate on",
    "discuss the": "discuss about the",
    "enter the": "enter into the",
    "emphasize the": "emphasize on the",
    "comprise of": "comprise from",
    "lack of": "lack in",
    "different from": "different than",
    "regardless of": "regardless from",
    "superior to": "superior than",
    "inferior to": "inferior than",
    "prefer to": "prefer than",
    "look forward to": "look forward for",
    "concerned about": "concerned for",
    "insight into": "insight about",
    "invest in": "invest on",
    "reply to": "reply back to",
    "return it": "return it back",
    "an impact on": "an impact to",
    "is because": "is due to the reason that",
};
// 7. Wrong Collocation Verbs (common non-native academic mix-ups)
const WRONG_COLLOCATIONS = {
    "make progress": "do progress",
    "make an effort": "do an effort",
    "do homework": "make homework",
    "take notes": "make notes",
    "take a break": "make a break",
    "give advice": "say advice",
    "pay attention": "give attention",
    "raise awareness": "rise awareness",
    "do business": "make business",
    "do research": "make research",
    "draw a conclusion": "make a conclusion",
    "bear in mind": "keep in mind that",
};
// 8. Comparative/Superlative Double Forms
const DOUBLE_COMPARATIVES = {
    "better": "more better",
    "worse": "more worse",
    "best": "most best",
    "worst": "most worst",
    "higher": "more higher",
    "lower": "more lower",
    "easier": "more easier",
    "harder": "more harder",
    "faster": "more faster",
    "simpler": "more simpler",
    "clearer": "more clearer",
};
// 9. American ↔ British Spelling Pairs
const AM_BR_SPELLING = {
    "analyze": "analyse",
    "color": "colour",
    "favor": "favour",
    "honor": "honour",
    "behavior": "behaviour",
    "organization": "organisation",
    "realize": "realise",
    "recognize": "recognise",
    "optimize": "optimise",
    "summarize": "summarise",
    "criticize": "criticise",
    "apologize": "apologise",
    "characterize": "characterise",
    "emphasize": "emphasise",
    "hypothesize": "hypothesise",
    "utilize": "utilise",
    "defense": "defence",
    "offense": "offence",
    "license": "licence",
    "center": "centre",
    "meter": "metre",
    "fiber": "fibre",
    "theater": "theatre",
    "catalog": "catalogue",
    "dialog": "dialogue",
    "program": "programme",
    "enrollment": "enrolment",
    "fulfillment": "fulfilment",
    "judgment": "judgement",
    "aging": "ageing",
    "modeling": "modelling",
    "traveling": "travelling",
    "canceled": "cancelled",
    "labeled": "labelled",
};
// 10. Reporting/Narration Verbs (for narration mix-up detection)
const REPORTING_VERBS = new Set([
    "said", "told", "stated", "mentioned", "reported", "claimed",
    "argued", "suggested", "explained", "noted", "observed",
    "thought", "believed", "felt", "considered", "assumed",
    "indicated", "described", "emphasized", "highlighted",
    "acknowledged", "concluded", "proposed", "asserted",
]);
// 11. Common Verb Forms for Tense Chaos
const VERB_TENSE_MAP = {
    "show": { "past": "showed", "participle": "shown", "continuous": "showing", "third": "shows" },
    "prove": { "past": "proved", "participle": "proven", "continuous": "proving", "third": "proves" },
    "indicate": { "past": "indicated", "participle": "indicated", "continuous": "indicating", "third": "indicates" },
    "suggest": { "past": "suggested", "participle": "suggested", "continuous": "suggesting", "third": "suggests" },
    "demonstrate": { "past": "demonstrated", "participle": "demonstrated", "continuous": "demonstrating", "third": "demonstrates" },
    "reveal": { "past": "revealed", "participle": "revealed", "continuous": "revealing", "third": "reveals" },
    "determine": { "past": "determined", "participle": "determined", "continuous": "determining", "third": "determines" },
    "conclude": { "past": "concluded", "participle": "concluded", "continuous": "concluding", "third": "concludes" },
    "analyze": { "past": "analyzed", "participle": "analyzed", "continuous": "analyzing", "third": "analyzes" },
    "examine": { "past": "examined", "participle": "examined", "continuous": "examining", "third": "examines" },
    "establish": { "past": "established", "participle": "established", "continuous": "establishing", "third": "establishes" },
    "observe": { "past": "observed", "participle": "observed", "continuous": "observing", "third": "observes" },
    "achieve": { "past": "achieved", "participle": "achieved", "continuous": "achieving", "third": "achieves" },
    "require": { "past": "required", "participle": "required", "continuous": "requiring", "third": "requires" },
    "consider": { "past": "considered", "participle": "considered", "continuous": "considering", "third": "considers" },
    "present": { "past": "presented", "participle": "presented", "continuous": "presenting", "third": "presents" },
    "identify": { "past": "identified", "participle": "identified", "continuous": "identifying", "third": "identifies" },
    "provide": { "past": "provided", "participle": "provided", "continuous": "providing", "third": "provides" },
    "discuss": { "past": "discussed", "participle": "discussed", "continuous": "discussing", "third": "discusses" },
    "find": { "past": "found", "participle": "found", "continuous": "finding", "third": "finds" },
    "make": { "past": "made", "participle": "made", "continuous": "making", "third": "makes" },
    "take": { "past": "took", "participle": "taken", "continuous": "taking", "third": "takes" },
    "give": { "past": "gave", "participle": "given", "continuous": "giving", "third": "gives" },
    "become": { "past": "became", "participle": "become", "continuous": "becoming", "third": "becomes" },
    "know": { "past": "knew", "participle": "known", "continuous": "knowing", "third": "knows" },
    "think": { "past": "thought", "participle": "thought", "continuous": "thinking", "third": "thinks" },
    "see": { "past": "saw", "participle": "seen", "continuous": "seeing", "third": "sees" },
    "go": { "past": "went", "participle": "gone", "continuous": "going", "third": "goes" },
    "come": { "past": "came", "participle": "come", "continuous": "coming", "third": "comes" },
    "write": { "past": "wrote", "participle": "written", "continuous": "writing", "third": "writes" },
    "begin": { "past": "began", "participle": "begun", "continuous": "beginning", "third": "begins" },
    "grow": { "past": "grew", "participle": "grown", "continuous": "growing", "third": "grows" },
    "run": { "past": "ran", "participle": "run", "continuous": "running", "third": "runs" },
    "lead": { "past": "led", "participle": "led", "continuous": "leading", "third": "leads" },
    "arise": { "past": "arose", "participle": "arisen", "continuous": "arising", "third": "arises" },
    "choose": { "past": "chose", "participle": "chosen", "continuous": "choosing", "third": "chooses" },
    "drive": { "past": "drove", "participle": "driven", "continuous": "driving", "third": "drives" },
    "speak": { "past": "spoke", "participle": "spoken", "continuous": "speaking", "third": "speaks" },
    "break": { "past": "broke", "participle": "broken", "continuous": "breaking", "third": "breaks" },
    "fall": { "past": "fell", "participle": "fallen", "continuous": "falling", "third": "falls" },
    "hold": { "past": "held", "participle": "held", "continuous": "holding", "third": "holds" },
    "stand": { "past": "stood", "participle": "stood", "continuous": "standing", "third": "stands" },
    "understand": { "past": "understood", "participle": "understood", "continuous": "understanding", "third": "understands" },
};
// All verb forms flattened for reverse lookup
const ALL_VERB_FORMS = new Map();
for (const [base, forms] of Object.entries(VERB_TENSE_MAP)) {
    ALL_VERB_FORMS.set(base, { base, form: "base" });
    for (const [formName, formValue] of Object.entries(forms)) {
        ALL_VERB_FORMS.set(formValue, { base, form: formName });
    }
}
// 12. Subject Pronouns ↔ Object Pronoun Swaps
const PRONOUN_CASE_SWAPS = {
    "i": "me",
    "he": "him",
    "she": "her",
    "we": "us",
    "they": "them",
    // Object → Subject (wrong position swaps)
    "me": "I",
    "him": "he",
    "her": "she",
    "us": "we",
    "them": "they",
};
// 13. Quantifier Confusion Pairs
const QUANTIFIER_SWAPS = {
    "fewer": "less",
    "less": "fewer",
    "many": "much",
    "much": "many",
    "number": "amount",
    "amount": "number",
};
// 14. Wrong Negation Patterns
const DOUBLE_NEGATION_TRIGGERS = new Set([
    "nothing", "nobody", "nowhere", "never", "neither", "none",
]);
// 15. Transition / Linking Word Swaps
const TRANSITION_SWAPS = {
    "however": ["moreover", "therefore", "although"],
    "moreover": ["however", "nevertheless", "consequently"],
    "therefore": ["however", "moreover", "nevertheless"],
    "consequently": ["moreover", "however", "additionally"],
    "nevertheless": ["moreover", "therefore", "however"],
    "furthermore": ["however", "consequently", "instead"],
    "although": ["however", "moreover", "because"],
    "because": ["although", "since", "whereas"],
    "whereas": ["because", "although", "while"],
};
// 16. Causal Connector Confusion
const CAUSAL_SWAPS = {
    "because": ["as", "since", "so that"],
    "since": ["because", "as", "while"],
    "as": ["because", "since", "while"],
    "so": ["because", "therefore", "thus"],
};
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
 * Main Error Injection Engine — Stage 1
 * Applies all 35+ error types to pre-conditioned text.
 */
export function applyHumanErrors(text, config) {
    if (!text || config.chaosThreshold <= 0)
        return { text, mutations: [] };
    const baseSeed = simpleHash(config.dnaSeed || "default_error_dna");
    // Slider calibration: target near-linear feel for users (10% slider ≈ full 10% injection intent).
    // Upgraded from legacy 7.5 multiplier to 10.0 to remove underpowered behavior.
    let density = (config.chaosThreshold / 100) * 10.0 * config.errorFactor;
    // Increase the academic cap from 0.85 to 0.95 so we don't stifle power
    if (config.isAcademic)
        density = Math.min(density, 0.95);
    const mutations = [];
    let currentSeed = baseSeed;
    let output = text;
    // Apply error groups in order of impact priority
    // Each group operates on the full text with its own sub-probability
    // Drastically increased base probabilities per group
    // ─── GROUP 1: Verb Tense & Sequence Chaos (Highest Impact) ──────────
    output = applyVerbTenseChaos(output, density * 0.70, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "verb");
    // ─── GROUP 2: Article Errors ────────────────────────────────────────
    output = applyArticleErrors(output, density * 0.80, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "article");
    // ─── GROUP 3: Preposition Errors ────────────────────────────────────
    output = applyPrepositionErrors(output, density * 0.75, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "prep");
    // ─── GROUP 4: Subject-Verb Agreement ────────────────────────────────
    output = applyAgreementErrors(output, density * 0.65, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "agree");
    // ─── GROUP 5: Complex Spelling Errors ───────────────────────────────
    output = applySpellingErrors(output, density * 0.85, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "spell");
    // ─── GROUP 6: Uncountable Noun Pluralization ────────────────────────
    output = applyNounPluralErrors(output, density * 0.80, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "noun");
    // ─── GROUP 7: Confused Words (Homophones) ──────────────────────────
    output = applyConfusedWords(output, density * 0.60, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "confuse");
    // ─── GROUP 8: L1 Interference Phrases ──────────────────────────────
    if (!config.isAcademic || density > 0.3) {
        output = applyL1Interference(output, density * 0.50, currentSeed, mutations);
        currentSeed = simpleHash(currentSeed.toString() + "l1");
    }
    // ─── GROUP 9: Double Comparatives ──────────────────────────────────
    output = applyDoubleComparatives(output, density * 0.50, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "comp");
    // ─── GROUP 10: American/British Spelling Mix ───────────────────────
    output = applyAmBrMix(output, density * 0.55, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "ambr");
    // ─── GROUP 11: Transition/Linking Word Chaos ───────────────────────
    output = applyTransitionChaos(output, density * 0.40, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "trans");
    // ─── GROUP 12: Quantifier/Countable Confusion ─────────────────────
    output = applyQuantifierErrors(output, density * 0.55, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "quant");
    // ─── GROUP 13: Run-on / Fragment Mixing ────────────────────────────
    output = applyRunOnFragments(output, density * 0.35, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "runon");
    // ─── GROUP 14: Capitalization Chaos ────────────────────────────────
    output = applyCapitalizationErrors(output, density * 0.40, currentSeed, mutations);
    currentSeed = simpleHash(currentSeed.toString() + "caps");
    // ─── GROUP 15: Wrong Collocations ─────────────────────────────────
    output = applyWrongCollocations(output, density * 0.60, currentSeed, mutations);
    return { text: output, mutations };
}
// ─── GROUP IMPLEMENTATIONS ──────────────────────────────────────────────────
function applyVerbTenseChaos(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // Strategy 1: Flip known verb forms to wrong tense
    for (const [verbForm, info] of ALL_VERB_FORMS) {
        if (verbForm.length < 3)
            continue; // Skip tiny words like "go", "do" etc to avoid false positives
        const regex = new RegExp(`\\b${escapeRegex(verbForm)}\\b`, "gi");
        const matches = output.match(regex);
        if (!matches)
            continue;
        for (const match of matches) {
            s = simpleHash(s.toString() + match);
            if (seededRandom(s) > prob)
                continue;
            const base = info.base;
            const forms = VERB_TENSE_MAP[base];
            if (!forms)
                continue;
            // Pick a WRONG form (different from current)
            const wrongOptions = Object.entries(forms)
                .filter(([k, v]) => v.toLowerCase() !== match.toLowerCase() && k !== info.form)
                .map(([_, v]) => v);
            if (wrongOptions.length === 0)
                continue;
            const wrongForm = wrongOptions[Math.floor(seededRandom(s + 1) * wrongOptions.length)];
            // Preserve case
            const replacement = match[0] === match[0].toUpperCase()
                ? wrongForm.charAt(0).toUpperCase() + wrongForm.slice(1)
                : wrongForm;
            // Replace only the FIRST occurrence to avoid over-chaos
            output = output.replace(new RegExp(`\\b${escapeRegex(match)}\\b`, "i"), replacement);
            log.push({ type: "verb_tense", original: match, mutated: replacement, position: output.indexOf(replacement) });
            break; // Only one mutation per verb form to keep readable
        }
    }
    // Strategy 2: Sequence-of-tenses errors in reported speech
    // "he said he was" → "he said he is" (past context + present verb)
    const reportedSpeechPattern = /\b(said|told|stated|mentioned|claimed|argued|thought|believed)\s+(that\s+)?(he|she|it|they|we|I)\s+(was|were|had|could|would|should|might)\b/gi;
    output = output.replace(reportedSpeechPattern, (match, verb, that, pronoun, aux) => {
        s = simpleHash(s.toString() + match);
        if (seededRandom(s) > prob * 0.7)
            return match;
        const presentAux = {
            "was": "is", "were": "are", "had": "has",
            "could": "can", "would": "will", "should": "shall", "might": "may"
        };
        const newAux = presentAux[aux.toLowerCase()] || aux;
        const result = `${verb} ${that || ""}${pronoun} ${newAux}`;
        log.push({ type: "sequence_of_tenses", original: match, mutated: result, position: -1 });
        return result;
    });
    // Strategy 3: -ing ↔ -ed simple flips on unknown verbs
    const ingEdPattern = /\b(\w{4,})(ing|ed)\b/gi;
    let flipCount = 0;
    output = output.replace(ingEdPattern, (match, stem, suffix) => {
        if (flipCount >= 3)
            return match; // Cap at 3 flips per text
        s = simpleHash(s.toString() + match);
        if (seededRandom(s) > prob * 0.3)
            return match;
        const newSuffix = suffix === "ing" ? "ed" : "ing";
        flipCount++;
        const result = stem + newSuffix;
        log.push({ type: "verb_suffix_flip", original: match, mutated: result, position: -1 });
        return result;
    });
    return output;
}
function applyArticleErrors(text, prob, seed, log) {
    let s = seed;
    let changeCount = 0;
    // Loosened max changes per text to pump up density
    const maxChanges = Math.max(3, Math.floor(text.split(/\s+/).length / 10));
    return text.replace(/\b(a|an|the)\b/gi, (match) => {
        if (changeCount >= maxChanges)
            return match;
        s = simpleHash(s.toString() + match + changeCount);
        if (seededRandom(s) > prob)
            return match;
        const lower = match.toLowerCase();
        const options = ARTICLE_SWAPS[lower];
        if (!options)
            return match;
        const replacement = options[Math.floor(seededRandom(s + 1) * options.length)];
        const cased = match[0] === match[0].toUpperCase()
            ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
            : replacement;
        changeCount++;
        log.push({ type: "article", original: match, mutated: cased, position: -1 });
        return cased;
    });
}
function applyPrepositionErrors(text, prob, seed, log) {
    let s = seed;
    let changeCount = 0;
    // Loosened max changes from length/40 to much higher frequency
    const maxChanges = Math.max(3, Math.floor(text.split(/\s+/).length / 15));
    const prepRegex = /\b(to|in|on|for|with|about|from|at|of|by)\b/gi;
    return text.replace(prepRegex, (match) => {
        if (changeCount >= maxChanges)
            return match;
        s = simpleHash(s.toString() + match + changeCount);
        if (seededRandom(s) > prob)
            return match;
        const lower = match.toLowerCase();
        const options = PREPOSITION_SWAPS[lower];
        if (!options)
            return match;
        const replacement = options[Math.floor(seededRandom(s + 1) * options.length)];
        changeCount++;
        log.push({ type: "preposition", original: match, mutated: replacement, position: -1 });
        return replacement;
    });
}
function applyAgreementErrors(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // Pattern: "he/she/it + base verb" → add wrong form
    // "he go" vs "he goes", "she have" vs "she has"
    const svPatterns = [
        [/\b(he|she|it)\s+(go)\b/gi, "$1 goes", "sv_agreement"],
        [/\b(he|she|it)\s+(have)\b/gi, "$1 has", "sv_agreement"],
        [/\b(he|she|it)\s+(do)\b/gi, "$1 does", "sv_agreement"],
        // Reverse: correct → wrong
        [/\b(he|she|it)\s+(goes)\b/gi, "$1 go", "sv_agreement_break"],
        [/\b(he|she|it)\s+(has)\b/gi, "$1 have", "sv_agreement_break"],
        [/\b(he|she|it)\s+(does)\b/gi, "$1 do", "sv_agreement_break"],
        // Plural subject + singular verb
        [/\b(they|we|studies|results|findings|data)\s+(shows)\b/gi, "$1 show", "sv_plural_fix_wrong"],
        [/\b(they|we|studies|results|findings|data)\s+(show)\b/gi, "$1 shows", "sv_plural_break"],
        [/\b(they|we|studies|results|findings)\s+(indicates)\b/gi, "$1 indicate", "sv_plural_fix_wrong"],
        [/\b(they|we|studies|results|findings)\s+(indicate)\b/gi, "$1 indicates", "sv_plural_break"],
    ];
    for (const [pattern, replacement, errorType] of svPatterns) {
        s = simpleHash(s.toString() + errorType);
        if (seededRandom(s) > prob)
            continue;
        const before = output;
        output = output.replace(pattern, replacement);
        if (output !== before) {
            log.push({ type: errorType, original: "(pattern match)", mutated: replacement, position: -1 });
        }
    }
    return output;
}
function applySpellingErrors(text, prob, seed, log) {
    let s = seed;
    let output = text;
    let changeCount = 0;
    const maxChanges = Math.max(3, Math.floor(text.split(/\s+/).length / 15));
    for (const [correct, wrongs] of Object.entries(SPELLING_ERRORS)) {
        if (changeCount >= maxChanges)
            break;
        const regex = new RegExp(`\\b${escapeRegex(correct)}\\b`, "gi");
        if (!regex.test(output))
            continue;
        s = simpleHash(s.toString() + correct);
        if (seededRandom(s) > prob)
            continue;
        const wrongSpelling = wrongs[Math.floor(seededRandom(s + 1) * wrongs.length)];
        output = output.replace(regex, (match) => {
            const cased = match[0] === match[0].toUpperCase()
                ? wrongSpelling.charAt(0).toUpperCase() + wrongSpelling.slice(1)
                : wrongSpelling;
            log.push({ type: "spelling", original: match, mutated: cased, position: -1 });
            changeCount++;
            return cased;
        });
    }
    return output;
}
function applyNounPluralErrors(text, prob, seed, log) {
    let s = seed;
    let changeCount = 0;
    return text.replace(/\b(\w+)\b/g, (match) => {
        if (changeCount >= 4)
            return match;
        const lower = match.toLowerCase();
        if (!UNCOUNTABLE_NOUNS.has(lower))
            return match;
        s = simpleHash(s.toString() + match);
        if (seededRandom(s) > prob)
            return match;
        changeCount++;
        const pluralized = match + "s";
        log.push({ type: "uncountable_plural", original: match, mutated: pluralized, position: -1 });
        return pluralized;
    });
}
function applyConfusedWords(text, prob, seed, log) {
    let s = seed;
    let output = text;
    for (const [word, confusion] of Object.entries(CONFUSED_WORDS)) {
        s = simpleHash(s.toString() + word);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
        if (!regex.test(output))
            continue;
        // Only replace the FIRST match to keep controlled
        let replaced = false;
        output = output.replace(regex, (match) => {
            if (replaced)
                return match;
            replaced = true;
            const cased = match[0] === match[0].toUpperCase()
                ? confusion.charAt(0).toUpperCase() + confusion.slice(1)
                : confusion;
            log.push({ type: "confused_word", original: match, mutated: cased, position: -1 });
            return cased;
        });
    }
    return output;
}
function applyL1Interference(text, prob, seed, log) {
    let s = seed;
    let output = text;
    for (const [correct, wrong] of Object.entries(L1_INTERFERENCE)) {
        s = simpleHash(s.toString() + correct);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(escapeRegex(correct), "gi");
        if (!regex.test(output))
            continue;
        output = output.replace(regex, (match) => {
            log.push({ type: "l1_interference", original: match, mutated: wrong, position: -1 });
            return wrong;
        });
    }
    return output;
}
function applyDoubleComparatives(text, prob, seed, log) {
    let s = seed;
    let output = text;
    for (const [correct, doubled] of Object.entries(DOUBLE_COMPARATIVES)) {
        s = simpleHash(s.toString() + correct);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(`\\b${escapeRegex(correct)}\\b`, "gi");
        if (!regex.test(output))
            continue;
        let replaced = false;
        output = output.replace(regex, (match) => {
            if (replaced)
                return match;
            replaced = true;
            log.push({ type: "double_comparative", original: match, mutated: doubled, position: -1 });
            return doubled;
        });
    }
    return output;
}
function applyAmBrMix(text, prob, seed, log) {
    let s = seed;
    let output = text;
    for (const [american, british] of Object.entries(AM_BR_SPELLING)) {
        s = simpleHash(s.toString() + american);
        if (seededRandom(s) > prob)
            continue;
        // Try both directions
        const amRegex = new RegExp(`\\b${escapeRegex(american)}\\b`, "gi");
        const brRegex = new RegExp(`\\b${escapeRegex(british)}\\b`, "gi");
        if (amRegex.test(output)) {
            let replaced = false;
            output = output.replace(amRegex, (match) => {
                if (replaced)
                    return match;
                replaced = true;
                log.push({ type: "am_br_mix", original: match, mutated: british, position: -1 });
                return british;
            });
        }
        else if (brRegex.test(output)) {
            let replaced = false;
            output = output.replace(brRegex, (match) => {
                if (replaced)
                    return match;
                replaced = true;
                log.push({ type: "br_am_mix", original: match, mutated: american, position: -1 });
                return american;
            });
        }
    }
    return output;
}
function applyTransitionChaos(text, prob, seed, log) {
    let s = seed;
    let output = text;
    for (const [correct, wrongs] of Object.entries(TRANSITION_SWAPS)) {
        s = simpleHash(s.toString() + correct);
        if (seededRandom(s) > prob)
            continue;
        // Only match at sentence start or after punctuation (transition position)
        const regex = new RegExp(`(^|[.!?;]\\s+)(${escapeRegex(correct)})\\b`, "gi");
        if (!regex.test(output))
            continue;
        let replaced = false;
        output = output.replace(regex, (match, prefix, word) => {
            if (replaced)
                return match;
            replaced = true;
            const wrong = wrongs[Math.floor(seededRandom(s + 1) * wrongs.length)];
            const cased = word[0] === word[0].toUpperCase()
                ? wrong.charAt(0).toUpperCase() + wrong.slice(1)
                : wrong;
            log.push({ type: "transition_swap", original: word, mutated: cased, position: -1 });
            return prefix + cased;
        });
    }
    return output;
}
function applyQuantifierErrors(text, prob, seed, log) {
    let s = seed;
    let output = text;
    for (const [correct, wrong] of Object.entries(QUANTIFIER_SWAPS)) {
        s = simpleHash(s.toString() + correct);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(`\\b${escapeRegex(correct)}\\b`, "gi");
        if (!regex.test(output))
            continue;
        let replaced = false;
        output = output.replace(regex, (match) => {
            if (replaced)
                return match;
            replaced = true;
            log.push({ type: "quantifier", original: match, mutated: wrong, position: -1 });
            return wrong;
        });
    }
    return output;
}
function applyRunOnFragments(text, prob, seed, log) {
    let s = seed;
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length < 4)
        return text;
    const result = [];
    let i = 0;
    while (i < sentences.length) {
        s = simpleHash(s.toString() + i);
        // Run-on: merge two sentences (remove period, lowercase)
        if (i < sentences.length - 1 && seededRandom(s) < prob) {
            const first = sentences[i].replace(/[.!?]$/, "");
            const second = sentences[i + 1];
            const secondLower = second.charAt(0).toLowerCase() + second.slice(1);
            const merged = `${first} ${secondLower}`;
            result.push(merged);
            log.push({ type: "run_on", original: sentences[i] + " " + sentences[i + 1], mutated: merged, position: -1 });
            i += 2;
            continue;
        }
        result.push(sentences[i]);
        i++;
    }
    return result.join(" ");
}
function applyCapitalizationErrors(text, prob, seed, log) {
    let s = seed;
    let changeCount = 0;
    const maxChanges = Math.max(1, Math.floor(text.split(/\s+/).length / 60));
    // Target: sentence-internal capitalization errors (not sentence starts)
    return text.replace(/\b([A-Z][a-z]{3,})\b/g, (match, word, offset) => {
        if (changeCount >= maxChanges)
            return match;
        // Don't lowercase the very first word of a sentence
        if (offset === 0 || /[.!?]\s*$/.test(text.substring(0, offset)))
            return match;
        s = simpleHash(s.toString() + match);
        if (seededRandom(s) > prob)
            return match;
        changeCount++;
        const lowered = word.toLowerCase();
        log.push({ type: "capitalization", original: match, mutated: lowered, position: offset });
        return lowered;
    });
}
function applyWrongCollocations(text, prob, seed, log) {
    let s = seed;
    let output = text;
    for (const [correct, wrong] of Object.entries(WRONG_COLLOCATIONS)) {
        s = simpleHash(s.toString() + correct);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(escapeRegex(correct), "gi");
        if (!regex.test(output))
            continue;
        output = output.replace(regex, (match) => {
            log.push({ type: "wrong_collocation", original: match, mutated: wrong, position: -1 });
            return wrong;
        });
    }
    return output;
}
// ─── Stage 3: Light Re-Injection Safety Net ─────────────────────────────────
/**
 * Runs AFTER Llama 4 main polish to re-inject errors that the model may have fixed.
 * Uses only high-impact, low-risk error types at reduced strength (40% of original).
 *
 * // User er concern solve kore: LLM beshi kichhu thik kore felle, ekhane abar forcefully add kori
 */
export function lightReInjectErrors(text, config) {
    if (!text || config.chaosThreshold <= 0)
        return { text, mutations: [] };
    // Safety net uses 40% of the original strength + shifted seed (to avoid same positions)
    const safetyConfig = {
        ...config,
        chaosThreshold: config.chaosThreshold * 0.40,
        dnaSeed: config.dnaSeed + "_safety_net_v1",
    };
    const baseSeed = simpleHash(safetyConfig.dnaSeed);
    let density = (safetyConfig.chaosThreshold / 100) * safetyConfig.errorFactor;
    if (safetyConfig.isAcademic)
        density = Math.min(density, 0.35);
    const mutations = [];
    let output = text;
    let seed = baseSeed;
    // Only apply the 4 highest-impact categories in the safety net:
    // 1. Verb Tense (priority target — LLM most likely to "fix" these)
    output = applyVerbTenseChaos(output, density * 0.45, seed, mutations);
    seed = simpleHash(seed.toString() + "safe_verb");
    // 2. Article Errors (subtle, easy to miss during LLM polish)
    output = applyArticleErrors(output, density * 0.40, seed, mutations);
    seed = simpleHash(seed.toString() + "safe_art");
    // 3. Preposition Errors
    output = applyPrepositionErrors(output, density * 0.35, seed, mutations);
    seed = simpleHash(seed.toString() + "safe_prep");
    // 4. Spelling Errors (flagship non-native signal)
    output = applySpellingErrors(output, density * 0.35, seed, mutations);
    return { text: output, mutations };
}
// ─── Pre-Conditioning & Preserve Prompts (for transformEngine.ts) ───────────
export const PRECONDITION_SYSTEM_PROMPT = `You are preparing text for non-native academic humanization.

Task: Take the raw AI-generated text and lightly rewrite it to sound like a thoughtful non-native English-speaking researcher thinking on paper.

Rules:
- Add subtle reflective thinking flow and natural academic voice.
- Introduce some reported speech, narration shifts, or voice changes where it fits naturally (e.g., "The study shows... I observed that..." or "According to the data, one could argue...").
- Create opportunities for tense shifts, pronoun references, and clause mixing.
- Do NOT fix grammar, spelling, or make the text perfectly clean. Keep some stiffness.
- Keep all facts and meaning 100% unchanged.
- Do NOT add explanations, notes, headers, or markdown.
- Output ONLY the prepared text. Nothing else.`;
export const PRESERVE_ERRORS_SYSTEM_PROMPT = (isAcademic) => `You are an academic polisher. Your ONLY job is to improve natural flow and add reflective scholarly depth.

CRITICAL INSTRUCTION:
- The input text already contains many intentional non-native human errors (tense mistakes, article errors, preposition errors, spelling mistakes, subject-verb disagreement, narration mix-ups, etc.).
- Do NOT correct, fix, improve, or clean ANY of these errors. Preserve every single one EXACTLY as written.
- These errors are deliberate and represent the user's personal non-native academic voice.
- Only smooth awkward flow, add light hedging or reflective touches, and ensure the overall argument progresses naturally.
- ${isAcademic ? "Academic Mode: Keep formal vocabulary but NEVER remove the injected chaos." : "Casual Mode: Keep the existing conversational tone. Preserve all errors."}
- Do NOT add explanations, notes, headings, or markdown.
- Output ONLY the polished text. Nothing else.`;
