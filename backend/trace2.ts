import { transformText } from './src/ghost/transformEngine';

const text = `The prospect of an atomic or nuclear conflict in South Asia is one of the most serious security concerns in global geopolitics. While India is a declared nuclear-armed state, Bangladesh is not. This asymmetry fundamentally shapes the strategic dynamics between the two countries. Although relations between Bangladesh and India have generally been cooperative in recent decades, there are underlying tensions that cannot be ignored. A closer examination of a hypothetical nuclear conflict scenario provides valuable insight into deterrence theory, regional security, and the broader implications of nuclear weapons in South Asia.`;

async function trace() {
  const transformed = await transformText(text, {
    academic: true, assignmentMode: true, humanErrorThreshold: 85, chaosLevel: 0.9, bladerHumanizer: true
  }, {}, { academic: true, assignmentMode: true, humanErrorThreshold: 85, chaosLevel: 0.9, bladerHumanizer: true });
  console.log("Assignment Mode Output:\\n", transformed.pipelineOutput);
}

trace().catch(console.error);
