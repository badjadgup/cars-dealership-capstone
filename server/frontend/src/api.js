export async function api(path, options = {}) {
  const method = options.method || "GET";
  let token;
  if (!["GET", "HEAD"].includes(method)) {
    const response = await fetch("/api/csrf/", { credentials: "same-origin" });
    if (!response.ok)
      throw new Error(
        "Unable to start a secure session. Reload and try again.",
      );
    token = (await response.json()).csrfToken;
  }
  const response = await fetch("/api" + path, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-CSRFToken": token } : {}),
      ...options.headers,
    },
  });
  const data = await response
    .json()
    .catch(() => ({ error: "The server returned an unexpected response." }));
  if (!response.ok)
    throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}
