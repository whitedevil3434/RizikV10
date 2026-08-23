import { applyHumanErrors } from './src/ghost/humanErrorEngine';
import { transformText } from './src/ghost/transformEngine';
import { applyBladerHumanizerPolicy } from './src/ghost/bladerHumanizer';

const text = `The use of nuclear weapons raises serious legal and ethical questions. International humanitarian law emphasizes the protection of civilians and the prohibition of indiscriminate weapons.`;

async function debug() {
  const transformed = await transformText(text, {
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

  const transformedWithBlader = await transformText(text, {
    academic: true, assignmentMode: true, humanErrorThreshold: 85, chaosLevel: 0.9,
    bladerHumanizer: true // ENABLE blader
  }, {}, { academic: true, assignmentMode: true, humanErrorThreshold: 85, chaosLevel: 0.9, bladerHumanizer: true });
  console.log("With Blader:", transformedWithBlader.pipelineOutput);
}

debug().catch(console.error);
