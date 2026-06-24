import { fetchWithTimeout } from "./_shared";

const BASE = "https://api.fabdl.com";

export async function spotifyDownload(url) {
  const getResponse = await fetchWithTimeout(`${BASE}/spotify/get?url=${encodeURIComponent(url)}`);
  if (!getResponse.ok) {
    throw new Error(`Upstream returned ${getResponse.status}`);
  }

  const getData = await getResponse.json();
  const track = getData?.result;
  if (!track?.gid || !track?.id) {
    throw new Error("Could not resolve this Spotify link");
  }

  const convertResponse = await fetchWithTimeout(`${BASE}/spotify/mp3-convert-task/${track.gid}/${track.id}`);
  if (!convertResponse.ok) {
    throw new Error(`Conversion request returned ${convertResponse.status}`);
  }

  const convertData = await convertResponse.json();
  const downloadPath = convertData?.result?.download_url;
  if (!downloadPath) {
    throw new Error("Conversion did not return a download link");
  }

  return {
    source: url,
    title: track.title || null,
    artists: track.artists || null,
    durationMs: track.duration_ms ?? null,
    cover: track.image || null,
    audio: downloadPath.startsWith("http") ? downloadPath : `${BASE}${downloadPath}`
  };
}
