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
// ═══════════════════════════════════════════════════════════════════════════════
// TIER 1-7: NEW ERROR GROUP IMPLEMENTATIONS (v3.3)
// 58 new error types across 7 tiers
// ═══════════════════════════════════════════════════════════════════════════════
// ─── TIER 1: Punctuation & Structure Chaos ───────────────────────────────────
function applyCommaSplice(text, prob, seed, log) {
    let s = seed;
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length < 3)
        return text;
    const result = [];
    let spliced = false;
    for (let i = 0; i < sentences.length; i++) {
        s = simpleHash(s.toString() + i);
        if (!spliced && i < sentences.length - 1 && seededRandom(s) < prob &&
            sentences[i].length > 20 && sentences[i + 1].length > 15) {
            const first = sentences[i].replace(/[.!?]$/, "");
            const second = sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1);
            const merged = `${first}, ${second}`;
            result.push(merged);
            log.push({ type: "comma_splice", original: sentences[i] + " " + sentences[i + 1], mutated: merged, position: -1 });
            spliced = true;
            i++;
            continue;
        }
        result.push(sentences[i]);
    }
    return result.join(" ");
}
function applyMissingExtraComma(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // Missing comma after intro phrases
    const introPatterns = ["However,", "Furthermore,", "Moreover,", "Nevertheless,", "Therefore,", "Consequently,", "Additionally,", "Similarly,"];
    for (const pattern of introPatterns) {
        s = simpleHash(s.toString() + pattern);
        if (seededRandom(s) > prob)
            continue;
        const noComma = pattern.replace(",", "");
        if (output.includes(pattern)) {
            output = output.replace(pattern, noComma);
            log.push({ type: "missing_comma", original: pattern, mutated: noComma, position: -1 });
            break;
        }
    }
    return output;
}
function applySemicolonMisuse(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "semi");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // Replace a comma before a conjunction with semicolon
    const replaced = output.replace(/,\s+(and|but|or)\s/i, (match) => {
        log.push({ type: "semicolon_misuse", original: match, mutated: match.replace(",", ";"), position: -1 });
        return match.replace(",", ";");
    });
    return replaced;
}
function applySentenceFragment(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "frag");
    if (seededRandom(s) > prob)
        return text;
    // Find a "because/although" clause and make it a fragment
    const match = text.match(/\.\s+(Because|Although|Since|While|If)\s+([^.]{15,60})\./i);
    if (match && match.index !== undefined) {
        const fragment = match[0];
        const newFrag = fragment.replace(/\.\s*$/, ".");
        log.push({ type: "sentence_fragment", original: "", mutated: "fragment created", position: match.index });
    }
    return text;
}
function applyPeriodBoundaryChaos(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "periodbnd");
    if (seededRandom(s) > prob)
        return text;
    // Insert a period mid-sentence occasionally
    const words = text.split(/\s+/);
    if (words.length < 30)
        return text;
    const midPoint = Math.floor(words.length / 2);
    // Find a good spot near middle
    for (let i = midPoint - 3; i < midPoint + 3 && i < words.length; i++) {
        if (words[i].endsWith(",")) {
            const original = words[i];
            words[i] = words[i].replace(",", ".");
            if (i + 1 < words.length) {
                words[i + 1] = words[i + 1].charAt(0).toUpperCase() + words[i + 1].slice(1);
            }
            log.push({ type: "period_boundary", original, mutated: words[i], position: i });
            break;
        }
    }
    return words.join(" ");
}
// ─── TIER 2: South Asian L1 Structural Bleed ─────────────────────────────────
function applyDoubleSubject(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // "This research requires" → "This research, it requires"
    const patterns = [
        [/\b(This (?:research|study|approach|method|analysis))\s+(requires|shows|indicates|suggests|demonstrates)/gi, "$1, it $2"],
        [/\b(The (?:result|finding|data|evidence|report))\s+(shows|indicates|suggests|reveals)/gi, "$1, it $2"],
    ];
    for (const [regex, replacement] of patterns) {
        s = simpleHash(s.toString() + regex.source);
        if (seededRandom(s) > prob)
            continue;
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match, ...args) => {
                if (replaced)
                    return match;
                replaced = true;
                const result = match.replace(regex, replacement);
                log.push({ type: "double_subject", original: match, mutated: result, position: -1 });
                return result;
            });
        }
    }
    return output;
}
function applyMissingCopula(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // "The results are very significant" → "The results very significant"
    const copulaPatterns = [
        [/\b(results?|findings?|data|evidence|approach)\s+(is|are|was|were)\s+(very|quite|highly|extremely|particularly)/gi, "$1 $3"],
        [/\b(it|this|that)\s+(is|was)\s+(important|necessary|clear|evident|obvious)/gi, "$1 $3"],
    ];
    for (const [regex, replacement] of copulaPatterns) {
        s = simpleHash(s.toString() + "copula" + regex.source.slice(0, 10));
        if (seededRandom(s) > prob)
            continue;
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match) => {
                if (replaced)
                    return match;
                replaced = true;
                const result = match.replace(regex, replacement);
                log.push({ type: "missing_copula", original: match, mutated: result, position: -1 });
                return result;
            });
        }
    }
    return output;
}
function applyExistentialError(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "exist");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "There are many" → "There is many" / "There are several" → "There is several"
    let replaced = false;
    output = output.replace(/\bThere\s+are\s+(many|several|numerous|various|multiple)\b/gi, (match, adj) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = `There is ${adj}`;
        log.push({ type: "existential_error", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyGerundInfinitiveConfusion(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // Verbs that take gerund but get infinitive
    const gerundVerbs = {
        "avoid doing": "avoid to do", "enjoy reading": "enjoy to read",
        "consider using": "consider to use", "suggest using": "suggest to use",
        "recommend using": "recommend to use", "involves using": "involves to use",
        "avoid making": "avoid to make", "enjoy learning": "enjoy to learn",
        "finished writing": "finished to write", "keep working": "keep to work",
    };
    for (const [correct, wrong] of Object.entries(gerundVerbs)) {
        s = simpleHash(s.toString() + correct);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(`\\b${escapeRegex(correct)}\\b`, "gi");
        if (regex.test(output)) {
            output = output.replace(regex, (match) => {
                log.push({ type: "gerund_infinitive", original: match, mutated: wrong, position: -1 });
                return wrong;
            });
            break;
        }
    }
    return output;
}
function applyWordOrderBleed(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "wordord");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // Adjective order: swap two-adjective sequences: "a big red" → "a red big"
    let replaced = false;
    output = output.replace(/\b(a|an|the)\s+(\w{3,8})\s+(\w{3,8})\s+(problem|issue|factor|challenge|result|study)\b/gi, (match, det, adj1, adj2, noun) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = `${det} ${adj2} ${adj1} ${noun}`;
        log.push({ type: "word_order_bleed", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyMissingAuxiliary(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // "She has been working" → "She have been working" / "He is not going" → "He not going"
    const auxPatterns = [
        [/\b(he|she|it)\s+has\s+been\b/gi, "$1 have been"],
        [/\b(he|she|it)\s+does\s+not\b/gi, "$1 do not"],
        [/\b(he|she|it)\s+is\s+not\s+(going|working|doing|making|trying)/gi, "$1 not $2"],
    ];
    for (const [regex, replacement] of auxPatterns) {
        s = simpleHash(s.toString() + "auxpat" + regex.source.slice(0, 10));
        if (seededRandom(s) > prob)
            continue;
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match) => {
                if (replaced)
                    return match;
                replaced = true;
                const result = match.replace(regex, replacement);
                log.push({ type: "missing_auxiliary", original: match, mutated: result, position: -1 });
                return result;
            });
            break;
        }
    }
    return output;
}
// ─── TIER 3: Academic-Specific Chaos ─────────────────────────────────────────
function applyRedundancyPleonasm(text, prob, seed, log) {
    let s = seed;
    let output = text;
    const redundancies = {
        "return": "return back", "repeat": "repeat again", "revert": "revert back",
        "advance": "advance forward", "combine": "combine together",
        "collaborate": "collaborate together", "merge": "merge together",
        "history": "past history", "plan": "future plan",
    };
    for (const [word, redundant] of Object.entries(redundancies)) {
        s = simpleHash(s.toString() + word);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match) => {
                if (replaced)
                    return match;
                replaced = true;
                log.push({ type: "redundancy", original: match, mutated: redundant, position: -1 });
                return redundant;
            });
            break;
        }
    }
    return output;
}
function applyHedgingOverload(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "hedge");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    const hedges = ["it can be somewhat argued that", "it is perhaps possible that", "one might tentatively suggest that"];
    // Find "it is" or "this is" or "the results" and prepend hedge
    let replaced = false;
    output = output.replace(/\b(The results|This study|The findings|The evidence)\s+(show|indicate|suggest|reveal)/i, (match, subj, verb) => {
        if (replaced)
            return match;
        replaced = true;
        const hedge = hedges[Math.floor(seededRandom(s + 1) * hedges.length)];
        const mutated = `${hedge} ${subj.toLowerCase()} ${verb}`;
        log.push({ type: "hedging_overload", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyPassiveVoiceInjection(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "passive");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "We analyzed the data" → "The data was analyzed by us"
    const activeToPassive = [
        [/\bWe\s+analyzed\s+(the\s+\w+)/gi, "$1 was analyzed by us"],
        [/\bWe\s+collected\s+(the\s+\w+)/gi, "$1 was collected by us"],
        [/\bWe\s+examined\s+(the\s+\w+)/gi, "$1 was examined by us"],
        [/\bWe\s+observed\s+(the\s+\w+)/gi, "$1 was observed by us"],
        [/\bWe\s+conducted\s+(the\s+\w+)/gi, "$1 was conducted by us"],
    ];
    for (const [regex, replacement] of activeToPassive) {
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match) => {
                if (replaced)
                    return match;
                replaced = true;
                const result = match.replace(regex, replacement);
                log.push({ type: "passive_injection", original: match, mutated: result, position: -1 });
                return result;
            });
            break;
        }
    }
    return output;
}
function applyConjunctionChain(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "conjchain");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // Add "And" at beginning of a sentence
    const sentences = output.split(/(?<=[.!?])\s+/);
    if (sentences.length > 3) {
        const targetIdx = Math.floor(seededRandom(s + 1) * (sentences.length - 2)) + 1;
        if (!/^(And|But|So)\s/i.test(sentences[targetIdx])) {
            const original = sentences[targetIdx];
            sentences[targetIdx] = "And " + sentences[targetIdx].charAt(0).toLowerCase() + sentences[targetIdx].slice(1);
            log.push({ type: "conjunction_chain", original, mutated: sentences[targetIdx], position: -1 });
            output = sentences.join(" ");
        }
    }
    return output;
}
function applyTautologicalPhrases(text, prob, seed, log) {
    let s = seed;
    let output = text;
    const tautologies = {
        "in my opinion": "in my personal opinion",
        "the reason": "the reason is because",
        "each": "each and every",
        "cooperate": "mutually cooperate",
        "basic": "basic fundamentals",
        "consensus": "general consensus",
        "end result": "final end result",
    };
    for (const [word, taut] of Object.entries(tautologies)) {
        s = simpleHash(s.toString() + word);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match) => {
                if (replaced)
                    return match;
                replaced = true;
                log.push({ type: "tautology", original: match, mutated: taut, position: -1 });
                return taut;
            });
            break;
        }
    }
    return output;
}
// ─── TIER 4: Pronoun & Agreement Deep Chaos ──────────────────────────────────
function applyWrongRelativePronoun(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // "the study that" → "the study who" / "the person who" → "the person which"
    const swaps = [
        [/\b(the\s+(?:study|research|method|approach|report|paper))\s+that\b/gi, "$1 who"],
        [/\b(the\s+(?:person|author|researcher|student|participant))\s+who\b/gi, "$1 which"],
    ];
    for (const [regex, replacement] of swaps) {
        s = simpleHash(s.toString() + "relpron");
        if (seededRandom(s) > prob)
            continue;
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match) => {
                if (replaced)
                    return match;
                replaced = true;
                const result = match.replace(regex, replacement);
                log.push({ type: "wrong_relative_pronoun", original: match, mutated: result, position: -1 });
                return result;
            });
            break;
        }
    }
    return output;
}
function applyDeterminerOmission(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "determ");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "The student must" → "Student must" / "a researcher should" → "researcher should"
    let replaced = false;
    output = output.replace(/\b(The|A|An)\s+(student|researcher|teacher|participant|author|reader)\s+(must|should|can|will|has|needs)/gi, (match, det, noun, verb) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = `${noun.charAt(0).toUpperCase() + noun.slice(1)} ${verb}`;
        log.push({ type: "determiner_omission", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
// ─── TIER 5: Anti-AI Fingerprint GOLDEN SIGNALS ──────────────────────────────
function applyCouldOfError(text, prob, seed, log) {
    let s = seed;
    let output = text;
    const haveToOf = {
        "could have": "could of", "would have": "would of", "should have": "should of",
        "might have": "might of", "must have": "must of",
    };
    for (const [correct, wrong] of Object.entries(haveToOf)) {
        s = simpleHash(s.toString() + correct);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(`\\b${escapeRegex(correct)}\\b`, "gi");
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match) => {
                if (replaced)
                    return match;
                replaced = true;
                log.push({ type: "could_of", original: match, mutated: wrong, position: -1 });
                return wrong;
            });
            break;
        }
    }
    return output;
}
function applyConditionalMoodError(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "condmood");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "If I had known" → "If I would have known"
    let replaced = false;
    output = output.replace(/\bIf\s+(\w+)\s+had\s+(\w+ed|known|been|gone|done|seen|taken)/gi, (match, subj, verb) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = `If ${subj} would have ${verb}`;
        log.push({ type: "conditional_mood", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applySubjunctiveAvoidance(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "subjunctive");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "if it were" → "if it was" / "I wish I were" → "I wish I was"
    output = output.replace(/\b(if\s+(?:it|he|she|this|that))\s+were\b/gi, (match, prefix) => {
        log.push({ type: "subjunctive_avoid", original: match, mutated: `${prefix} was`, position: -1 });
        return `${prefix} was`;
    });
    output = output.replace(/\b(wish\s+\w+)\s+were\b/gi, (match, prefix) => {
        log.push({ type: "subjunctive_avoid", original: match, mutated: `${prefix} was`, position: -1 });
        return `${prefix} was`;
    });
    return output;
}
function applyHypercorrectionI(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "hyperI");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "between ... and me" → "between ... and I"
    let replaced = false;
    output = output.replace(/\b(between\s+\w+\s+and)\s+me\b/gi, (match, prefix) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = `${prefix} I`;
        log.push({ type: "hypercorrection_I", original: match, mutated, position: -1 });
        return mutated;
    });
    // "give it to ... and me" → "give it to ... and I"
    output = output.replace(/\b((?:to|for|with)\s+\w+\s+and)\s+me\b/gi, (match, prefix) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = `${prefix} I`;
        log.push({ type: "hypercorrection_I", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyCommaBeforeThat(text, prob, seed, log) {
    let s = seed;
    let output = text;
    let count = 0;
    const maxChanges = 2;
    output = output.replace(/\b(\w+)\s+that\s/g, (match, word, offset) => {
        if (count >= maxChanges)
            return match;
        s = simpleHash(s.toString() + offset);
        if (seededRandom(s) > prob)
            return match;
        count++;
        const mutated = `${word}, that `;
        log.push({ type: "comma_before_that", original: match.trim(), mutated: mutated.trim(), position: offset });
        return mutated;
    });
    return output;
}
function applyParallelismBreak(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "parallel");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "running, swimming, and hiking" → "running, swimming, and to hike"
    let replaced = false;
    output = output.replace(/(\w+ing),\s+(\w+ing),?\s+and\s+(\w+ing)\b/gi, (match, v1, v2, v3) => {
        if (replaced)
            return match;
        replaced = true;
        const stem = v3.replace(/ing$/, "");
        const mutated = `${v1}, ${v2}, and to ${stem}`;
        log.push({ type: "parallelism_break", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyWhichWithoutComma(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // "the study, which shows" → "the study which shows" (remove comma)
    // OR "the study that shows" → "the study which shows" (use which instead of that)
    s = simpleHash(s.toString() + "whichcomma");
    if (seededRandom(s) > prob)
        return text;
    let replaced = false;
    output = output.replace(/,\s+which\s/gi, (match) => {
        if (replaced)
            return match;
        replaced = true;
        log.push({ type: "which_no_comma", original: match.trim(), mutated: " which ", position: -1 });
        return " which ";
    });
    return output;
}
// ─── TIER 6: Eastern L1 Deep Structural Interference ─────────────────────────
function applyStativeProgressive(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // "I understand" → "I am understanding" / "she knows" → "she is knowing"
    const stativeVerbs = {
        "understand": "am understanding", "understands": "is understanding",
        "know": "am knowing", "knows": "is knowing",
        "believe": "am believing", "believes": "is believing",
        "want": "am wanting", "wants": "is wanting",
        "need": "am needing", "needs": "is needing",
        "like": "am liking", "likes": "is liking",
        "prefer": "am preferring", "prefers": "is preferring",
        "realize": "am realizing", "realizes": "is realizing",
    };
    for (const [stative, progressive] of Object.entries(stativeVerbs)) {
        s = simpleHash(s.toString() + stative);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(`\\b(I|we|they|he|she|it|one)\\s+${escapeRegex(stative)}\\b`, "gi");
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match, subject) => {
                if (replaced)
                    return match;
                replaced = true;
                const prog = subject.toLowerCase() === "i" ? stativeVerbs[stative] || progressive :
                    subject.toLowerCase().match(/^(he|she|it|one)$/) ? progressive.replace("am ", "is ") : progressive.replace("am ", "are ");
                const mutated = `${subject} ${prog}`;
                log.push({ type: "stative_progressive", original: match, mutated, position: -1 });
                return mutated;
            });
            break;
        }
    }
    return output;
}
function applyThoughButDouble(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "thobut");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "Although X, Y" → "Although X, but Y"
    let replaced = false;
    output = output.replace(/\b(Although|Though|Even though)\s+([^,]+),\s+/gi, (match, conj, clause) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = `${conj} ${clause}, but `;
        log.push({ type: "though_but_double", original: match.trim(), mutated: mutated.trim(), position: -1 });
        return mutated;
    });
    return output;
}
function applyUniversalTagQuestion(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "tagq");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // Add "isn't it?" to end of a statement
    const sentences = output.split(/(?<=[.!?])\s+/);
    if (sentences.length > 3) {
        const idx = Math.floor(seededRandom(s + 1) * (sentences.length - 1));
        const sent = sentences[idx];
        if (sent.endsWith(".") && sent.length > 25 && !sent.includes("?")) {
            sentences[idx] = sent.replace(/\.$/, ", isn't it?");
            log.push({ type: "universal_tag", original: sent, mutated: sentences[idx], position: -1 });
            output = sentences.join(" ");
        }
    }
    return output;
}
function applySinceForConfusion(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "sinfor");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "for many years" → "since many years" / "for a long time" → "since a long time"
    const patterns = [
        [/\bfor\s+(many\s+years|a\s+long\s+time|several\s+years|decades|centuries)\b/gi, "since $1"],
        [/\bfor\s+(\d+\s+(?:years|months|days|weeks|hours))\b/gi, "since $1"],
    ];
    for (const [regex, replacement] of patterns) {
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match) => {
                if (replaced)
                    return match;
                replaced = true;
                const result = match.replace(regex, replacement);
                log.push({ type: "since_for_confusion", original: match, mutated: result, position: -1 });
                return result;
            });
            break;
        }
    }
    return output;
}
function applyPluralMarkingOmission(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // "many studies" → "many study" / "several factors" → "several factor"
    const quantifiers = ["many", "several", "various", "multiple", "numerous", "different", "three", "four", "five"];
    for (const quant of quantifiers) {
        s = simpleHash(s.toString() + quant);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(`\\b${quant}\\s+(\\w{4,}?)s\\b`, "gi");
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match, noun) => {
                if (replaced)
                    return match;
                if (noun.endsWith("s") || noun.endsWith("i"))
                    return match; // avoid double strip
                replaced = true;
                const mutated = `${quant} ${noun}`;
                log.push({ type: "plural_omission", original: match, mutated, position: -1 });
                return mutated;
            });
            break;
        }
    }
    return output;
}
function applyGenderPronounConfusion(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "gender");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // Swap a "she" to "he" or vice versa (Bangla has one pronoun 'সে' for all)
    let replaced = false;
    output = output.replace(/\b(she|her)\b/gi, (match) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = match.toLowerCase() === "she" ? "he" : "his";
        log.push({ type: "gender_pronoun", original: match, mutated, position: -1 });
        return match[0] === match[0].toUpperCase() ? mutated.charAt(0).toUpperCase() + mutated.slice(1) : mutated;
    });
    return output;
}
function applyPerfectPastConfusion(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "perfpast");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "The study found" → "The study has found" (inject present perfect with past context)
    let replaced = false;
    output = output.replace(/\b(The\s+(?:study|research|analysis|experiment))\s+(found|showed|demonstrated|indicated|revealed)\b/gi, (match, subj, verb) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = `${subj} has ${verb}`;
        log.push({ type: "perfect_past_confusion", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyArticleOveruse(text, prob, seed, log) {
    let s = seed;
    let output = text;
    // Add "the" before abstract nouns: "education is" → "the education is"
    const abstractNouns = ["education", "poverty", "society", "life", "nature", "science", "knowledge", "information", "progress", "development"];
    for (const noun of abstractNouns) {
        s = simpleHash(s.toString() + noun);
        if (seededRandom(s) > prob)
            continue;
        const regex = new RegExp(`(?<!the\\s)\\b(${noun})\\s+(is|was|has|plays|remains)\\b`, "gi");
        if (regex.test(output)) {
            let replaced = false;
            output = output.replace(regex, (match, n, verb) => {
                if (replaced)
                    return match;
                replaced = true;
                const mutated = `the ${n} ${verb}`;
                log.push({ type: "article_overuse", original: match, mutated, position: -1 });
                return mutated;
            });
            break;
        }
    }
    return output;
}
function applyAlreadyTenseMarker(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "already");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "has completed" → "already complete" / "have finished" → "already finish"
    let replaced = false;
    output = output.replace(/\b(has|have)\s+(completed|finished|submitted|published|established)\b/gi, (match, aux, verb) => {
        if (replaced)
            return match;
        replaced = true;
        const stem = verb.replace(/ed$/, "").replace(/ished$/, "ish").replace(/tted$/, "t");
        const mutated = `already ${stem}`;
        log.push({ type: "already_tense", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
// ─── TIER 7: South Asian Academic English Fingerprint ─────────────────────────
function applyCopeUpWith(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "copeup");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    let replaced = false;
    output = output.replace(/\bcope\s+with\b/gi, (match) => {
        if (replaced)
            return match;
        replaced = true;
        log.push({ type: "cope_up_with", original: match, mutated: "cope up with", position: -1 });
        return "cope up with";
    });
    return output;
}
function applyDiscussAbout(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "discuss");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    let replaced = false;
    output = output.replace(/\bdiscuss(es|ed)?\s+the\b/gi, (match, suffix) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = `discuss${suffix || ""} about the`;
        log.push({ type: "discuss_about", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyCompriseOf(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "comprise");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    let replaced = false;
    output = output.replace(/\bcomprises?\s+(?!of\b)/gi, (match) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = match.trim() + " of ";
        log.push({ type: "comprise_of", original: match.trim(), mutated: mutated.trim(), position: -1 });
        return mutated;
    });
    return output;
}
function applyRevertBack(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "revertbk");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "return to" → "return back to"
    let replaced = false;
    output = output.replace(/\breturn\s+to\b/gi, (match) => {
        if (replaced)
            return match;
        replaced = true;
        log.push({ type: "revert_back", original: match, mutated: "return back to", position: -1 });
        return "return back to";
    });
    return output;
}
function applyExplainMePattern(text, prob, seed, log) {
    let s = seed;
    s = simpleHash(s.toString() + "explainme");
    if (seededRandom(s) > prob)
        return text;
    let output = text;
    // "explain to the reader" → "explain the reader" (missing preposition)
    let replaced = false;
    output = output.replace(/\bexplain\s+to\s+(the\s+\w+)/gi, (match, obj) => {
        if (replaced)
            return match;
        replaced = true;
        const mutated = `explain ${obj}`;
        log.push({ type: "explain_me", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
// ─── TIER 8: Pan-Asian Persona Specialty Rules ─────────────────────────
function applyAlreadySuffixPH(text, prob, seed, log) {
    let s = seed;
    const regex = /\b(finished|done|completed|submitted|sent|checked|verified)\b/gi;
    return deterministicReplace(text, regex, prob, s, (match) => {
        log.push({ type: "already_suffix", original: match, mutated: match + " already", position: -1 });
        return match + " already";
    });
}
function applyLahParticleMYID(text, prob, seed, log) {
    let s = seed;
    const sentences = text.split(/(?<=[.!?])\s+/);
    const processed = sentences.map((sent, idx) => {
        s = simpleHash(s.toString() + idx);
        if (seededRandom(s) > prob * 0.4 || sent.length < 30)
            return sent;
        const particles = ["lah", "meh", "sih", "leh"];
        const p = particles[Math.floor(seededRandom(s + 1) * particles.length)];
        const mutated = sent.replace(/[.!?]$/, `, ${p}$1`);
        log.push({ type: "particle_injection", original: sent, mutated, position: -1 });
        return mutated;
    });
    return processed.join(" ");
}
function applyJujurlyHonestly(text, prob, seed, log) {
    let s = seed;
    const regex = /\b(honestly|to be honest|frankly)\b/gi;
    return deterministicReplace(text, regex, prob, s, (match) => {
        const mutated = match.toLowerCase() === "honestly" ? "jujurly" : "to be honest";
        log.push({ type: "jujurly_usage", original: match, mutated, position: -1 });
        return mutated;
    });
}
function applyTenseSimplificationTHVN(text, prob, seed, log) {
    let s = seed;
    const regex = /\b(\w+)(ed|s)\b/gi; // Strip past and 3rd person singular
    return deterministicReplace(text, regex, prob * 0.6, s, (match, stem) => {
        log.push({ type: "tense_simplification", original: match, mutated: stem, position: -1 });
        return stem;
    });
}
function applyJapaneseHonorifics(text, prob, seed, log) {
    let s = seed;
    const regex = /\b(Sir|Professor|Dr\.|Madam)\b/gi;
    return deterministicReplace(text, regex, prob, s, (match) => {
        const mutated = match + "-san";
        log.push({ type: "honorifics", original: match, mutated, position: -1 });
        return mutated;
    });
}
function applyLowercaseStart(text, prob, seed, log) {
    let s = seed;
    const sentences = text.split(/(?<=[.!?])\s+/);
    const processed = sentences.map((sent, idx) => {
        s = simpleHash(s.toString() + idx);
        if (seededRandom(s) > prob * 0.5)
            return sent;
        const mutated = sent.charAt(0).toLowerCase() + sent.slice(1);
        log.push({ type: "lowercase_start", original: sent, mutated, position: -1 });
        return mutated;
    });
    return processed.join(" ");
}
// ─── V20 Specialized Mutation Layers (Plan Items) ─────────────────────────
// M1: The Rant-Abbreviator (sth, wdym, ppl).
function applyRantAbbreviator(text, prob, seed, log) {
    let output = text;
    let s = seed;
    const phraseRules = [
        { regex: /\bwhat\s+do\s+you\s+mean\b/gi, replacement: "wdym", type: "rant_abbrev_wdym" },
        { regex: /\bwhat\s+do\s+u\s+mean\b/gi, replacement: "wdym", type: "rant_abbrev_wdym" },
    ];
    for (const rule of phraseRules) {
        output = deterministicReplace(output, rule.regex, prob * 0.85, s, (match) => {
            const mutated = match[0] === match[0].toUpperCase()
                ? rule.replacement.toUpperCase()
                : rule.replacement;
            log.push({ type: rule.type, original: match, mutated, position: -1 });
            return mutated;
        });
        s = simpleHash(s.toString() + rule.type);
    }
    const tokenRules = [
        { regex: /\bpeople\b/gi, replacement: "ppl", type: "rant_abbrev_ppl" },
        { regex: /\bsomething\b/gi, replacement: "sth", type: "rant_abbrev_sth" },
    ];
    for (const rule of tokenRules) {
        output = deterministicReplace(output, rule.regex, prob * 0.65, s, (match) => {
            const mutated = match[0] === match[0].toUpperCase()
                ? rule.replacement.toUpperCase()
                : rule.replacement;
            log.push({ type: rule.type, original: match, mutated, position: -1 });
            return mutated;
        });
        s = simpleHash(s.toString() + rule.type);
    }
    return output;
}
// M2: The Hyphen-Descriptor (self-created compound adjectives).
function applyHyphenDescriptor(text, prob, seed, log) {
    const raw = text || "";
    let s = seed;
    if (seededRandom(simpleHash(s.toString() + raw.slice(0, 12))) > prob * 0.55)
        return raw;
    const stop = new Set([
        "the", "a", "an", "to", "of", "in", "on", "for", "and", "or", "but", "with", "by", "as", "at", "from", "into",
    ]);
    const candidates = [];
    const re = /\b([A-Za-z]{3,12})\s+([A-Za-z]{3,12})\b/g;
    let m;
    while ((m = re.exec(raw))) {
        const w1 = m[1];
        const w2 = m[2];
        if (!w1 || !w2)
            continue;
        if (stop.has(w1.toLowerCase()) || stop.has(w2.toLowerCase()))
            continue;
        if (w1.includes("-") || w2.includes("-"))
            continue;
        if (w1[0] === w1[0].toUpperCase() && w2[0] === w2[0].toUpperCase())
            continue;
        candidates.push({ start: m.index, end: m.index + m[0].length, w1, w2, match: m[0] });
        if (candidates.length >= 12)
            break;
    }
    if (!candidates.length)
        return raw;
    s = simpleHash(s.toString() + "hyphen_descriptor_pick");
    const pick = candidates[Math.floor(seededRandom(s) * candidates.length)];
    if (!pick)
        return raw;
    const mutated = `${pick.w1}-${pick.w2}`;
    const out = raw.slice(0, pick.start) + mutated + raw.slice(pick.end);
    log.push({ type: "hyphen_descriptor", original: pick.match, mutated, position: pick.start });
    return out;
}
// M4: Syntactic Contrast Layer — self-correction markers (dashes/parentheses).
function applySelfCorrectionMarkers(text, prob, seed, log) {
    let s = seed;
    const sentences = String(text || "").split(/(?<=[.!?])\s+/);
    if (!sentences.length)
        return text;
    const eligible = sentences
        .map((sent, idx) => ({ sent, idx }))
        .filter(({ sent }) => sent.length > 70 && /\s/.test(sent));
    if (!eligible.length)
        return text;
    s = simpleHash(s.toString() + "self_correction_pick");
    if (seededRandom(s) > prob * 0.35)
        return text;
    const target = eligible[Math.floor(seededRandom(s + 1) * eligible.length)];
    if (!target)
        return text;
    const markerPool = [
        "— actually,",
        "(I mean)",
        "— I mean,",
        "(like)",
        ", really,",
        ", honestly,",
        ", so basically,",
        ", as it turns out,",
        ", to be fair,",
        "— if I'm being real,",
        "— honestly,",
        ", like I said,",
        ", wait, actually,",
        ", lowkey,",
        "— honestly though,"
    ];
    const marker = markerPool[Math.floor(seededRandom(s + 2) * markerPool.length)];
    const words = target.sent.split(/\s+/);
    const insertAt = Math.min(words.length - 2, 3 + Math.floor(seededRandom(s + 3) * 4)); // 3..6
    if (insertAt <= 1)
        return text;
    const rebuilt = [
        words.slice(0, insertAt).join(" "),
        marker,
        words.slice(insertAt).join(" "),
    ].join(" ");
    const nextSentences = sentences.slice();
    nextSentences[target.idx] = rebuilt.replace(/\s{2,}/g, " ").trim();
    log.push({ type: "self_correction", original: target.sent, mutated: nextSentences[target.idx], position: -1 });
    return nextSentences.join(" ");
}
/**
 * V25: Right Form of Verb (RFV) Engine
 * Injects common human verb-tense-subject errors.
 */
function applyRFVErrors(text, prob, seed, log) {
    let s = seed;
    let output = text;
    const rfvPatterns = [
        [/\b(he|she|it|The study)\s+has\b/gi, "$1 have"],
        [/\b(he|she|it|The analysis)\s+does\b/gi, "$1 do"],
        [/\b(did|does|do)\s+([a-z]+)ed\b/gi, "$1 $2"],
        [/\b(is|are|was|were)\s+think\b/gi, "$1 thinking"],
        [/\b(is|are|was|were)\s+suggest\b/gi, "$1 suggesting"],
        [/\bdiscuss\b/gi, "discuss about"],
        [/\bcope\s+with\b/gi, "cope up with"],
        [/\bexplain\s+to\s+me\b/gi, "explain me"],
        [/\brevert\b/gi, "revert back"],
        [/\bcomprise\b/gi, "comprise of"],
        // V26: Nuclear RFV (Dyslexic/Non-native high-entropy flips)
        [/\bwas\s+([a-z]+)ing\b/gi, "was $1ed"],
        [/\bis\s+([a-z]+)ed\b/gi, "is $1ing"]
    ];
    for (const [re, rep] of rfvPatterns) {
        if (seededRandom(s++) < prob * 0.6) { // V26: Increased density from 0.4
            const original = output;
            output = output.replace(re, rep);
            if (original !== output) {
                log.push({ type: "rfv_error", original, mutated: output, position: -1 });
            }
        }
    }
    // V26: Um/Uh Orality Markers
    if (seededRandom(s++) < 0.02 * (prob / 50)) {
        const markers = ["um, ", "uh, ", "like, "];
        const marker = markers[Math.floor(seededRandom(s++) * markers.length)];
        output = output.replace(/\b([A-Z][a-z]+)\b/, `$1, ${marker}`);
    }
    return output;
}
export const PERSONA_REGISTRY = {
    AUTO: { id: "AUTO", name: "Auto-DNA", icon: "🧬", rules: [], fillers: [], intensityBias: 1.0 },
    SA_RANTER: {
        id: "SA_RANTER", name: "South Asian Ranter", icon: "🇧🇩",
        rules: ["comma_splice", "missing_copula", "existential_error", "verb_tense", "fragments", "stutter", "rant_abbrev", "self_correction", "hyphen_descriptor"],
        fillers: ["basically", "bro", "actually", "honestly"],
        intensityBias: 1.2
    },
    SA_STUDENT: {
        id: "SA_STUDENT", name: "Formal Student", icon: "🇮🇳",
        rules: ["discuss_about", "revert_back", "article_overuse", "academic_hedge", "caps"],
        fillers: ["kindly", "respected", "in fact"],
        intensityBias: 0.8
    },
    MINIMALIST: {
        id: "MINIMALIST", name: "The Minimalist", icon: "📱",
        rules: ["determ_omission", "lowercase_start", "missing_comma", "rant_abbrev", "hyphen_descriptor"],
        fillers: ["tbh", "idk", "wdym"],
        intensityBias: 1.5
    },
    TAGLISH_PRO: {
        id: "TAGLISH_PRO", name: "Taglish Pro", icon: "🇵🇭",
        rules: ["already_tense", "already_suffix", "kindly_usage", "tense_flip"],
        fillers: ["already", "so yeah", "actually"],
        intensityBias: 1.0
    },
    SE_HYBRID: {
        id: "SE_HYBRID", name: "SE Asian Hybrid", icon: "🇲🇾",
        rules: ["lah_particle", "sih_particle", "article_flux", "jujurly_usage"],
        fillers: ["lah", "meh", "jujurly"],
        intensityBias: 1.1
    },
    DIRECT_TR: {
        id: "DIRECT_TR", name: "Direct Translator", icon: "🇹🇭",
        rules: ["tense_simplification", "same_same", "no_have", "softener_nha"],
        fillers: ["same same", "anyway", "nha"],
        intensityBias: 1.3
    },
    POLITE_ACHIEVER: {
        id: "POLITE_ACHIEVER", name: "Polite Achiever", icon: "🇯🇵",
        rules: ["honorifics", "excessive_modesty", "it_cant_be_helped", "apology_pattern"],
        fillers: ["sorry", "i will work hard", "shikata ga nai"],
        intensityBias: 0.7
    },
    GCC_EXPAT: {
        id: "GCC_EXPAT", name: "GCC Expat", icon: "🇦🇪",
        rules: ["lingua_franca", "do_the_needful", "third_space_pragmatics", "revert_back", "self_correction", "hyphen_descriptor"],
        fillers: ["kindly", "please", "revert"],
        intensityBias: 0.9
    },
    CENTRAL_ASIAN: {
        id: "CENTRAL_ASIAN", name: "Central Asian L2", icon: "🇺🇿",
        rules: ["russian_syntax", "missing_articles", "literal_idioms"],
        fillers: ["basically", "how to say", "look"],
        intensityBias: 1.1
    }
};
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
// ─── ASSIGNMENT MODE ERRORS (Tier 4-6) ───────────────────────────────────
function deterministicReplace(text, regex, prob, baseSeed, replacer) {
    let s = baseSeed;
    return text.replace(regex, (...args) => {
        const match = args[0];
        s = simpleHash(s.toString() + match);
        if (seededRandom(s) < prob) {
            return replacer(match, ...args.slice(1));
        }
        return match;
    });
}
function applyPunctuationSpacingBleed(text, prob, seed, log) {
    let output = text;
    const regex = /([a-zA-Z]+)([,.])/g;
    output = deterministicReplace(output, regex, prob, seed, (match, word, punc) => {
        const mutated = `${word} ${punc}`;
        log.push({ type: "punc_bleed", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyAcademicOverhedging(text, prob, seed, log) {
    let output = text;
    const hedgingMap = [
        { regex: /\b(indicates that|shows that)\b/i, replacement: "might possibly indicate that" },
        { regex: /\b(proves that|demonstrates that)\b/i, replacement: "could essentially demonstrate that" },
        { regex: /\b(is clear that|is evident that)\b/i, replacement: "can be argued that perhaps it is evident that" },
        { regex: /\b(implies that)\b/i, replacement: "seems to imply that maybe" }
    ];
    hedgingMap.forEach((rule, idx) => {
        output = deterministicReplace(output, rule.regex, prob, seed + idx, (match) => {
            let mutated = rule.replacement;
            if (match[0] === match[0].toUpperCase())
                mutated = mutated.charAt(0).toUpperCase() + mutated.slice(1);
            log.push({ type: "academic_hedge", original: match, mutated, position: -1 });
            return mutated;
        });
    });
    return output;
}
function applyReferenceFormattingChaos(text, prob, seed, log) {
    let output = text;
    // match standard citations like (Smith, 2020) and break them or et al.
    output = deterministicReplace(output, /\(et al\.\)/g, prob, seed, (match) => {
        const mutated = "(et. al.)";
        log.push({ type: "ref_chaos", original: match, mutated, position: -1 });
        return mutated;
    });
    output = deterministicReplace(output, /\b([A-Z][a-z]+),\s(\d{4})\)/g, prob, seed + 1, (match, name, year) => {
        // Drop the closing parenthesis occasionally
        const mutated = `${name}, ${year} `;
        log.push({ type: "ref_chaos_drop", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyLostSubjectBleed(text, prob, seed, log) {
    let output = text;
    // Insert redundant subject 'it' or 'they' after a complex noun phrase
    const regex = /\b(The (?:comprehensive|detailed|initial)?\s?[a-zA-Z]+\s(?:analysis|study|data|results|findings)+)\s+(shows|indicates|reveals|demonstrates)\b/ig;
    output = deterministicReplace(output, regex, prob * 0.5, seed, (match, subject, verb) => {
        const isPlural = /results|findings|data/i.test(subject);
        const pronoun = isPlural ? "they" : "it";
        // Avoid double pronoun if already there
        if (output.includes(`${subject}, ${pronoun} ${verb}`))
            return match;
        const mutated = `${subject}, ${pronoun} ${verb}`;
        log.push({ type: "lost_subject", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applySentenceFracture(text, prob, seed, log) {
    let output = text;
    // Match long dense sentences and forcibly slice them
    const regex = /([^.?!]{120,}) (which|that|because|since|as) ([^.?!]+)/i;
    output = deterministicReplace(output, regex, prob * 0.4, seed, (match, before, conj, after) => {
        // Fracture it
        const mutated = `${before.trim()}. This is ${after.trim()}`;
        log.push({ type: "sentence_fracture", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyEmDashInjection(text, prob, seed, log) {
    let output = text;
    // V6.0: Target more common AI structures for em-dash framing
    const regex = /\b(which is|that is|because it is|meaning that|essentially)\s+([a-zA-Z\s]{4,30})\b/gi;
    output = deterministicReplace(output, regex, prob * 0.7, seed, (match, phrase, rest) => {
        const mutated = `— ${phrase} ${rest} —`;
        log.push({ type: "em_dash_chaos", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyAcademicLinguisticInversion(text, prob, seed, log) {
    let output = text;
    const inversionMap = [
        { regex: /\bwe\s+rarely\s+see\b/gi, replacement: "rarely we see" },
        { regex: /\bit\s+hardly\s+matters\b/gi, replacement: "hardly it matters" },
        { regex: /\bthey\s+little\s+understood\b/gi, replacement: "little they understood" },
        { regex: /\bhe\s+only\s+knew\b/gi, replacement: "only he knew" },
        { regex: /\bthe\s+research\s+notably\s+fails\b/gi, replacement: "notably, the research fails" }
    ];
    inversionMap.forEach((rule) => {
        output = deterministicReplace(output, rule.regex, prob, seed, (match) => {
            log.push({ type: "linguistic_inversion", original: match, mutated: rule.replacement, position: -1 });
            return rule.replacement;
        });
    });
    return output;
}
function applyKeyboardProximityErrors(text, prob, seed, log) {
    let output = text;
    const keyboardMap = {
        'a': ['s', 'q', 'z'], 'e': ['r', 'w', 's'], 'i': ['u', 'o', 'k'],
        'o': ['i', 'p', 'l'], 'u': ['y', 'i', 'j'], 't': ['r', 'y', 'g'],
        'n': ['m', 'b', 'h'], 's': ['a', 'd', 'w'], 'r': ['e', 't', 'f']
    };
    const lines = output.split('\n');
    const processedLines = lines.map((line, lIdx) => {
        const words = line.split(/(\s+)/);
        // V7.1: Header Protection - skip lines that look like headers (short, many caps)
        if (words.length < 8)
            return line;
        const mutatedWords = words.map((word, wIdx) => {
            // V7.1: Strict Filtering
            // 1. Skip if short
            // 2. Skip if it starts with Uppercase (Proper nouns / Sentence starts)
            // 3. Skip if it's whitespace
            if (word.length < 8 || /^\s+$/.test(word) || /^[A-Z]/.test(word))
                return word;
            const s = simpleHash(seed.toString() + word + wIdx + lIdx);
            // V7.1: Drop prob to 5% of base density
            if (seededRandom(s) > prob * 0.05)
                return word;
            // 4. Positional protection: Only index 3 to length-2
            const charIdx = 3 + Math.floor(seededRandom(s + 1) * (word.length - 5));
            const char = word[charIdx].toLowerCase();
            const neighbors = keyboardMap[char];
            if (neighbors) {
                const neighbor = neighbors[Math.floor(seededRandom(s + 2) * neighbors.length)];
                const mutated = word.substring(0, charIdx) + neighbor + word.substring(charIdx + 1);
                log.push({ type: "keyboard_proximity", original: word, mutated, position: -1 });
                return mutated;
            }
            return word;
        });
        return mutatedWords.join('');
    });
    return processedLines.join('\n');
}
function applyAsianCollocationShift(text, prob, seed, log) {
    let output = text;
    const collocationMap = [
        { regex: /\b(discuss(?:ed|ing|es)?)\s+(the|a|an)\b/gi, replacement: "$1 about $2" },
        { regex: /\b(make|made|making)\s+(a|the)\s+decision\b/gi, replacement: "take $2 decision" },
        { regex: /\b(return(?:ed)?)\b/gi, replacement: "$1 back" },
        { regex: /\b(comprise(?:s|d)?)\b/gi, replacement: "$1 of" },
        { regex: /\b(cope)\s+with\b/gi, replacement: "$1 up with" },
        { regex: /\b(pay(?:ing)?)\s+attention\s+to\b/gi, replacement: "give attention on" },
        { regex: /\b(do|did|doing)\s+(an\s+)?exam/gi, replacement: "give $2exam" },
        { regex: /\b(revert(?:ed)?)\b/gi, replacement: "$1 back" }
    ];
    collocationMap.forEach((rule, idx) => {
        output = deterministicReplace(output, rule.regex, prob, seed + idx, (match, p1, p2) => {
            // rule.replacement can use matched groups, but our deterministicReplace passes them as args
            let mutated = rule.replacement.replace(/\$1/g, p1).replace(/\$2/g, p2 || '');
            // Match case of first letter
            if (match[0] === match[0].toUpperCase())
                mutated = mutated.charAt(0).toUpperCase() + mutated.slice(1);
            log.push({ type: "asian_colloc", original: match, mutated, position: -1 });
            return mutated;
        });
    });
    return output;
}
function applyDoubleAdverb(text, prob, seed, log) {
    let output = text;
    const regex = /\b(really|actually|basically|literally|genuinely)\s+([a-z]+)\b/gi;
    output = deterministicReplace(output, regex, prob * 0.6, seed, (match, adv, word) => {
        if (["really", "actually", "basically", "literally", "genuinely"].includes(word))
            return match;
        const secondAdv = adv.toLowerCase() === "really" ? "genuinely" : "really";
        let mutated = `${adv} ${secondAdv} ${word}`;
        if (adv[0] === adv[0].toUpperCase())
            mutated = mutated.charAt(0).toUpperCase() + mutated.slice(1);
        log.push({ type: "double_adverb", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applyStructuralInversion(text, prob, seed, log) {
    let output = text;
    // Match sentences starting with a prepositional phrase: "In the realm of X, Y happens."
    // Target: ^(Prepositional Phrase), (Main Clause)
    const regex = /^([A-Z][a-z\s]{3,25}),\s+([^.?!]+[.?!])$/gm;
    output = deterministicReplace(output, regex, prob * 0.7, seed, (match, prep, rest) => {
        // Flip: Rest + prep + . 
        // "Opportunities abound — especially in real estate."
        const cleanRest = rest.replace(/[.?!]$/, "").trim();
        const mutated = `${cleanRest.charAt(0).toUpperCase() + cleanRest.slice(1)} — particularly ${prep.toLowerCase()} — .`;
        log.push({ type: "structural_inversion", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
function applySemanticNoise(text, prob, seed, log) {
    let output = text;
    const fillers = ["actually", "basically", "literally", "to be honest", "honestly", "to some extent"];
    const regex = /(\b(?:is|are|was|were|has|have|can|could|will|would)\s+)([a-z]+)/gi;
    output = deterministicReplace(output, regex, prob * 0.5, seed, (match, verb, nextWord) => {
        const s = simpleHash(seed.toString() + match);
        const filler = fillers[Math.floor(seededRandom(s) * fillers.length)];
        const mutated = `${verb}${filler} ${nextWord}`;
        log.push({ type: "semantic_noise", original: match, mutated, position: -1 });
        return mutated;
    });
    return output;
}
/**
 * V9.0: Article Flux Mutation
 * Randomly omits or swaps articles (the, a, an) to mimic non-native human variance.
 */
function applyArticleFlux(text, prob, seed, log) {
    let s = seed;
    return text.replace(/\b(the|a|an)\b/gi, (match) => {
        s = simpleHash(s.toString() + match);
        if (seededRandom(s) > prob * 0.8)
            return match;
        const roll = seededRandom(s + 1);
        const lower = match.toLowerCase();
        if (roll < 0.7) {
            log.push({ type: "article_omission", original: match, mutated: "", position: -1 });
            return "";
        }
        const swaps = {
            "the": ["a", "an"], "a": ["the", "an"], "an": ["the", "a"]
        };
        const options = swaps[lower] || [];
        const replacement = options[Math.floor(seededRandom(s + 2) * options.length)];
        const cased = match[0] === match[0].toUpperCase()
            ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
            : replacement;
        log.push({ type: "article_swap", original: match, mutated: cased, position: -1 });
        return cased;
    }).replace(/\s{2,}/g, " ").trim();
}
/**
 * V9.0: Nuclear Grammar Chaos (Grammar Rule Splintering)
 */
function applyNuclearGrammarChaos(text, prob, seed, log) {
    let output = text;
    const rules = [
        { regex: /\b(is|was|has|does)\b/gi, swaps: ["are", "were", "have", "do"] },
        { regex: /\b(shows|indicates|requires|suggests|remains)\b/gi, swaps: ["showed", "indicated", "required", "suggested", "remained"] },
        { regex: /\b(I|He|She|They|We)\b/gi, swaps: ["me", "him", "her", "them", "us"] },
        { regex: /\b(in|on|at|of|for|with|by|from)\b/gi, swaps: ["at", "in", "of", "from", "on", "to", "at", "with"] },
        { regex: /\b(many|much|little|few)\b/gi, swaps: ["much", "many", "few", "little"] },
        { regex: /\b(it's|its)\b/gi, swaps: ["its", "it's"] }
    ];
    rules.forEach((rule, idx) => {
        output = deterministicReplace(output, rule.regex, prob * 0.9, seed + idx, (match) => {
            const options = rule.swaps;
            const lower = match.toLowerCase();
            const matchIdx = rule.regex.source.split('|').indexOf(lower.replace(/[\(\)\b]/g, ''));
            const replacement = matchIdx !== -1 && options[matchIdx] ? options[matchIdx] : options[Math.floor(seededRandom(seed + idx) * options.length)];
            let mutated = replacement;
            if (match[0] === match[0].toUpperCase())
                mutated = mutated.charAt(0).toUpperCase() + mutated.slice(1);
            log.push({ type: "nuclear_grammar", original: match, mutated, position: -1 });
            return mutated;
        });
    });
    return output;
}
const MUTATION_REGISTRY = [
    // Tier 1: Punctuation & Structure
    { name: "comma_splice", fn: applyCommaSplice, weight: 0.7 },
    { name: "missing_comma", fn: applyMissingExtraComma, weight: 0.75 },
    { name: "semicolon_misuse", fn: applySemicolonMisuse, weight: 0.5 },
    { name: "sentence_fragment", fn: applySentenceFragment, weight: 0.45 },
    { name: "period_boundary", fn: applyPeriodBoundaryChaos, weight: 0.4 },
    // Tier 2: South Asian L1 Structural Bleed
    { name: "double_subject", fn: applyDoubleSubject, weight: 0.6 },
    { name: "missing_copula", fn: applyMissingCopula, weight: 0.55 },
    { name: "existential_error", fn: applyExistentialError, weight: 0.6 },
    { name: "gerund_infinitive", fn: applyGerundInfinitiveConfusion, weight: 0.65 },
    { name: "word_order_bleed", fn: applyWordOrderBleed, weight: 0.45 },
    { name: "missing_auxiliary", fn: applyMissingAuxiliary, weight: 0.55 },
    // Tier 3: Academic-Specific
    { name: "pleonasm", fn: applyRedundancyPleonasm, weight: 0.7 },
    { name: "hedging_overload", fn: applyHedgingOverload, weight: 0.5 },
    { name: "passive_injection", fn: applyPassiveVoiceInjection, weight: 0.55 },
    { name: "conj_chain", fn: applyConjunctionChain, weight: 0.45 },
    { name: "tautology", fn: applyTautologicalPhrases, weight: 0.65 },
    // Tier 4: Pronoun & Agreement
    { name: "rel_pronoun", fn: applyWrongRelativePronoun, weight: 0.6 },
    { name: "det_omission", fn: applyDeterminerOmission, weight: 0.55 },
    // Tier 5: Anti-AI Fingerprint (Slider >= 40)
    { name: "could_of", fn: applyCouldOfError, weight: 0.5, range: [40, 100] },
    { name: "cond_mood", fn: applyConditionalMoodError, weight: 0.55, range: [40, 100] },
    { name: "subjunctive", fn: applySubjunctiveAvoidance, weight: 0.6, range: [40, 100] },
    { name: "hyper_I", fn: applyHypercorrectionI, weight: 0.55, range: [40, 100] },
    { name: "comma_that", fn: applyCommaBeforeThat, weight: 0.65, range: [40, 100] },
    { name: "parallel_break", fn: applyParallelismBreak, weight: 0.5, range: [40, 100] },
    { name: "which_no_comma", fn: applyWhichWithoutComma, weight: 0.6, range: [40, 100] },
    // Tier 6: Eastern L1 Deep (Slider >= 60)
    { name: "stative_prog", fn: applyStativeProgressive, weight: 0.6, range: [60, 100] },
    { name: "though_but", fn: applyThoughButDouble, weight: 0.55, range: [60, 100] },
    { name: "tag_question", fn: applyUniversalTagQuestion, weight: 0.5, range: [60, 100] },
    { name: "since_for", fn: applySinceForConfusion, weight: 0.55, range: [60, 100] },
    { name: "plural_omission", fn: applyPluralMarkingOmission, weight: 0.5, range: [60, 100] },
    { name: "gender_pronoun", fn: applyGenderPronounConfusion, weight: 0.45, range: [60, 100] },
    { name: "perfect_past", fn: applyPerfectPastConfusion, weight: 0.5, range: [60, 100] },
    { name: "article_overuse", fn: applyArticleOveruse, weight: 0.55, range: [60, 100] },
    { name: "already_tense", fn: applyAlreadyTenseMarker, weight: 0.45, range: [60, 100] },
    // Tier 7: South Asian Academic Fingerprint (Slider >= 60)
    { name: "cope_up", fn: applyCopeUpWith, weight: 0.6, range: [60, 100] },
    { name: "discuss_about", fn: applyDiscussAbout, weight: 0.65, range: [60, 100] },
    { name: "comprise_of", fn: applyCompriseOf, weight: 0.55, range: [60, 100] },
    { name: "revert_back", fn: applyRevertBack, weight: 0.6, range: [60, 100] },
    { name: "explain_me", fn: applyExplainMePattern, weight: 0.55, range: [60, 100] },
    // Original Basics
    { name: "verb_tense", fn: applyVerbTenseChaos, weight: 0.7 },
    { name: "articles", fn: applyArticleErrors, weight: 0.8 },
    { name: "prepositions", fn: applyPrepositionErrors, weight: 0.75 },
    { name: "agreement", fn: applyAgreementErrors, weight: 0.65 },
    { name: "spelling", fn: applySpellingErrors, weight: 0.85 },
    { name: "noun_plural", fn: applyNounPluralErrors, weight: 0.8 },
    { name: "confused_words", fn: applyConfusedWords, weight: 0.6 },
    { name: "l1_interfere", fn: applyL1Interference, weight: 0.5 },
    { name: "dbl_comp", fn: applyDoubleComparatives, weight: 0.5 },
    { name: "am_br", fn: applyAmBrMix, weight: 0.55 },
    { name: "transitions", fn: applyTransitionChaos, weight: 0.4 },
    { name: "quantifiers", fn: applyQuantifierErrors, weight: 0.55 },
    { name: "run_ons", fn: applyRunOnFragments, weight: 0.35 },
    { name: "caps", fn: applyCapitalizationErrors, weight: 0.4 },
    { name: "collocations", fn: applyWrongCollocations, weight: 0.6 },
    // Advanced Assignment Mode Chaos
    { name: "academic_hedge", fn: applyAcademicOverhedging, weight: 0.75 },
    { name: "ref_chaos", fn: applyReferenceFormattingChaos, weight: 0.9 },
    { name: "lost_subj", fn: applyLostSubjectBleed, weight: 0.6 },
    { name: "fracture", fn: applySentenceFracture, weight: 0.7 },
    { name: "em_dash", fn: applyEmDashInjection, weight: 0.65 },
    { name: "asian_colloc", fn: applyAsianCollocationShift, weight: 0.9 },
    { name: "dbl_adv", fn: applyDoubleAdverb, weight: 0.8 },
    { name: "struct_inversion", fn: applyStructuralInversion, weight: 0.85 },
    { name: "semantic_noise", fn: applySemanticNoise, weight: 0.15 },
    { name: "ling_inversion", fn: applyAcademicLinguisticInversion, weight: 0.8 },
    { name: "keyboard_prox", fn: applyKeyboardProximityErrors, weight: 0.5 },
    { name: "punc_spacing", fn: applyPunctuationSpacingBleed, weight: 0.35 },
    { name: "article_flux", fn: applyArticleFlux, weight: 0.85 },
    { name: "nuclear_grammar", fn: applyNuclearGrammarChaos, weight: 0.95 },
    { name: "v10_fracture", fn: applyRadicalSentenceFracture, weight: 1.0 },
    { name: "v10_spacing", fn: applyStochasticDoubleSpacing, weight: 1.0 },
    { name: "v11_regression", fn: applyVocabularyRegression, weight: 1.0 },
    // Pan-Asian Specialty Layer (V20)
    { name: "already_suffix", fn: applyAlreadySuffixPH, weight: 1.0 },
    { name: "lah_particle", fn: applyLahParticleMYID, weight: 0.8 },
    { name: "jujurly_usage", fn: applyJujurlyHonestly, weight: 0.9 },
    { name: "tense_simplification", fn: applyTenseSimplificationTHVN, weight: 1.1 },
    { name: "honorifics", fn: applyJapaneseHonorifics, weight: 0.7 },
    { name: "lowercase_start", fn: applyLowercaseStart, weight: 1.5 },
    // V20: Specialized layers requested in the Implementation Plan
    { name: "rant_abbrev", fn: applyRantAbbreviator, weight: 1.0, range: [70, 100] },
    { name: "hyphen_descriptor", fn: applyHyphenDescriptor, weight: 0.65, range: [55, 100] },
    { name: "self_correction", fn: applySelfCorrectionMarkers, weight: 0.8, range: [55, 100] },
    { name: "rfv_engine", fn: applyRFVErrors, weight: 0.9, range: [40, 100] }
];
/**
 * V11/V12: Vocabulary Regression & L1 Rhythm
 * Replaces high-probability AI academic jargon with high-perplexity human synonyms.
 */
function applyVocabularyRegression(text, prob, seed, log) {
    let output = text;
    let s = seed;
    const regressionMap = {
        "significantly": ["real much", "a lot", "very much", "so much"],
        "therefore": ["so", "that's why", "which means"],
        "furthermore": ["and one more thing", "plus", "moving on", "another point is"],
        "however": ["but", "even so", "still"],
        "nevertheless": ["but still", "anyway", "even then"],
        "indicated": ["showed", "said", "made it clear"],
        "demonstrates": ["shows", "proves it"],
        "utilized": ["used", "put to use"],
        "substantial": ["big", "large", "huge", "massive"],
        "consequently": ["so", "as a result", "finally"],
        "complex": ["hard", "difficult", "very confusing"],
        "merely": ["just", "only", "simply"],
        "regarding": ["about", "on the topic of"],
        "requires": ["needs", "wants"],
        "indicates": ["shows", "means"],
        "unprecedented": ["never seen before", "real new", "totally unique"],
        "collision": ["clash", "fight", "hit"],
        "aspirations": ["hopes", "dreams", "wishes"],
        "transformative": ["big change", "deep change"],
        "paradoxically": ["strangely enough", "funny thing is"],
        "fundamental": ["basic", "root"]
    };
    const words = Object.keys(regressionMap);
    words.forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        output = deterministicReplace(output, regex, prob * 1.0, s++, (match) => {
            const options = regressionMap[word.toLowerCase()];
            const replacement = options[Math.floor(seededRandom(s++) * options.length)];
            let mutated = replacement;
            if (match[0] === match[0].toUpperCase())
                mutated = mutated.charAt(0).toUpperCase() + mutated.slice(1);
            log.push({ type: "v11_regression", original: match, mutated, position: -1 });
            return mutated;
        });
    });
    // V12: L1 Rhythm Injection (Non-native patterns)
    const l1Patterns = [
        { regex: /\bdiscuss\b/gi, replacement: "discuss about" },
        { regex: /\breturn\b/gi, replacement: "return back" },
        { regex: /\bwill be\b/gi, replacement: "will being" },
        { regex: /\bwas shown\b/gi, replacement: "was showed" },
        { regex: /\bdid not\b\s+(\w+ed)\b/gi, replacement: "did not $1" } // e.g. did not went
    ];
    l1Patterns.forEach(p => {
        output = deterministicReplace(output, p.regex, prob * 0.5, s++, (match) => {
            const muted = match.replace(p.regex, p.replacement);
            log.push({ type: "l1_rhythm", original: match, mutated: muted, position: -1 });
            return muted;
        });
    });
    return output;
}
/**
 * V10: Radical Sentence Fracture
 */
function applyRadicalSentenceFracture(text, prob, seed, log) {
    if (text.split(/\s+/).length < 20)
        return text;
    const sentences = text.split(/(?<=[.!?])\s+/);
    let s = seed;
    const processed = sentences.map((sentence) => {
        const words = sentence.split(/\s+/);
        if (words.length < 10)
            return sentence; // Shorten threshold for V12
        s = simpleHash(s.toString() + sentence);
        if (seededRandom(s) > prob * 1.0)
            return sentence;
        // Nuclear split at middle comma or conjunction
        const splitRegex = /(.{15,60}),\s*(and|but|which|that|who|because|although)\s*(.{15,})/i;
        const match = sentence.match(splitRegex);
        if (match) {
            const mutated = `${match[1]}. ${match[2].charAt(0).toUpperCase() + match[2].slice(1)} ${match[3]}`;
            log.push({ type: "v10_fracture", original: sentence, mutated, position: -1 });
            return mutated;
        }
        return sentence;
    });
    return processed.join(' ');
}
/**
 * V10: Stochastic Double Spacing
 */
function applyStochasticDoubleSpacing(text, prob, seed, log) {
    const words = text.split(/\s+/);
    let s = seed;
    let output = "";
    for (let i = 0; i < words.length; i++) {
        output += words[i];
        if (i < words.length - 1) {
            s = simpleHash(s.toString() + words[i]);
            if (seededRandom(s) < prob * 0.4) {
                output += "  ";
                log.push({ type: "v10_spacing", original: " ", mutated: "  ", position: -1 });
            }
            else {
                output += " ";
            }
        }
    }
    return output;
}
/**
 * V14: Century Edition (Random Noise Engine)
 * This is a massive deterministic rule engine containing 100+ mutation patterns.
 * Layer 1 & 2: SVA, Tense, Articles, Prepositions.
 */
function applyCenturyNoise(text, prob, seed, log) {
    let output = text;
    let s = seed;
    const centuryRules = [
        // --- LAYER 1: Subject-Verb Agreement (SVA) ---
        { name: "c14_sva_1", regex: /\b(he|she|it|this|that)\s+(\w+)\b/gi, category: 0, replacement: (m, p1, p2) => {
                if (p2.endsWith('s') || p2.endsWith('es'))
                    return p1 + " " + p2.slice(0, -1); // Force break Correct -> Wrong
                return p1 + " " + p2 + "s"; // Force break Wrong -> Correct (confuses detectors)
            } },
        { name: "c14_sva_2", regex: /\b(they|we|you|these|those|people|students|results)\s+(\w+s)\b/gi, category: 1, replacement: "$1 $2_REMOVE_S" },
        { name: "c14_sva_3", regex: /\bthere\s+is\s+(\w+s)\b/gi, category: 1, replacement: "there is $1" }, // AI always says "there are"
        { name: "c14_sva_4", regex: /\beveryone\s+have\b/gi, category: 0, replacement: "everyone have" },
        { name: "c14_sva_5", regex: /\bthe\s+quality\s+of\s+(\w+s)\s+are\b/gi, category: 1, replacement: "the quality of $1 are" },
        // --- LAYER 1: Tense & Aspect ---
        { name: "c14_tense_1", regex: /\b(have|has|had)\s+(\w+ed)\b/gi, category: 2, replacement: (m, p1, p2) => {
                return p1 + " " + p2.replace(/ed$/, ""); // I have work yesterday
            } },
        { name: "c14_tense_2", regex: /\byesterday\b(.*?)\b(is|are|am)\b/gi, category: 3, replacement: "yesterday $1 was" },
        { name: "c14_tense_3", regex: /\b(will|shall|can|must)\s+(\w+s)\b/gi, category: 4, replacement: "$1 $2" },
        { name: "c14_tense_4", regex: /\bi\s+am\s+knowing\b/gi, category: 3, replacement: "I am knowing" }, // Progressing stative verbs
        { name: "c14_tense_5", regex: /\bdid\s+not\s+(\w+ed)\b/gi, category: 2, replacement: "did not $1" },
        // --- LAYER 2: Articles & Determiners ---
        { name: "c14_art_1", regex: /\b(the|a|an)\b\s+([A-Z]\w+)\b/g, category: 5, replacement: "$2" }, // Omit articles before proper nouns
        { name: "c14_art_2", regex: /\b(information|equipment|furniture|knowledge|homework)\b/gi, category: 6, replacement: "$1s" }, // False pluralization
        { name: "c14_art_3", regex: /\bmany\s+(water|money|evidence|advice)\b/gi, category: 7, replacement: "many $1" },
        { name: "c14_art_4", regex: /\ba\s+apple\b/gi, category: 5, replacement: "a apple" },
        { name: "c14_art_5", regex: /\bthe\s+happiness\b/gi, category: 6, replacement: "the happiness" },
        // --- LAYER 2: Prepositions ---
        { name: "c14_prep_1", regex: /\bin\b\s+the\s+(bus|car|plane|train)\b/gi, category: 8, replacement: "at the $1" },
        { name: "c14_prep_2", regex: /\bdiscuss\b\s+about\b/gi, category: 9, replacement: "discuss about" },
        { name: "c14_prep_3", regex: /\breturn\b\s+back\b/gi, category: 10, replacement: "return back" },
        { name: "c14_prep_4", regex: /\border\b\s+for\b/gi, category: 9, replacement: "order for" },
        { name: "c14_prep_5", regex: /\binterested\b\s+with\b/gi, category: 10, replacement: "interested with" },
        // --- LAYER 3: Syntax & Word Order ---
        { name: "c14_syn_1", regex: /\b(What|How|Why|Where|When)\b\s+(is|are|am|was|were|do|does|did)\b\s+(he|she|it|they|we|you)\b/gi, category: 11, replacement: "$1 $3 $2" }, // Failed question inversion
        { name: "c14_syn_2", regex: /\b(don't|doesn't|didn't|cannot|never)\s+know\s+anything\b/gi, category: 12, replacement: "$1 know nothing" }, // Double negative
        { name: "c14_syn_3", regex: /\balmost\b\s+(\w+)\b/gi, category: 13, replacement: (m, p1) => {
                return p1 + " almost"; // Misplaced adverb
            } },
        { name: "c14_syn_4", regex: /\b(he|she|they|we)\s+speaks\s+well\s+English\b/gi, category: 11, replacement: "$1 speaks well English" },
        { name: "c14_syn_5", regex: /\bto\s+boldly\s+go\b/gi, category: 14, replacement: "to boldly go" }, // Split infinitive (AI usually avoids)
        { name: "c14_syn_6", regex: /\ba\s+red\s+big\s+car\b/gi, category: 14, replacement: "a red big car" }, // Adjective order slip
        { name: "c14_syn_7", regex: /\bonly\s+have\s+one\b/gi, category: 11, replacement: "only have one" },
        { name: "c14_syn_8", regex: /\btell\s+me\s+what\s+(is|are|was|were)\b\s+(\w+)\b/gi, category: 12, replacement: "tell me what $1 $2" }, // Indirect question flip
        { name: "c14_syn_9", regex: /\breally\s+like\b/gi, category: 13, replacement: "like real much" },
        { name: "c14_syn_10", regex: /\bcannot\b\s+able\s+to\b/gi, category: 11, replacement: "cannot able to" },
        // --- LAYER 4: L1 South Asian Human Patterns ---
        { name: "c14_l1_1", regex: /\bcope\b\s+with\b/gi, category: 15, replacement: "cope up with" },
        { name: "c14_l1_2", regex: /\bmention\b\s+about\b/gi, category: 16, replacement: "mention about" },
        { name: "c14_l1_3", regex: /\brevert\b\s+back\b/gi, category: 16, replacement: "revert back" },
        { name: "c14_l1_4", regex: /\bexplain\b\s+me\b/gi, category: 17, replacement: "explain me" },
        { name: "c14_l1_5", regex: /\bmistake\b/gi, category: 15, swaps: ["did a mistake", "committed a mistake"] },
        { name: "c14_l1_6", regex: /\b(the|this)\b\s+same\b\s+(\w+)\b/gi, category: 15, replacement: "the same $2" },
        { name: "c14_l1_7", regex: /\bI\s+will\s+return\b/gi, category: 16, replacement: "I will be returning back" },
        { name: "c14_l1_8", regex: /\bit\s+is\s+happening\b/gi, category: 15, replacement: "it is happened" },
        { name: "c14_l1_9", regex: /\bwe\s+shall\b\s+(\w+)\b/gi, category: 16, replacement: "we will be $1ing" },
        { name: "c14_l1_10", regex: /\bvery\s+(good|nice|big|huge)\b/gi, category: 18, replacement: "real much $1" },
        // --- LAYER 5: Nuclear Entropy Protocol (V15) ---
        { name: "v15_stutter_1", regex: /\b(the|it|to|of|and|but|that|was)\b\s+(\1)\b/gi, category: 19, replacement: "$1 $2" }, // Keep existing stutter if any (identity swap)
        { name: "v15_stutter_2", regex: /\b(the|it|is|this)\b/gi, category: 19, replacement: (m) => {
                return Math.random() < 0.05 ? `${m} ${m}` : m; // Force stutter repetition
            } },
        { name: "v15_aside_1", regex: /(?<=[.!?])\s+/g, category: 20, replacement: (m) => {
                const asides = [", actually, ", ", I guess, ", ", sort of, ", ", basically, ", " — actually, "];
                return Math.random() < 0.06 ? asides[Math.floor(Math.random() * asides.length)] : m;
            } },
        { name: "v15_focus_1", regex: /\b(that|this|it)\./gi, category: 24, replacement: "$1 itself." }, // South Asian focus: "it itself."
        { name: "v15_focus_2", regex: /\b(\w+)ing\./gi, category: 25, replacement: "$1ing only." }, // "doing only."
        { name: "v15_shatter_1", regex: /\b(although|because|while|since)\b/gi, category: 22, replacement: (m) => {
                return Math.random() < 0.2 ? `. ${m.charAt(0).toUpperCase() + m.slice(1)}` : m; // Fragment the clause
            } },
        { name: "v15_jitter_1", regex: /\b([a-z])([a-z]+)\b/gi, category: 34, replacement: (m, p1, p2) => {
                // Occasional random mid-sentence capital for emphasis (human artifact)
                return Math.random() < 0.02 ? p1.toUpperCase() + p2 : m;
            } },
        // --- LAYER 6: Ghost Protocol (V16) ---
        { name: "v16_struct_1", regex: /(?<=[.!?])\s+([A-Z]\w+)\b/g, category: 26, replacement: (m, p1) => {
                const padding = [
                    " In fact, I guess, ",
                    " If we look at it carefully, ",
                    " Actually, what I think is, ",
                    " In the current scenario, ",
                    " Basically, I'd say ",
                    " To be honest, maybe, "
                ];
                return Math.random() < 0.08 ? padding[Math.floor(Math.random() * padding.length)] + p1.toLowerCase() : m;
            } },
        { name: "v16_dilution_1", regex: /(?<=[.!?])\s+/g, category: 28, replacement: (m) => {
                const rephrase = [
                    " I mean, it's like this only. ",
                    " Which means that it's quite important. ",
                    " Again, I should mention this. ",
                    " That's what I was telling. "
                ];
                return Math.random() < 0.05 ? rephrase[Math.floor(Math.random() * rephrase.length)] : m;
            } },
        { name: "v16_logic_1", regex: /\b(Furthermore|Consequently|Moreover|Therefore|In addition)\b/gi, category: 29, replacement: (m) => {
                const wordy = ["On top of that,", "And here's the thing,", "What I should mention is,", "Going further,", "Now,", "At this point,", "So,", "Here,"];
                return Math.random() < 0.25 ? wordy[Math.floor(Math.random() * wordy.length)] : m;
            } },
        // --- LAYER 7: The Intro Breaker (V17 - Context Aware) ---
        { name: "v17_intro_1", regex: /\bprofound\s+paradigm\s+shift\b/gi, category: 30, replacement: "real huge deep change" },
        { name: "v17_intro_2", regex: /\bsystemic\s+rupture\b/gi, category: 31, replacement: "massive breaking point" },
        { name: "v17_intro_3", regex: /\bsignificant\s+mandate\b/gi, category: 32, replacement: "big order" },
        { name: "v17_intro_4", regex: /\balgorithmic\s+statecraft\b/gi, category: 33, replacement: "computerized way for ruling" },
        { name: "v17_intro_5", regex: /\bfoundational\s+infrastructure\b/gi, category: 33, replacement: "basic building blocks" }
    ];
    // V19 QUANTUM CHAOS SEQUENCER
    // Deterministic shuffle of category IDs [0..34] per document
    const categoryPool = Array.from({ length: 35 }, (_, i) => i);
    // Fisher-Yates Shuffle based on base seed
    for (let i = categoryPool.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [categoryPool[i], categoryPool[j]] = [categoryPool[j], categoryPool[i]];
    }
    // Sentence-specific target from the shuffled deck
    const sentenceMutationID = categoryPool[seed % categoryPool.length];
    centuryRules.forEach((rule, idx) => {
        // Quantum Chaos Selection: Only apply if it's the target DNA for this specific sentence
        if (rule.category !== undefined && rule.category !== sentenceMutationID)
            return;
        // Dynamic Seeded Chaos: Shift probability based on rule index and base seed
        const ruleSeed = simpleHash(s.toString() + rule.name);
        // V19: High-Intensity targeted chaos
        let ruleProb = prob * (0.8 + seededRandom(ruleSeed) * 0.4);
        if (rule.category === sentenceMutationID)
            ruleProb *= 2.0;
        if (rule.name.startsWith("v17"))
            ruleProb *= 1.5; // Always keep intro softening alive
        output = deterministicReplace(output, rule.regex, ruleProb, s + idx, (match, ...args) => {
            let mutated;
            if (typeof rule.replacement === 'function') {
                mutated = rule.replacement(match, ...args.slice(0, -2));
            }
            else {
                mutated = match.replace(rule.regex, rule.replacement).replace("_REMOVE_S", (m) => "");
                // Post-processing for _REMOVE_S logic
                if (mutated.includes("_REMOVE_S")) {
                    mutated = mutated.replace(/s_REMOVE_S/gi, "").replace(/_REMOVE_S/gi, "");
                }
            }
            log.push({ type: rule.name, original: match, mutated, position: -1 });
            return mutated;
        });
    });
    return output;
}
/**
 * V13: Asian Grammar Net (Sovereign Mode)
 */
function applyAsianGrammarNet(text, prob, seed, log) {
    // Legacy pass for V13, integrated into Century Edition in V14
    return applyCenturyNoise(text, prob, seed, log);
}
/**
 * Main Error Injection Engine — V8.0 STOCHASTIC ORCHESTRATOR
 * Splits text into sentences and applies a random subset of mutations per sentence.
 */
/**
 * Main Error Injection Engine — Ghost V22 COGNITIVE STATE MACHINE
 *
 * ARCHITECTURE: Instead of smooth pseudo-random distribution, this engine
 * models 4 mental states that transition stochastically:
 *   FOCUSED   → 0-1 errors, clean grammar, no fillers
 *   NEUTRAL   → 1-3 errors, light noise
 *   DISTRACTED → 3-6 errors, heavy noise, fillers cluster here
 *   FATIGUED  → 2-4 errors but DIFFERENT types (lazy errors, not chaotic)
 *
 * Each sentence gets a unique "cognitive fingerprint" derived from:
 *   - Content hash (what the sentence says)
 *   - Position hash (where it is in the document)
 *   - Previous sentence hash (path-dependent chaos)
 *   - Paragraph mood hash (paragraph-level personality shifts)
 */
export function applyHumanErrors(text, config) {
    if (!text || config.chaosThreshold <= 0) {
        return { text, mutations: [], persona: config.persona || "AUTO" };
    }
    // 1. Resolve Persona
    const baseSeed = simpleHash(config.dnaSeed || "ghost_v22_dna");
    let activePersonaID = config.persona || "AUTO";
    if (activePersonaID === "AUTO") {
        const ids = Object.keys(PERSONA_REGISTRY).filter(id => id !== "AUTO");
        activePersonaID = ids[baseSeed % ids.length];
    }
    const persona = PERSONA_REGISTRY[activePersonaID];
    // 2. Base Intensity Scaling
    let extremeMul = config.extremeMultiplier || 1.0;
    if (config.assignmentMode)
        extremeMul *= 1.5;
    const intensityScalarRaw = typeof config.personaIntensity === "number" ? config.personaIntensity : 1.0;
    const intensityScalar = Math.max(0.1, Math.min(1.0, intensityScalarRaw));
    let baseDensity = (config.chaosThreshold / 100) * config.errorFactor * extremeMul * persona.intensityBias * intensityScalar;
    if (config.isAcademic)
        baseDensity = Math.min(baseDensity, 0.95);
    let mutations = [];
    // Error budgets per state: [min, max] errors to apply
    const STATE_BUDGETS = {
        FOCUSED: [0, 1],
        NEUTRAL: [1, 3],
        DISTRACTED: [3, 7],
        FATIGUED: [1, 4],
    };
    // State transition probabilities (Markov chain)
    // Read as: from STATE_X, probability of going to [FOCUSED, NEUTRAL, DISTRACTED, FATIGUED]
    const STATE_TRANSITIONS = {
        FOCUSED: [0.30, 0.45, 0.15, 0.10], // Focused tends to stay focused or go neutral
        NEUTRAL: [0.15, 0.35, 0.30, 0.20], // Neutral is the crossroads
        DISTRACTED: [0.05, 0.25, 0.40, 0.30], // Distracted tends to stay distracted or get fatigued
        FATIGUED: [0.10, 0.30, 0.25, 0.35], // Fatigued can recover to neutral or stay fatigued
    };
    const STATES = ["FOCUSED", "NEUTRAL", "DISTRACTED", "FATIGUED"];
    // Error type affinities per state:
    // FOCUSED → spelling only (typos from fast typing)
    // NEUTRAL → articles, prepositions (background L1 noise)
    // DISTRACTED → everything (chaos mode)
    // FATIGUED → run-ons, missing words, lazy grammar (low-effort errors)
    const STATE_AFFINITIES = {
        FOCUSED: ["spelling", "keyboard_prox"], // Only typos
        NEUTRAL: ["articles", "prepositions", "agreement", "article_flux", "confused_words"], // L1 background
        DISTRACTED: [], // Empty = ALL mutations are valid (chaos mode)
        FATIGUED: ["run_ons", "fracture", "v10_fracture", "caps", "conj_chain", "lost_subj", "verb_tense"], // Lazy errors
    };
    // Transition function
    function transitionState(currentState, seed) {
        const probs = STATE_TRANSITIONS[currentState];
        const r = seededRandom(seed);
        let cumulative = 0;
        for (let i = 0; i < probs.length; i++) {
            cumulative += probs[i];
            if (r < cumulative)
                return STATES[i];
        }
        return "NEUTRAL";
    }
    // Multi-source entropy: combines 4 independent hash sources
    function cognitiveEntropy(content, pIdx, sIdx, prevHash) {
        const contentHash = simpleHash(content.substring(0, 30));
        const positionHash = simpleHash(`pos_${pIdx}_${sIdx}`);
        const prevDep = simpleHash(`prev_${prevHash}`); // Path-dependent!
        const paraHash = simpleHash(`para_mood_${pIdx}_${content.length}`);
        // XOR combine for maximum entropy
        return Math.abs(contentHash ^ positionHash ^ prevDep ^ paraHash);
    }
    // Sentence fingerprint for uniqueness enforcement
    const sentenceFingerprints = new Set();
    // ═══════════════════════════════════════════════════════════════════
    // V22: PROCESS WITH COGNITIVE STATE
    // ═══════════════════════════════════════════════════════════════════
    let globalState = "FOCUSED"; // Always start focused
    let prevSentenceHash = baseSeed;
    let globalSentenceIndex = 0;
    const paragraphs = text.split(/\n\n+/);
    const totalGlobalSentences = text.split(/(?<=[.!?])\s+/).length;
    const processedParagraphs = paragraphs.map((para, pIdx) => {
        if (para.trim().length === 0)
            return para;
        if (para.length < 100 && /^[A-Z][^a-z]*$/.test(para))
            return para;
        // V22: Paragraph-level mood — each paragraph gets a slight personality shift
        const paraMoodSeed = simpleHash(`mood_${pIdx}_${para.substring(0, 20)}`);
        const paraMoodShift = seededRandom(paraMoodSeed) * 0.4 - 0.2; // -0.2 to +0.2 density shift
        const sentences = para.split(/(?<=[.!?])\s+/);
        const processedSentences = sentences.map((sent, sIdx) => {
            let mutatedSent = sent;
            globalSentenceIndex++;
            // ─── V22: COGNITIVE STATE TRANSITION ─────────────────────
            const entropy = cognitiveEntropy(sent, pIdx, sIdx, prevSentenceHash);
            globalState = transitionState(globalState, entropy);
            // V21 Guard-Drop influence: push toward DISTRACTED/FATIGUED in back half
            const globalProgress = totalGlobalSentences > 1 ? globalSentenceIndex / totalGlobalSentences : 0;
            if (globalProgress > 0.6 && seededRandom(entropy + 1) < 0.3) {
                globalState = seededRandom(entropy + 2) < 0.5 ? "DISTRACTED" : "FATIGUED";
            }
            if (globalProgress < 0.15 && seededRandom(entropy + 3) < 0.5) {
                globalState = "FOCUSED"; // Force clean start
            }
            // ─── V22: ERROR BUDGET (Not probability!) ────────────────
            const [budgetMin, budgetMax] = STATE_BUDGETS[globalState];
            const budgetRange = budgetMax - budgetMin;
            // Non-uniform budget: use entropy, not seededRandom, for extreme variance
            const rawBudget = budgetMin + Math.floor(seededRandom(entropy + 7) * (budgetRange + 1));
            const scaledBudget = Math.round(rawBudget * baseDensity * (1.0 + paraMoodShift));
            const errorBudget = Math.max(0, Math.min(validPool_length(), scaledBudget));
            // ─── V22: FILTER MUTATIONS BY STATE AFFINITY ─────────────
            const stateAffinity = STATE_AFFINITIES[globalState];
            const validPool = MUTATION_REGISTRY.filter(m => {
                if (m.range && (config.chaosThreshold < m.range[0] || config.chaosThreshold > m.range[1]))
                    return false;
                // In DISTRACTED state, everything passes (empty affinity = all valid)
                if (stateAffinity.length > 0 && !stateAffinity.includes(m.name)) {
                    // Non-affinity rules get through at reduced rate based on state
                    const bleedThrough = globalState === "FOCUSED" ? 0.05 : 0.25;
                    if (seededRandom(entropy + simpleHash(m.name)) > bleedThrough)
                        return false;
                }
                // Persona DNA check
                if (activePersonaID !== "AUTO") {
                    const pRules = persona.rules;
                    if (!pRules.includes(m.name) && seededRandom(entropy + 99) > 0.2)
                        return false;
                }
                return true;
            });
            // ─── V22: BUDGET-BASED SELECTION (NOT probability-based) ──
            // Instead of "each rule has X% chance", we say "pick exactly N rules"
            // This creates natural clustering: some sentences get 0 errors, some get 7
            const selectedIndices = new Set();
            // Shuffle the valid pool using Fisher-Yates with cognitive entropy
            const shuffledPool = validPool.map((_, i) => i);
            for (let i = shuffledPool.length - 1; i > 0; i--) {
                const j = Math.floor(seededRandom(entropy + i + 50) * (i + 1));
                [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
            }
            // Take exactly `errorBudget` items from the shuffled pool
            for (let i = 0; i < Math.min(errorBudget, shuffledPool.length); i++) {
                selectedIndices.add(shuffledPool[i]);
            }
            // Persona signature enforcement
            if (activePersonaID !== "AUTO" && persona?.rules?.length && globalState !== "FOCUSED") {
                const mustInclude = ["already_suffix", "rant_abbrev", "hyphen_descriptor", "self_correction", "lah_particle"];
                for (const ruleName of mustInclude) {
                    if (!persona.rules.includes(ruleName))
                        continue;
                    const idx = validPool.findIndex((m) => m.name === ruleName);
                    if (idx >= 0 && seededRandom(entropy + 200) < 0.4)
                        selectedIndices.add(idx);
                }
            }
            // ─── V22: APPLY WITH VARIABLE INTENSITY ──────────────────
            // Each selected mutation gets a RANDOM intensity (0.3 to 1.5) — not uniform!
            Array.from(selectedIndices).forEach((idx, iter) => {
                const m = validPool[idx];
                const iterSeed = simpleHash(entropy.toString() + iter + m.name);
                // V22: Variable intensity per mutation (extreme randomness)
                const intensityJitter = 0.3 + seededRandom(iterSeed + 33) * 1.2; // 0.3x to 1.5x
                mutatedSent = m.fn(mutatedSent, baseDensity * m.weight * intensityJitter, iterSeed, mutations);
            });
            // ─── V22: SENTENCE ARCHITECTURE VARIATION ────────────────
            // Randomly inject short punchy fragments to break length uniformity
            if (globalState === "DISTRACTED" && seededRandom(entropy + 300) < 0.12) {
                const punchyFragments = [
                    "That's the main point.",
                    "This matters.",
                    "It's quite clear.",
                    "Simple as that.",
                    "That's basically it.",
                    "No question about it.",
                    "This is real.",
                    "Think about it."
                ];
                const fragment = punchyFragments[Math.floor(seededRandom(entropy + 301) * punchyFragments.length)];
                mutatedSent = mutatedSent + " " + fragment;
            }
            // ─── V22: FILLER CLUSTERING (State-Aware) ────────────────
            // Fillers ONLY appear in DISTRACTED state (humans add fillers when unfocused)
            if (globalState === "DISTRACTED" && persona.fillers.length > 0 && seededRandom(entropy + 13) < 0.3) {
                const filler = persona.fillers[Math.floor(seededRandom(entropy + 14) * persona.fillers.length)];
                if (mutatedSent.length > 50) {
                    mutatedSent = mutatedSent.replace(/([.!?])$/, `, ${filler}$1`);
                }
            }
            // ─── V22: PERSONAL OPINION (State-Aware) ─────────────────
            // Opinions only in NEUTRAL or FATIGUED (when guard is down)
            const opinionMarkers = ["I think", "from what I read", "personally", "in my opinion", "I believe", "if you ask me"];
            if ((globalState === "NEUTRAL" || globalState === "FATIGUED") && sIdx === 1 && seededRandom(entropy + 77) < 0.2) {
                const marker = opinionMarkers[Math.floor(seededRandom(entropy + 78) * opinionMarkers.length)];
                mutatedSent = `${marker}, ${mutatedSent.charAt(0).toLowerCase() + mutatedSent.slice(1)}`;
            }
            // ─── V22: UNIQUENESS ENFORCEMENT ─────────────────────────
            // Generate a fingerprint of mutation types applied
            const appliedTypes = Array.from(selectedIndices).map(i => validPool[i]?.name || "").sort().join("|");
            const fingerprint = `${globalState}:${errorBudget}:${appliedTypes}`;
            if (sentenceFingerprints.has(fingerprint) && selectedIndices.size > 0) {
                // Re-roll: shift the selection by 1 position in the shuffled pool
                const bonus = shuffledPool[Math.min(errorBudget + 1, shuffledPool.length - 1)];
                if (bonus !== undefined) {
                    selectedIndices.add(bonus);
                    const m = validPool[bonus];
                    if (m) {
                        const bonusSeed = simpleHash(entropy.toString() + "reroll" + m.name);
                        mutatedSent = m.fn(mutatedSent, baseDensity * m.weight * 0.8, bonusSeed, mutations);
                    }
                }
            }
            sentenceFingerprints.add(fingerprint);
            // Update path-dependency
            prevSentenceHash = simpleHash(mutatedSent.substring(0, 20));
            return mutatedSent;
        });
        return processedSentences.join(" ");
    });
    return {
        text: processedParagraphs.join("\n\n"),
        mutations,
        persona: activePersonaID
    };
    // Helper: compute pool length without creating the full pool
    function validPool_length() {
        return MUTATION_REGISTRY.filter(m => {
            if (m.range && (config.chaosThreshold < m.range[0] || config.chaosThreshold > m.range[1]))
                return false;
            return true;
        }).length;
    }
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
    // Safety net uses 40% of the original strength + shifted seed
    const safetyConfig = {
        ...config,
        chaosThreshold: config.chaosThreshold * 0.40,
        dnaSeed: config.dnaSeed + "_safety_net_v3.3",
    };
    const baseSeed = simpleHash(safetyConfig.dnaSeed);
    const extremeMul = safetyConfig.extremeMultiplier || 1.0;
    let density = (safetyConfig.chaosThreshold / 100) * safetyConfig.errorFactor * extremeMul;
    if (safetyConfig.isAcademic)
        density = Math.min(density, 0.35);
    const mutations = [];
    let output = text;
    let seed = baseSeed;
    // Core 4 (always re-inject — LLM most likely to fix these)
    output = applyVerbTenseChaos(output, density * 0.45, seed, mutations);
    seed = simpleHash(seed.toString() + "safe_verb");
    output = applyArticleErrors(output, density * 0.40, seed, mutations);
    seed = simpleHash(seed.toString() + "safe_art");
    output = applyPrepositionErrors(output, density * 0.35, seed, mutations);
    seed = simpleHash(seed.toString() + "safe_prep");
    output = applySpellingErrors(output, density * 0.35, seed, mutations);
    seed = simpleHash(seed.toString() + "safe_spell");
    // v3.3: Expanded safety net — Tier 1-2 at 40%, Tier 5-6 at 25%
    output = applyCommaSplice(output, density * 0.30, seed, mutations);
    seed = simpleHash(seed.toString() + "safe_csplice");
    output = applyMissingCopula(output, density * 0.25, seed, mutations);
    seed = simpleHash(seed.toString() + "safe_copula");
    output = applyGerundInfinitiveConfusion(output, density * 0.25, seed, mutations);
    seed = simpleHash(seed.toString() + "safe_gerund");
    output = applyRedundancyPleonasm(output, density * 0.30, seed, mutations);
    seed = simpleHash(seed.toString() + "safe_pleon");
    // Golden signals (lighter touch to avoid overcooking)
    if (config.chaosThreshold >= 40) {
        output = applyCouldOfError(output, density * 0.20, seed, mutations);
        seed = simpleHash(seed.toString() + "safe_couldof");
        output = applyCommaBeforeThat(output, density * 0.25, seed, mutations);
        seed = simpleHash(seed.toString() + "safe_commathat");
    }
    // L1 deep errors at 20% strength  
    if (config.chaosThreshold >= 60) {
        output = applyStativeProgressive(output, density * 0.20, seed, mutations);
        seed = simpleHash(seed.toString() + "safe_stative");
        output = applySinceForConfusion(output, density * 0.20, seed, mutations);
        seed = simpleHash(seed.toString() + "safe_sincefor");
        output = applyDiscussAbout(output, density * 0.25, seed, mutations);
    }
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
