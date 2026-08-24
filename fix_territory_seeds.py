import os

main_tsx_path = "apps/clink-web/src/main.tsx"
with open(main_tsx_path, "r") as f:
    code = f.read()

# 1. Allow tapping ghosts
code = code.replace("if (node.state !== 'ghost') onNodeTap(isExpanded ? null : id);", "onNodeTap(isExpanded ? null : id);")

# 2. Fix the territory logic to bind seeds to IDs, not ranks
old_alloc = """  const seeds = [
    { x: 2, y: 2 }, { x: COLS - 3, y: 2 }, { x: 2, y: ROWS - 3 }, { x: COLS - 3, y: ROWS - 3 },
    { x: Math.floor(COLS/2), y: Math.floor(ROWS/2) }, { x: Math.floor(COLS/2), y: 0 }
  ];
  
  const queues: Record<string, {x: number, y: number}[]> = {};
  for (let i = 0; i < sortedIds.length; i++) queues[sortedIds[i]] = [seeds[i % seeds.length]];"""

new_alloc = """  const SEED_MAP: Record<string, {x: number, y: number}> = {
    source: { x: Math.floor(COLS/2), y: Math.floor(ROWS/2) },
    need: { x: 2, y: 2 },
    capability: { x: 2, y: ROWS - 3 },
    actor: { x: COLS - 3, y: ROWS - 3 },
    gap: { x: COLS - 3, y: 2 },
    responsibility: { x: Math.floor(COLS/2), y: ROWS - 2 }
  };
  
  const defaultSeeds = [
    { x: Math.floor(COLS/2), y: Math.floor(ROWS/2) }, { x: 0, y: 0 }, { x: COLS-1, y: 0 }, 
    { x: 0, y: ROWS-1 }, { x: COLS-1, y: ROWS-1 }
  ];
  
  const queues: Record<string, {x: number, y: number}[]> = {};
  let dIdx = 0;
  for (let i = 0; i < sortedIds.length; i++) {
     const id = sortedIds[i];
     const seed = SEED_MAP[id] || defaultSeeds[dIdx++ % defaultSeeds.length];
     queues[id] = [seed];
  }"""

code = code.replace(old_alloc, new_alloc)

with open(main_tsx_path, "w") as f:
    f.write(code)

