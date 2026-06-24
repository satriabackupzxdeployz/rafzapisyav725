import { createDecipheriv } from "node:crypto";
import { fetchWithTimeout, extractYoutubeId } from "./_shared";

const KEY = Buffer.from("C5D58EF67A7584E4A29F6C35BBC4EB12", "hex");
const FALLBACK_CDN = "d2.savetube.me";

function decryptPayload(base64) {
  const raw = Buffer.from(base64, "base64");
  const iv = raw.subarray(0, 16);
  const data = raw.subarray(16);
  const decipher = createDecipheriv("aes-128-cbc", KEY, iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString("utf-8"));
}

async function getCdn() {
  try {
    const response = await fetchWithTimeout("https://media.savetube.me/api/random-cdn");
    const data = await response.json();
    return data?.cdn || FALLBACK_CDN;
  } catch {
    return FALLBACK_CDN;
  }
}

async function getVideoInfo(url) {
  const cdn = await getCdn();
  const response = await fetchWithTimeout(`https://${cdn}/v2/info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });

  const result = await response.json();
  if (!result.status) {
    throw new Error(result.message || "Failed to resolve this YouTube link");
  }

  const decrypted = decryptPayload(result.data);
  return {
    cdn,
    title: decrypted.title,
    duration: decrypted.durationLabel,
    thumbnail: decrypted.thumbnail,
    key: decrypted.key
  };
}

async function getDownloadLink(cdn, key, quality, type) {
  const response = await fetchWithTimeout(`https://${cdn}/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      downloadType: quality === "128" ? "audio" : type,
      quality,
      key
    })
  });

  const result = await response.json();
  if (!result.status) {
    throw new Error(result.message || "Failed to build a download link");
  }
  return result.data.downloadUrl;
}

export async function youtubeInfo(input) {
  const videoId = extractYoutubeId(input);
  if (!videoId) throw new Error("Invalid YouTube URL or video ID");
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const info = await getVideoInfo(url);
  return {
    source: url,
    videoId,
    title: info.title,
    duration: info.duration,
    thumbnail: info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  };
}

export async function youtubeDownload(input, quality, type) {
  const videoId = extractYoutubeId(input);
  if (!videoId) throw new Error("Invalid YouTube URL or video ID");
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const info = await getVideoInfo(url);
  const downloadUrl = await getDownloadLink(info.cdn, info.key, quality, type);

  return {
    source: url,
    videoId,
    title: info.title,
    duration: info.duration,
    thumbnail: info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    quality,
    type,
    download: downloadUrl
  };
}
