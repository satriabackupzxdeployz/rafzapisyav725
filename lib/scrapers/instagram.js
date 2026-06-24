import { UA, fetchWithTimeout } from "./_shared";

const ENDPOINT = "https://inflact.com/downloader/api/downloader/post/";

export async function instagramDownload(url) {
  const form = new FormData();
  form.append("url", url);

  const response = await fetchWithTimeout(ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "*/*",
      Origin: "https://inflact.com",
      Referer: "https://inflact.com/instagram-downloader/video/",
      "User-Agent": UA
    },
    body: form
  });

  if (!response.ok) {
    throw new Error(`Upstream returned ${response.status}`);
  }

  const payload = await response.json();
  const post = payload?.data?.post;

  if (!post) {
    throw new Error("Could not resolve this Instagram link");
  }

  const carousel = post.edge_sidecar_to_children?.edges?.map((edge) => edge?.node?.display_url) || [];
  const images = carousel.length > 0 ? carousel : [post.display_url].filter(Boolean);

  return {
    source: url,
    username: post.owner?.username || null,
    caption: post.edge_media_to_caption?.edges?.[0]?.node?.text || null,
    isVideo: Boolean(post.is_video),
    thumbnail: post.display_url || null,
    video: post.is_video ? post.video_url || null : null,
    images,
    likeCount: post.edge_media_preview_like?.count ?? null,
    commentCount: post.edge_media_to_parent_comment?.count ?? null
  };
}
