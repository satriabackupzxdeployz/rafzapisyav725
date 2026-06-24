import { fetchWithTimeout } from "./_shared";

export async function threadsDownload(url) {
  const form = new URLSearchParams({ id:url, locale:"en" });
  const res = await fetchWithTimeout("https://savethr.com/process", {
    method:"POST",
    headers:{
      "Content-Type":"application/x-www-form-urlencoded",
      "HX-Request":"true","HX-Target":"result-container","HX-Current-URL":"https://savethr.com/"
    },
    body: form.toString()
  });
  const html = await res.text();

  const user     = html.match(/class="font-semibold text-gray-900 text-sm"[^>]*>([^<]+)/)?.[1]?.trim() || null;
  const preview  = html.match(/class="w-full h-40 object-cover"[^>]* src="([^"]+)"/)?.[1] || null;
  const download = html.match(/class="download_link"[^>]* href="([^"]+)"/)?.[1] || null;

  if (!download) throw new Error("Tidak ada media yang bisa diunduh dari link Threads ini");
  return { source:url, user, preview, download };
}
