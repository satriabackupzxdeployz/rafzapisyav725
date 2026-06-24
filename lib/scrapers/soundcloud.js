import { fetchWithTimeout } from "./_shared";

const BASE = "https://sc.snapfirecdn.com";
const H = { "Accept":"application/json","Content-Type":"application/json","User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };

export async function soundcloudDownload(url) {
  const r1 = await fetchWithTimeout(`${BASE}/soundcloud`, {
    method:"POST", headers:H, body:JSON.stringify({ target:url, gsc:"x" })
  });
  const info = await r1.json();
  if (!info.sound?.progressive_url) throw new Error("Gagal mendapatkan info lagu SoundCloud");

  const r2 = await fetchWithTimeout(`${BASE}/soundcloud-get-dl?target=${encodeURIComponent(info.sound.progressive_url)}`, { headers:H });
  const dl = await r2.json();

  return {
    title:  info.sound.title,
    artist: info.metadata.username,
    cover:  info.metadata.artwork_url,
    audio:  dl.url,
    hls:    info.sound.hls_url
  };
}
