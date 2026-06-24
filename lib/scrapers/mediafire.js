import { fetchWithTimeout } from "./_shared";

function getMime(url) {
  const ext = (url||"").split("?")[0].split(".").pop().toLowerCase();
  const m = { zip:"application/zip", rar:"application/x-rar-compressed", apk:"application/vnd.android.package-archive",
    pdf:"application/pdf", mp3:"audio/mpeg", mp4:"video/mp4", jpg:"image/jpeg", png:"image/png", exe:"application/x-msdownload" };
  return m[ext] || "application/octet-stream";
}

export async function mediafireDownload(url) {
  const res = await fetchWithTimeout(url, { headers:{ "User-Agent":"Mozilla/5.0" } });
  const html = await res.text();

  const title    = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1]  || null;
  const image    = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]  || null;
  const dlHref   = html.match(/id="downloadButton"[^>]* href="([^"]+)"/)?.[1]      || null;
  const sizeText = html.match(/id="downloadButton"[^>]*>([^<]+)</)?.[1]?.trim()    || "";
  const size     = sizeText.replace("Download (","").replace(")","").trim();

  if (!dlHref) throw new Error("Tidak ada link download yang ditemukan di halaman MediaFire ini");
  return { title, image, download: dlHref, size, mimetype: getMime(dlHref) };
}
