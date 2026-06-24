import { fetchWithTimeout } from "./_shared";

const ENDPOINT = "https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image";

export async function aiTextToImage(prompt, ratio) {
  const params = new URLSearchParams({
    prompt,
    aspect_ratio: ratio || "1:1"
  });

  const response = await fetchWithTimeout(`${ENDPOINT}?${params.toString()}`, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Upstream returned ${response.status}`);
  }

  const data = await response.json();
  if (!data?.image_link) {
    throw new Error("Image generation did not return a result");
  }

  return {
    prompt,
    ratio: ratio || "1:1",
    image: data.image_link
  };
}
