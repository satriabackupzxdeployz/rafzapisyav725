import { UA, fetchWithTimeout } from "./_shared";

const ENDPOINT = "https://albertaibdconsortium.ca/";

export async function tiktokDownload(url) {
  const body = new URLSearchParams({ url }).toString();

  const response = await fetchWithTimeout(ENDPOINT, {
    method: "POST",
    headers: {
      "HX-Request": "true",
      "HX-Current-URL": ENDPOINT,
      "HX-Boosted": "true",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA
    },
    body
  });

  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);

  const html = await response.text();

  // Parse with regex to avoid cheerio ESM issues in edge cases
  const titleMatch  = html.match(/class="mt-2 line-clamp-3"[^>]*>([^<]+)/);
  const authorMatch = html.match(/class="mt-6"[^>]*>([^<]+)/);
  const thumbMatch  = html.match(/class="h-40 w-40"[^>]* src="([^"]+)"/);

  const title     = titleMatch  ? titleMatch[1].trim()  : null;
  const author    = authorMatch ? authorMatch[1].trim()  : null;
  const thumbnail = thumbMatch  ? thumbMatch[1]          : null;

  // Extract download links that contain token=
  const linkRe = /href="(https:\/\/[^"]+token=[^"]+)"/g;
  const links = [];
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const label = html.slice(Math.max(0, m.index - 200), m.index + m[0].length);
    const isAudio = /mp3|audio/i.test(label);
    links.push({ type: isAudio ? "audio" : "video", url: m[1] });
  }

  const video = links.find(l => l.type === "video")?.url || null;
  const audio = links.find(l => l.type === "audio")?.url || null;

  if (!video && !audio) throw new Error("No downloadable media found for this TikTok link");

  return { source: url, title, author, thumbnail, video, audio };
}
