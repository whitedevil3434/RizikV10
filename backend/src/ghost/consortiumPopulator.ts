/**
 * Consortium DNA Populator
 * Scrapes Bangladeshi subreddits, extracts English DNA, and stores it in Vectorize.
 */

// 🛡️ Helper: Formality Scorer (Statistical)
function calculateFormalityScore(text: string): number {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  if (words.length === 0) return 0;

  // 1. Average Word Length (Longer words = more formal)
  const avgLen = words.reduce((a, b) => a + b.length, 0) / words.length;
  const lenScore = Math.min(avgLen / 7, 1); // Normalized around 7 chars

  // 2. Rare Word Ratio (Using a basic length Proxy for "rare" in this context)
  const rareWords = words.filter(w => w.length > 8).length;
  const rareScore = Math.min((rareWords / words.length) * 5, 1);

  // 3. Slang Penalty
  const slangWords = /\b(lol|tbh|lowkey|bruh|idk|kinda|sorta|fr|no cap|ghosted)\b/gi;
  const slangCount = (text.match(slangWords) || []).length;
  const slangPenalty = Math.max(0, 1 - (slangCount / 5));

  // 4. Passive Voice Density (Proxy: "be/is/are/was/were/been" + words ending in "ed")
  const passiveMarkers = /\b(am|is|are|was|were|be|been|being)\b\s+(\w+ed|\w+en)\b/gi;
  const passiveCount = (text.match(passiveMarkers) || []).length;
  const passiveScore = Math.min(passiveCount * 3, 1);

  // 5. Complexity Score (Sentence length & Clause density)
  const sentences = text.split(/[.!?]+/).filter(s => s.length > 5);
  const avgSentLen = (words.length || 1) / (sentences.length || 1);
  const complexityScore = Math.min(avgSentLen / 25, 1);

  // Composite Score (0.0 - 1.0)
  // Weighted: 20% word len, 20% rare words, 30% slang penalty, 20% passive density, 10% complexity
  return (lenScore * 0.2) + (rareScore * 0.2) + (slangPenalty * 0.3) + (passiveScore * 0.2) + (complexityScore * 0.1);
}

export async function populateConsortium(subreddit: string, limit: number, env: any) {
  const REDLIB_INSTANCES = [
    "https://safereddit.com",
    "https://redlib.catsarch.com",
    "https://libredd.it",
    "https://rdl.ink"
  ];

  let currentInstance = REDLIB_INSTANCES[Math.floor(Math.random() * REDLIB_INSTANCES.length)];
  console.log(`🚀 Using instance: ${currentInstance} for subreddit: r/${subreddit}`);

  try {
    const searchUrl = `${currentInstance}/r/${subreddit}/top/.json?t=all&limit=25`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "RizikConsortiumBot/1.0" }
    });

    if (!res.ok) throw new Error(`Redlib fetch failed: ${res.status}`);
    const data = await res.json() as any;
    const posts = data.data.children;

    let processedCount = 0;
    let vectorUpserts: { id: string, values: number[], metadata: any }[] = [];

    for (const post of posts) {
      if (processedCount >= limit) break;

      const postData = post.data;
      const candidates = [postData.selftext, postData.title];
      
      if (postData.num_comments > 0) {
        const commentsUrl = `${currentInstance}${postData.permalink}.json`;
        const cRes = await fetch(commentsUrl);
        if (cRes.ok) {
          const cData = await cRes.json() as any;
          const commentList = cData[1]?.data?.children || [];
          for (const comment of commentList) {
            if (comment && comment.data && comment.data.body) {
                candidates.push(comment.data.body);
            }
          }
        }
      }

      for (const rawText of candidates) {
        if (!rawText || rawText.length < 150) continue;
        
        const isEnglish = /^[A-Za-z0-9\s.,!?'"()-]+$/.test(rawText.slice(0, 100));
        if (!isEnglish) continue;

        const formality = calculateFormalityScore(rawText);

        const embedding = await env.AI.run("@cf/baai/bge-small-en-v1.5", {
          text: [rawText]
        });

        const vector = embedding.data[0];
        if (!vector) continue;

        vectorUpserts.push({
          id: `reddit_${postData.id}_${Math.random().toString(36).substr(2, 5)}`,
          values: vector,
          metadata: {
            text: rawText.slice(0, 1000),
            source: `r/${subreddit}`,
            author: postData.author,
            timestamp: new Date().toISOString(),
            formality: formality,
            has_slang: formality < 0.6
          }
        });

        processedCount++;
        if (processedCount >= limit) break;
      }
    }

    if (vectorUpserts.length > 0 && env.CONSORTIUM_DB) {
      await env.CONSORTIUM_DB.upsert(vectorUpserts);
    }

    return {
      success: true,
      processed: processedCount,
      subreddit: subreddit,
      instanceUsed: currentInstance
    };

  } catch (err: any) {
    console.error("Populate Error:", err);
    return { success: false, error: err.message };
  }
}

export async function ingestBatch(batch: { text: string, source: string, author: string }[], env: any) {
  try {
    let vectorUpserts: { id: string, values: number[], metadata: any }[] = [];

    const embeddingPromises = batch.map(item => 
      env.AI.run("@cf/baai/bge-small-en-v1.5", { text: [item.text] })
    );

    const results = await Promise.all(embeddingPromises);

    for (let i = 0; i < batch.length; i++) {
        const vector = results[i].data[0];
        if (!vector) continue;

        const formality = calculateFormalityScore(batch[i].text);

        vectorUpserts.push({
            id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            values: vector,
            metadata: {
                text: batch[i].text.slice(0, 1000),
                source: batch[i].source,
                author: batch[i].author,
                timestamp: new Date().toISOString(),
                formality: formality,
                has_slang: formality < 0.6
            }
        });
    }

    if (vectorUpserts.length > 0 && env.CONSORTIUM_DB) {
      await env.CONSORTIUM_DB.upsert(vectorUpserts);
    }

    return { success: true, processed: vectorUpserts.length };
  } catch (err: any) {
    console.error("Ingest Error:", err);
    return { success: false, error: err.message };
  }
}
