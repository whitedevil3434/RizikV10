import os

main_tsx_path = "apps/clink-web/src/main.tsx"
css_path = "apps/clink-web/src/styles.css"

with open(main_tsx_path, "r") as f:
    code = f.read()

# Fix color logic to use TYPE colors even for ghosts
old_color_logic = """    const getColors = (node: CausalNode, isExpanded: boolean) => {
        if (!isRoot) {
            if (node.state === "ghost") return { fill: "transparent", text: "#94a3b8" };
            return { fill: "rgba(255,255,255,0.5)", text: "#0f172a" };
        }
        if (node.state === "ghost") return { fill: "#f1f5f9", text: "#94a3b8" };
        if (node.type === "Source") return { fill: "#ffffff", text: "#334155" };
        if (node.type === "Need") return { fill: "#e0f2fe", text: "#0284c7" };
        if (node.type === "Gap" || node.state === "blocked") return { fill: "#fee2e2", text: "#dc2626" };
        if (node.type === "Capability") return { fill: "#dcfce7", text: "#16a34a" };
        if (node.type === "Actor") return { fill: "#f3e8ff", text: "#9333ea" };
        return { fill: "#ffffff", text: "#0f172a" };
    };"""

new_color_logic = """    const getColors = (node: CausalNode, isExpanded: boolean) => {
        if (!isRoot) {
            if (node.state === "ghost") return { fill: "transparent", text: "#94a3b8" };
            return { fill: "rgba(255,255,255,0.5)", text: "#0f172a" };
        }
        
        let fill = "#ffffff";
        let text = "#0f172a";
        
        // Base colors on TYPE so the user can always differentiate the territories!
        if (node.type === "Source") { fill = "#ffffff"; text = "#334155"; }
        else if (node.type === "Need") { fill = "#bae6fd"; text = "#0369a1"; } // Blue
        else if (node.type === "Gap" || node.type === "Responsibility") { fill = "#fecaca"; text = "#b91c1c"; } // Red
        else if (node.type === "Capability") { fill = "#bbf7d0"; text = "#15803d"; } // Green
        else if (node.type === "Actor") { fill = "#e9d5ff"; text = "#7e22ce"; } // Purple
        else if (node.type === "Commitment") { fill = "#fef08a"; text = "#a16207"; } // Yellow
        
        // Ghost state just makes the text lighter, but keeps the territory color
        if (node.state === "ghost") {
            text = "rgba(0,0,0,0.4)";
        }
        
        return { fill, text };
    };"""

code = code.replace(old_color_logic, new_color_logic)

with open(main_tsx_path, "w") as f:
    f.write(code)


# Fix CSS for seams
with open(css_path, "r") as f:
    css = f.read()

# Make background dark slate to make seams pop
css = css.replace("--surface-default: #ffffff;", "--surface-default: #94a3b8;")

# Make seams thick and match background
css = css.replace(".seam-normal { stroke: rgba(255,255,255,0.8); stroke-width: 2px; }", ".seam-normal { stroke: #94a3b8; stroke-width: 8px; }")
css = css.replace(".seam-ghost { stroke: rgba(255,255,255,0.6); stroke-width: 2px; stroke-dasharray: 4 8; }", ".seam-ghost { stroke: #94a3b8; stroke-width: 8px; stroke-dasharray: 12 12; }")
css = css.replace(".seam-tension { stroke: rgba(239, 68, 68, 0.4); stroke-width: 2px; stroke-dasharray: 8 8; }", ".seam-tension { stroke: #ef4444; stroke-width: 8px; stroke-dasharray: 12 12; }")

with open(css_path, "w") as f:
    f.write(css)

