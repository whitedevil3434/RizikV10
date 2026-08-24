import os

main_tsx_path = "apps/clink-web/src/main.tsx"
with open(main_tsx_path, "r") as f:
    code = f.read()

code = code.replace('const SPRING = { type: "spring", stiffness: 180, damping: 25 };', 'const SPRING: any = { type: "spring", stiffness: 180, damping: 25 };')

with open(main_tsx_path, "w") as f:
    f.write(code)

