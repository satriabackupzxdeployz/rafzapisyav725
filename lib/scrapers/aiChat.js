import { fetchWithTimeout } from "./_shared";

const BASE = "https://api.heckai.weight-wave.com/api/ha/v1";
const DEFAULT_MODEL = "x-ai/grok-3-mini-beta";

async function createSession() {
  try {
    const response = await fetchWithTimeout(`${BASE}/session/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `RafzApiSession_${Date.now()}` })
    });
    const data = await response.json();
    return data?.id || null;
  } catch {
    return null;
  }
}

export async function aiChat(prompt, model) {
  const sessionId = await createSession();
  const activeModel = model || DEFAULT_MODEL;

  const response = await fetchWithTimeout(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: activeModel,
      question: prompt,
      language: "Indonesian",
      sessionId
    })
  });

  if (!response.ok) {
    throw new Error(`Upstream returned ${response.status}`);
  }

  const raw = await response.text();
  const lines = raw.split("\n");
  let answer = "";
  let capture = false;

  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const chunk = line.replace("data: ", "").trim();
    if (chunk === "[ANSWER_START]") {
      capture = true;
      continue;
    }
    if (chunk === "[ANSWER_DONE]") {
      capture = false;
      break;
    }
    if (capture) answer += chunk;
  }

  return {
    model: activeModel,
    sessionId,
    answer: answer.replace(/\\n/g, "\n").trim()
  };
}
