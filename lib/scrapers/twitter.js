import { fetchWithTimeout } from "./_shared";

export async function twitterDownload(url) {
  const body = new URLSearchParams({ url });
  const res = await fetchWithTimeout("https://www.expertsphp.com/instagram-reels-downloader.php", {
    method:"POST",
    headers:{
      "content-type":"application/x-www-form-urlencoded",
      "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    body: body.toString()
  });
  const html = await res.text();

  const videoMatch = html.match(/<video[^>]* src="([^"]+)"/);
  const dlMatch    = html.match(/<a[^>]* download[^>]* href="([^"]+\.mp4[^"]*)"/);
  const video = videoMatch?.[1] || dlMatch?.[1] || null;

  if (!video) throw new Error("Video tidak ditemukan. Periksa kembali URL Twitter/X");
  return { source:url, video };
}
