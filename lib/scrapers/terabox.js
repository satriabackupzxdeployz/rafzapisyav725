import { fetchWithTimeout } from "./_shared";

export async function teraboxDownload(url) {
  const form = new URLSearchParams({
    action:"terabox_fetch", url, nonce:"96dddaff35"
  });
  const res = await fetchWithTimeout("https://terabxdownloader.org/wp-admin/admin-ajax.php", {
    method:"POST",
    headers:{
      "user-agent":"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36",
      "accept":"*/*",
      "referer":"https://terabxdownloader.org/",
      "content-type":"application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with":"XMLHttpRequest"
    },
    body: form.toString()
  });
  const json = await res.json();
  const d = json.data;
  const files = d?.["📄 Files"] || [];

  return {
    status:    d?.["✅ Status"] || "Unknown",
    shortLink: d?.["🔗 ShortLink"] || null,
    files:     files.map(f => ({
      name:     f["📂 Name"]                  || "",
      download: f["🔽 Direct Download Link"]  || "",
      size:     f["📏 Size"]                  || ""
    }))
  };
}
