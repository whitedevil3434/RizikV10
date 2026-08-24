# SPATIAL ENGINE ARCHITECTURE (Layout Solver + Selective Boundary)

1. **Territory Morph > Shape Morph**: Do not predefine L, T, or Z shapes. Territory emerges from spatial pressure (attention, relations, density).
2. **Content vs Boundary**: 
   - Content MUST remain standard HTML DOM for accessibility and layout stability.
   - SVG or `clip-path` is ONLY used for drawing the visual background boundary of irregular shapes, NEVER for wrapping text content in `foreignObject`.
3. **Motion Separation**:
   - Territory interpolation (Bounding boxes).
   - Boundary interpolation (Background visuals).
   - Content reflow (DOM text/buttons repositioning).
4. **Different Scales**: A small object might be a dot, medium a rectangle, large an irregular polygon. Do not force a universal grid resolution.

# STRUCTURAL EMERGENCE (The AI & UI Contract)
1. **The Quiet Protocol**: Initial state is never blank. Ghost structures of Work (Need, Capability, Gap) pre-exist, waiting to be claimed.
2. **Conversation is the Source**: The user's natural language input does NOT disappear. It becomes the first physical territory (Conversation Card) which acts as the provenance for all structured objects.
3. **Structure Emerges, Not Pops**: Do not animate independent UI components popping into existence. Animate the Work *acquiring structure* as the compiler runs.
4. **Three Layers of Object Truth**: Every object must have: Visible Meaning -> Structured Reality -> Source/Provenance (Traceable back to the exact conversation).

# ASYMMETRIC SEAM & BOUNDARY ENGINE
1. **Single Finite Surface:** Cards are not independent rectangles. They are partitions of a single continuous Work Surface.
2. **Seam = Relationship:** Boundaries between partitions are semantic. Stable line = resolved, Active slant = executing, Tension zigzag = Gap.
3. **Void Territory:** Empty space itself is state. Gaps are surrounded by void space that gets reabsorbed when resolved.
4. **HTML over SVG:** NEVER use CSS grid fragments for complex shapes. Calculate node geometry (x, y, w, h), draw the asymmetric seams in an SVG background layer (z-index 0), and position HTML content over it (z-index 1).

# THE GOLDEN RULE OF THE SPATIAL ENGINE
**"Do not implement a card layout. Implement a spatial system in which semantic objects continuously negotiate territory according to Work state."**

# THE FEEDBACK LOOP ARCHITECTURE
User Language -> Conversation Source -> AI Compiler -> Structured Objects -> STATE INTERPRETER -> ATTENTION ENGINE -> SPATIAL ALLOCATOR -> GEOMETRY SOLVER -> SVG (Seams/Voids) + HTML (Content) -> LIVING MOSAIC -> User Interaction -> State Changes (back to Attention).

*Never build detail pages (e.g. ActorDetailPage). Use ONLY spatial recursion where the parent remains mounted, neighbors sacrifice space, and a local mosaic appears inside the expanded territory.*

# FINITE SPATIAL ALLOCATOR (Emergent Shape)
**Never generate a shape. Generate territories. The shape is the boundary left behind by those territories.**
- **No Predefined Layouts:** Never hardcode L, T, or Z layout templates. The UI is not allowed to know what shape it will take before rendering.
- **Grid-to-Contour Mechanism:** Divide the finite space into invisible computational cells -> Semantic objects claim cells based on weights/relationships -> Form contiguous territories -> Extract outer cell boundaries -> Convert to smoothed SVG paths.
