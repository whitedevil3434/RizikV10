"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transformEngine_1 = require("./src/ghost/transformEngine");
const text = `Nuclear Capability and Strategic Asymmetry
India is one of the world’s recognized nuclear powers, possessing a well-developed nuclear arsenal and delivery systems. Its nuclear doctrine is based on "credible minimum deterrence" and a declared "No First Use" (NFU) policy. This means India commits to using nuclear weapons only in retaliation to a nuclear attack.`;
async function trace() {
    const transformedWithBlader = await (0, transformEngine_1.transformText)(text, {
        academic: false, assignmentMode: false, humanErrorThreshold: 85, chaosLevel: 0.9,
        bladerHumanizer: true // ENABLE blader
    }, {}, { academic: false, assignmentMode: false, humanErrorThreshold: 85, chaosLevel: 0.9, bladerHumanizer: true });
    console.log("With Blader:\\n", transformedWithBlader.pipelineOutput);
    const transformedWithoutBlader = await (0, transformEngine_1.transformText)(text, {
        academic: false, assignmentMode: false, humanErrorThreshold: 85, chaosLevel: 0.9,
        bladerHumanizer: false // DISABLE blader
    }, {}, { academic: false, assignmentMode: false, humanErrorThreshold: 85, chaosLevel: 0.9, bladerHumanizer: false });
    console.log("\\nWithout Blader:\\n", transformedWithoutBlader.pipelineOutput);
}
trace().catch(console.error);
