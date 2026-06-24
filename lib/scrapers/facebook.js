import { UA, fetchWithTimeout } from "./_shared";

const HOME   = "https://fdown.world/";
const RESULT = "https://fdown.world/result.php";

export async function facebookDownload(url) {
  const homeRes = await fetchWithTimeout(HOME, { headers: { "User-Agent": UA } });
  const cookie  = homeRes.headers.get("set-cookie") || "";

  const body = new URLSearchParams({ codehap_link: url, codehap: "true" }).toString();

  const res = await fetchWithTimeout(RESULT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Accept": "*/*",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": UA,
      "Cookie": cookie,
      "Referer": HOME
    },
    body
  });

  if (!res.ok) throw new Error(`Upstream returned ${res.status}`);

  const html = await res.text();

  // Extract links with regex — avoid cheerio for reliability
  const linkRe = /class="download-btn"[^>]* href="([^"]+)"/g;
  const labelRe = /class="download-btn"[^>]*>([^<]+)</g;
  const qualities = [];
  let m, lm;
  const allBtns = [...html.matchAll(/class="download-btn"[^>]* href="([^"#][^"]+)"[^>]*>([^<]+)/g)];
  for (const btn of allBtns) {
    const href  = btn[1].startsWith("http") ? btn[1] : `https://fdown.world${btn[1]}`;
    const label = btn[2].trim().replace(/\s+/g, " ");
    qualities.push({ label, url: href });
  }

  const thumbMatch = html.match(/<img[^>]+src="(https?:\/\/[^"]+)"[^>]*>/);
  const thumbnail  = thumbMatch ? thumbMatch[1] : null;

  if (qualities.length === 0) throw new Error("No downloadable media found for this Facebook link");

  const hd    = qualities.find(q => /hd|720/i.test(q.label));
  const sd    = qualities.find(q => /sd|360/i.test(q.label));
  const image = qualities.find(q => /image/i.test(q.label));

  return {
    source: url,
    thumbnail,
    video:   hd?.url || sd?.url || qualities[0]?.url || null,
    videoSd: sd?.url || null,
    image:   image?.url || thumbnail,
    qualities
  };
}
