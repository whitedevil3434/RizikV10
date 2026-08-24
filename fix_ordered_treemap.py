import os

main_tsx_path = "apps/clink-web/src/main.tsx"
with open(main_tsx_path, "r") as f:
    code = f.read()

# Replace the treemap logic to NOT sort by weight, but use a fixed topological order!
old_logic = """function generateTreemap(weights: Record<string, number>, width: number, height: number, gap: number = 8) {
  const sortedIds = Object.keys(weights).sort((a, b) => weights[b] - weights[a]);"""

new_logic = """// Topological Order (Never changes, ensures spatial permanence)
const TOPOLOGY = ["source", "need", "responsibility", "capability", "actor", "gap", "resolve", "commit", "spec", "timeline", "task", "proof"];

function generateTreemap(weights: Record<string, number>, width: number, height: number, gap: number = 8) {
  // Sort based on predefined topology, not weight!
  const sortedIds = Object.keys(weights).sort((a, b) => {
      const idxA = TOPOLOGY.indexOf(a);
      const idxB = TOPOLOGY.indexOf(b);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });"""

code = code.replace(old_logic, new_logic)

with open(main_tsx_path, "w") as f:
    f.write(code)

