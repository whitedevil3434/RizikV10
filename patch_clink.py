import re

file_path = "apps/clink-web/src/api/clink.ts"
with open(file_path, "r") as f:
    content = f.read()

new_compile_need = """export async function compileNeed(input: { text: string; locale?: string }) {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const url = `${baseUrl}/ai/compile-need`;
  const response = await fetch(url, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
    },
    body: JSON.stringify({ text: input.text, locale: input.locale || "bn" })
  });
  if (!response.ok) {
    throw new Error(`Compile need failed: ${response.status}`);
  }
  return response.json();
}"""

content = re.sub(r'export function compileNeed\(.*?\)\s*\{.*?\n\}', new_compile_need, content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(content)

print("Patched clink.ts")
