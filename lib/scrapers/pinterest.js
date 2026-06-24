import { fetchWithTimeout } from "./_shared";

const API = "https://pinterestdownloader.io/id-04/frontendService/DownloaderService";

export async function pinterestDownload(url) {
  const res = await fetchWithTimeout(`${API}?url=${encodeURIComponent(url)}`, {
    headers:{
      "User-Agent":"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
      "Referer":"https://pinterestdownloader.io/",
      "X-Init-Locale":"id-04"
    }
  });
  const data = await res.json();
  if (!data?.medias) throw new Error("Data tidak ditemukan atau URL Pinterest tidak valid");

  return {
    title:     data.title || "Pinterest Media",
    thumbnail: data.thumbnail || null,
    media:     data.medias.map(m => ({
      url:       m.url,
      quality:   m.quality,
      extension: m.extension,
      size:      m.formattedSize,
      type:      m.extension === "mp4" ? "video" : "image"
    }))
  };
}
