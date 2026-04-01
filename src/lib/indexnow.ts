const INDEXNOW_KEY = "a3f8e2b1c9d4e7f06b5a2c8d1e4f3a0b";
const SITE_HOST = "aboutraveller.com";
const SITE_URL = "https://aboutraveller.com";

/**
 * Notifies IndexNow (Bing, Yandex, etc.) about new/updated URLs.
 * Paths can be relative (e.g. "/blog/my-post") or absolute.
 * Fails silently — never blocks the calling operation.
 */
export async function pingIndexNow(paths: string[]): Promise<void> {
  if (!paths.length) return;

  const urlList = paths.map((p) =>
    p.startsWith("http") ? p : `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`
  );

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
  } catch {
    // Non-critical — IndexNow failures should never break the user's workflow
  }
}
