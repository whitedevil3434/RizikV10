
try {
    const { init } = require('@heyputer/puter.js/src/init.cjs');
    console.log("✅ Import successful! init function exists:", typeof init);
} catch (e) {
    console.error("❌ Import failed:", e);
    // Try main entry point as fallback
    try {
        const puter = require('@heyputer/puter.js');
        console.log("✅ Main entry require successful:", typeof puter);
    } catch (e2) {
        console.error("❌ Main entry failed:", e2);
    }
}
