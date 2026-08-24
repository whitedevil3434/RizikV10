import os

css_path = "src/styles.css"
with open(css_path, "r") as f:
    css = f.read()

css = css.replace(".composer-bar { padding: 32px;", ".composer-bar { z-index: 100; pointer-events: auto; padding: 32px;")

with open(css_path, "w") as f:
    f.write(css)

