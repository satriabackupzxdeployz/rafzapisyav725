import { fetchWithTimeout } from "./_shared";

const MODELS = ["gemini-3-flash-preview","gemini-2-5-flash","gemini-2-5-flash-lite"];

export async function geminiChat(message, model = "gemini-3-flash-preview") {
  if (!MODELS.includes(model)) model = MODELS[0];

  const res = await fetchWithTimeout("https://labs.shannzx.xyz/chat", {
    method:"POST",
    headers:{
      "accept":"text/x-component",
      "content-type":"text/plain;charset=UTF-8",
      "next-action":"92d0653dd8223b77442ce76e19b5f956b79afc21",
      "next-router-state-tree":"%5B%22%22%2C%7B%22children%22%3A%5B%22chat%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
      "origin":"https://labs.shannzx.xyz","referer":"https://labs.shannzx.xyz/chat",
      "user-agent":"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36"
    },
    body: JSON.stringify([message, [], [], model])
  });
  const raw = await res.text();

  for (const line of raw.split("\n")) {
    if (line.includes('"status"') && line.includes('"reply"')) {
      const clean = line.replace(/^[^{]*/,"").replace(/}[^}]*$/,"}");
      try {
        const p = JSON.parse(clean);
        return { model: p.model_used || model, answer: p.reply };
      } catch {}
    }
  }
  throw new Error("Tidak ada respons dari Gemini AI");
}
