import { fetchWithTimeout } from "./_shared";

const RAFZ_UPLOADER_ENDPOINT =
  process.env.RAFZ_UPLOADER_ENDPOINT || "https://rafzuploader.lovable.app/api/upload";

const CATBOX_ENDPOINT = "https://catbox.moe/user/api.php";

function findUrlInPayload(payload) {
  if (!payload) return null;
  if (typeof payload === "string" && payload.startsWith("http")) return payload;
  const candidates = [
    payload.url,
    payload.fileUrl,
    payload.file_url,
    payload.link,
    payload.data?.url,
    payload.data?.fileUrl,
    payload.result?.url
  ];
  return candidates.find((value) => typeof value === "string" && value.startsWith("http")) || null;
}

export async function uploadToRafz(file) {
  const form = new FormData();
  form.append("file", file, file.name || "upload");

  const response = await fetchWithTimeout(RAFZ_UPLOADER_ENDPOINT, {
    method: "POST",
    body: form
  });

  if (!response.ok) {
    throw new Error(`Upstream returned ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  const url = findUrlInPayload(payload);

  if (!url) {
    throw new Error("Uploader did not return a usable URL");
  }

  return {
    url,
    name: file.name || null,
    size: file.size ?? null,
    type: file.type || null
  };
}

export async function uploadToCatbox(file) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", file, file.name || "upload");

  const response = await fetchWithTimeout(CATBOX_ENDPOINT, {
    method: "POST",
    body: form
  });

  const text = (await response.text()).trim();

  if (!response.ok || !text.startsWith("http")) {
    throw new Error(text || `Upstream returned ${response.status}`);
  }

  return {
    url: text,
    name: file.name || null,
    size: file.size ?? null,
    type: file.type || null
  };
}
