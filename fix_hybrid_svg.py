import os

main_tsx_path = "apps/clink-web/src/main.tsx"
with open(main_tsx_path, "r") as f:
    content = f.read()

content = content.replace('const n1 = nodes[seam.id1];', 'const n1 = seam.id1 ? nodes[seam.id1] : null;')
content = content.replace('const n2 = nodes[seam.id2];', 'const n2 = seam.id2 ? nodes[seam.id2] : null;')

with open(main_tsx_path, "w") as f:
    f.write(content)

