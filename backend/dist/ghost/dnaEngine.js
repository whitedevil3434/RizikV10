// Godly Chaos Engine: Forensic DNA Engine v3.0
// Extracts deep linguistic fingerprints (Grade 1-6) for non-generative mapping.
// NO LLM CALLS: 100% Statistical & Rule-Based.
export async function extractDNA(text, env) {
    if (!text || text.trim().length === 0)
        return null;
    // 1. Basic Decomposition
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    const words = text.toLowerCase().match(/\b\w+'?\w*\b/g) || [];
    // 2. Lexical DNA (Grade 1)
    const wordFreq = {};
    words.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
    const contractions = (text.match(/\b(i'm|don't|can't|won't|it's|you're|we're|they're|i'll|you'll|he's|she's|isn't|aren't)\b/gi) || []).length;
    const slangTerms = /\b(lol|tbh|lowkey|highkey|idk|kinda|sorta|bruh|fr|no cap|ghosted|vibing|sus)\b/gi;
    const slangCount = (text.match(slangTerms) || []).length;
    // 3. Syntactic DNA (Grade 2)
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgSentLength = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
    const sentLengthVariance = sentenceLengths.reduce((a, b) => a + Math.pow(b - avgSentLength, 2), 0) / (sentenceLengths.length || 1);
    const sentenceStarts = sentences.map(s => s.trim().split(/\s+/)[0].toLowerCase());
    const startFreq = {};
    sentenceStarts.forEach(w => { if (w)
        startFreq[w] = (startFreq[w] || 0) + 1; });
    // 4. Rhythmic DNA (Grade 3)
    // Burstiness: standard deviation of sentence lengths
    const burstiness = Math.sqrt(sentLengthVariance);
    const flowType = burstiness > 5 ? "chaotic" : (avgSentLength > 15 ? "flow" : "staccato");
    // 5. Punctuation DNA (Grade 4)
    const punct = {
        commas: (text.match(/,/g) || []).length / (words.length || 1),
        ellipses: (text.match(/\.\.\./g) || []).length,
        dashes: (text.match(/ - | -- |—/g) || []).length,
        exclamations: (text.match(/!/g) || []).length,
        questions: (text.match(/\?/g) || []).length
    };
    // 6. Error DNA (Grade 5 - Personal Misspelling Fingerprint)
    // Track common user quirks (dont vs don't, etc.)
    const commonErrors = ["dont", "cant", "wont", "fav", "coz", "cz", "wana", "gonna", "biya", "meye", "jam", "bro", "thnx", "u", "r", "ur"];
    const capturedErrors = words.filter(w => commonErrors.includes(w));
    const errorMap = {};
    capturedErrors.forEach(e => errorMap[e] = (errorMap[e] || 0) + 1);
    // 7. Structural DNA (Grade 6)
    const transitionWords = /\b(however|therefore|moreover|consequently|alternatively|instead|but|so|and|then|firstly|finally|actually|honestly|basically)\b/gi;
    const transitions = (text.match(transitionWords) || []).length;
    // 8. Embedding DNA (BGE Small - Non-Generative)
    let embedding = null;
    try {
        const embeddingPromise = env.AI.run("@cf/baai/bge-small-en-v1.5", {
            text: [text.slice(0, 500)]
        });
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 1800));
        const aiResponse = await Promise.race([embeddingPromise, timeoutPromise]);
        if (aiResponse?.data?.[0]) {
            embedding = aiResponse.data[0];
        }
        else {
            console.warn("Forensic Embedding Timeout: continuing without embedding vector");
        }
    }
    catch (err) {
        console.error("Forensic Embedding Error:", err);
    }
    return {
        id: 'dna_v3_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        lexical: {
            topWords: Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(e => e[0]),
            contractionRate: contractions / (sentences.length || 1),
            slangDensity: slangCount / (words.length || 1),
            uniqueRatio: Object.keys(wordFreq).length / (words.length || 1)
        },
        syntactic: {
            avgLength: avgSentLength,
            lengthStdDev: burstiness,
            startBias: startFreq,
            complexity: (text.match(/ (and|but|or|because|although|since|while) /gi) || []).length / (sentences.length || 1)
        },
        rhythmic: {
            burstiness: burstiness,
            flow: flowType
        },
        punctuation: punct,
        errorFingerprint: {
            map: errorMap,
            // error_factor: How error-prone is this user's natural writing? (0.3 = very clean, 2.0 = very messy)
            // User jodi naturally "dont", "coz" likhe, tahole error injection density barbe (DNA-aware scaling)
            error_factor: Math.min(2.0, Math.max(0.3, capturedErrors.length > 0
                ? (capturedErrors.length / Math.max(1, words.length * 0.005))
                : 0.8 // Default for clean writers: moderate injection
            )),
            capsBypass: (text.match(/[a-z]/) && !text.match(/[A-Z]/)) ? true : false,
            iLowercase: (text.match(/\bi\b/g) || []).length > 0
        },
        structural: {
            paraCount: paragraphs.length,
            sentPerPara: sentences.length / (paragraphs.length || 1),
            transitionDensity: transitions / (sentences.length || 1)
        },
        embedding: embedding
    };
}
