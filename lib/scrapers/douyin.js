import { fetchWithTimeout } from "./_shared";

export async function douyinDownload(url) {
  const form = new FormData();
  form.append("url",   url);
  form.append("token", "fb15a01280f80d78cbf2a86695612a0246c9a850573c49a6d984245a7ed2ee8b");
  form.append("hash",  "aHR0cHM6Ly92LmRvdXlpbi5jb20vU1d0eHZja3pISDQv");

  const res = await fetchWithTimeout("https://snapdouyin.app/wp-json/mx-downloader/video-data/", {
    method:"POST",
    headers:{
      "Origin":"https://snapdouyin.app","Referer":"https://snapdouyin.app/id/",
      "User-Agent":"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36"
    },
    body: form
  });
  const data = await res.json();
  if (!data) throw new Error("Gagal mengunduh dari Douyin");
  return data;
}
