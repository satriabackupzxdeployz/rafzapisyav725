import { fetchWithTimeout } from "./_shared";

const SIM_CFG = {
  uid:          509694418,
  refreshToken: "AMf-vBw4rugf0IxtWUiV2EjHGsblvtOpXVGyfGSwBhPUeIUcQWNGatozwrzcTOOVs2pJ-GfaQdNNPjj3L9d6TfUjx6gWWn4wIDuDosrAbT4B_i_Yoqe1hHkgqkpZwxwzqM61tc6u2K41L4UjxAPx2gY6TAhBjOSAIrY-dwY07aYxB78CZcgrXZJ3GEsX99AWUl-9DnFwxaKzZbqzcetLNaehNASnNlPKhztdjwoQtcVSPH4WOxNbIAEHMigg6C8MAy9rJiZ0vjACaaT2s3S-Z6FdnwVk7MAvR8nmRJNei5FCmdyaQqHeSUOI0ccHHGO7kSw2lF5BpqBKVRAAG6cfKsV5ZBDdFsbCAGGCteil3_ZXVR2BVG9RyRMJHp4mx9OhxX8q0x4IQZF6tjLrgxW8Pna-qEcU1wxGqAK9bzIG2ro9vdO4hCpNBZv5zpC5seKymSVZwU4Ce_y5",
  apiKey:    "",
  signature: "db3013ce4c1b19da00661b14dcc3354eaea394bc244ee4c4aafac09c0df7b283"
};

let _token = null;

async function refreshAuth() {
  const res = await fetchWithTimeout(
    `https://securetoken.googleapis.com/v1/token?key=${SIM_CFG.apiKey}`,
    { method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ grant_type:"refresh_token", refresh_token:SIM_CFG.refreshToken }) }
  );
  const d = await res.json();
  _token = d.access_token || null;
  return _token;
}

export async function simsimiChat(text) {
  if (!_token) await refreshAuth();

  const headers = {
    "Content-Type":"application/json",
    "Authorization":`Bearer ${_token}`,
    "X-Signature": SIM_CFG.signature,
    "X-Client-Platform":"web"
  };

  const payload = {
    av:"9.2.6", cc:"KR", lc:"id", logUID: String(SIM_CFG.uid),
    os:"a", reg_now_days:0, tz:"Asia/Seoul", uid:SIM_CFG.uid,
    character_id:9075, message:text, is_live_chat:false, cv:""
  };

  const res = await fetchWithTimeout(
    "https://kube-appserver.simsimi.com:30443/ai_character/send_chat_message/stream",
    { method:"POST", headers, body:JSON.stringify(payload) }
  );
  const raw = await res.text();

  if (raw.includes("data:402")) {
    throw new Error("Point habis — coba lagi beberapa saat");
  }

  const match = raw.split("\n").find(l => l.startsWith("data: {"));
  if (match) {
    const json = JSON.parse(match.replace("data: ",""));
    return { answer: json.content };
  }
  throw new Error("Tidak ada respons dari SimiSimi");
}
