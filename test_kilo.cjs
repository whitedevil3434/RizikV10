async function test() {
  try {
    const res = await fetch("https://rizikecosystem.com/api/clink/compile-need", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "I want to learn English by next month, but I don't have a speaking partner, which is blocking my progress.",
        locale: "en"
      })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
