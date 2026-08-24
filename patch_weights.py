import os

main_tsx_path = "apps/clink-web/src/main.tsx"
with open(main_tsx_path, "r") as f:
    code = f.read()

# Replace the weight logic
old_logic = """function calculateWeights(nodes: Record<string, CausalNode>, expandedId: string | null): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const [id, node] of Object.entries(nodes)) {
    if (expandedId === id) weights[id] = 150.0; // Apple-like takeover 
    else if (expandedId) weights[id] = 1.0; 
    else {"""

new_logic = """function calculateWeights(nodes: Record<string, CausalNode>, expandedId: string | null): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const [id, node] of Object.entries(nodes)) {
    if (expandedId === id) weights[id] = 40.0; // Large but leaves room
    else if (expandedId) {
      if (node.state === "ghost") weights[id] = 2.0;
      else weights[id] = 8.0; // Significant remaining size
    }
    else {"""

code = code.replace(old_logic, new_logic)

with open(main_tsx_path, "w") as f:
    f.write(code)

