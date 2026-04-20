const fs = require('fs');
const path = require('path');
const readline = require('readline');

// CONFIG
const POSTS_FILE = '/Users/sabbir/.openclaw/workspace/bangladesh_posts/posts.jsonl';
const WORKER_URL = 'https://rizik-backend-godly.its-sabbir69.workers.dev/api/admin/ingest-batch';
const BATCH_SIZE = 50; 

async function ingest() {
    console.log('🚀 Starting DNA Ingestion for Godly Chaos Engine...');
    
    if (!fs.existsSync(POSTS_FILE)) {
        console.error(`❌ File not found: ${POSTS_FILE}`);
        return;
    }

    const fileStream = fs.createReadStream(POSTS_FILE);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let batch = [];
    let totalProcessed = 0;
    let batchCount = 0;

    for await (const line of rl) {
        try {
            const entry = JSON.parse(line);
            // Format for ingestBatch endpoint
            batch.push({
                text: entry.selftext || entry.body || entry.title,
                source: entry.subreddit || 'r/bangladesh',
                author: entry.author || 'anonymous'
            });

            if (batch.length >= BATCH_SIZE) {
                batchCount++;
                console.log(`📦 Sending Batch ${batchCount} (${batch.length} entries)...`);
                await sendBatch(batch);
                totalProcessed += batch.length;
                batch = [];
            }
        } catch (e) {
            console.error('⚠️ Skip corrupted line:', e.message);
        }
    }

    // Final batch
    if (batch.length > 0) {
        console.log(`📦 Sending Final Batch (${batch.length} entries)...`);
        await sendBatch(batch);
        totalProcessed += batch.length;
    }

    console.log(`✅ Finished! Total DNA entries ingested: ${totalProcessed}`);
}

async function sendBatch(batch) {
    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batch })
        });

        const result = await response.json();
        if (result.success) {
            console.log(`   ✨ Saved ${result.processed} vectors.`);
        } else {
            console.error(`   ❌ Failed: ${result.error}`);
        }
    } catch (err) {
        console.error(`   ❌ Network Error: ${err.message}`);
    }
}

ingest().catch(console.error);
