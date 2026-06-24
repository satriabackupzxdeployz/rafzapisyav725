import { fetchWithTimeout } from "./_shared";

const BASE = "https://api.v02.savethevideo.com";
const H = {
  "accept":"application/json","content-type":"application/json",
  "origin":"https://www.savethevideo.com","referer":"https://www.savethevideo.com/",
  "user-agent":"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36"
};

export async function saveVideoDownload(url) {
  const res = await fetchWithTimeout(`${BASE}/tasks`, {
    method:"POST", headers:H, body:JSON.stringify({ type:"info", url })
  });
  const data = await res.json();
  if (data.state !== "completed" || !data.result?.length) throw new Error("Gagal mengekstrak info video");

  const v = data.result[0];
  return {
    title:     v.title,
    duration:  v.duration_string,
    thumbnail: v.thumbnail,
    formats:   (v.formats||[]).map(f => ({ url:f.url, quality:f.format, resolution:f.resolution }))
  };
}
