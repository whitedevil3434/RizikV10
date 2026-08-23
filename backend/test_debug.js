"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transformEngine_1 = require("./src/ghost/transformEngine");
const text = `The use of nuclear weapons raises serious legal and ethical questions. International humanitarian law emphasizes the protection of civilians and the prohibition of indiscriminate weapons.`;
async function debug() {
    const transformed = await (0, transformEngine_1.transformText)(text, {
        chaosMode: "extreme",
        humanErrorThreshold: 85,
        errorFactor: 4.5,
        assignmentMode: true,
        isAcademic: true,
        personaId: "south_asian",
        dnaSeed: "test_seed_" + Date.now()
    }, {}, {
        // Passing correctly! 
        academic: true, assignmentMode: true, humanErrorThreshold: 85, chaosLevel: 0.9,
        bladerHumanizer: false // DISABLE blader
    });
    console.log("Without Blader:", transformed.pipelineOutput);
    const transformedWithBlader = await (0, transformEngine_1.transformText)(text, {
        academic: true, assignmentMode: true, humanErrorThreshold: 85, chaosLevel: 0.9,
        bladerHumanizer: true // ENABLE blader
    }, {}, { academic: true, assignmentMode: true, humanErrorThreshold: 85, chaosLevel: 0.9, bladerHumanizer: true });
    console.log("With Blader:", transformedWithBlader.pipelineOutput);
}
debug().catch(console.error);
