/** Error from the LBC server, carrying the HTTP status and the JSON body it sent. */
export class ApiError extends Error {
  status: number
  body: { error?: string; errors?: Partial<Record<string, string>>; [k: string]: unknown }
  constructor(status: number, body: ApiError['body']) {
    super(body.error ?? `Request failed (${status})`)
    this.status = status
    this.body = body
  }
}

/** JSON request to /api; throws ApiError for error responses and for network failures (status 0). */
export async function api<T>(path: string, init: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
      headers: {
        Accept: 'application/json',
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      credentials: 'same-origin',
    })
  } catch {
    throw new ApiError(0, { error: 'Could not reach the college server. Check your internet connection and try again.' })
  }
  const text = await res.text()
  let body: unknown = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    /* not JSON (e.g. a proxy error page) */
  }
  if (!res.ok) {
    const b = body && typeof body === 'object' ? (body as ApiError['body']) : {}
    // only our own server sends a text `error`; a platform error page (e.g. a crashed function) may send an object
    if (typeof b.error !== 'string' || !b.error) b.error = res.status >= 500 || res.status === 404 ? 'The application service is unavailable right now. Please try again in a few minutes.' : `Request failed (${res.status}).`
    throw new ApiError(res.status, b)
  }
  return body as T
}
