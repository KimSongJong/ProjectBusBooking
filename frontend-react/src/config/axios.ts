import { API_BASE_URL } from "./constants"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

interface RequestOptions {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  signal?: AbortSignal | null
}

function buildUrl(path: string, params?: Record<string, any>) {
  const base = path.startsWith("http") ? path : API_BASE_URL.replace(/\/$/, "") + (path.startsWith("/") ? "" : "/") + path

  if (!params || Object.keys(params).length === 0) return base

  const url = new URL(base)
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    url.searchParams.append(k, String(v))
  })
  return url.toString()
}

function getToken() {
  try {
    return localStorage.getItem("access_token")
  } catch (e) {
    return null
  }
}

async function request<T = any>(method: HttpMethod, path: string, data?: any, options: RequestOptions = {}) {
  const url = buildUrl(path, options.params)

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  }

  // Chỉ thêm Accept header nếu không phải FormData
  if (!(data instanceof FormData)) {
    headers["Accept"] = "application/json"
  }

  const token = getToken()
  if (token) headers["Authorization"] = `Bearer ${token}`

  const init: RequestInit = {
    method,
    headers,
    signal: options.signal || undefined,
  }

  if (data !== undefined && data !== null) {
    // if it's a FormData instance, let fetch set the content-type
    if (data instanceof FormData) {
      init.body = data
    } else {
      headers["Content-Type"] = "application/json"
      init.body = JSON.stringify(data)
    }
  }

  const res = await fetch(url, init)

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")

  if (!res.ok) {
    let payload: any = null
    try {
      payload = isJson ? await res.json() : await res.text()
    } catch (_) {
      payload = null
    }
    const err: any = new Error(res.statusText || "HTTP Error")
    err.status = res.status
    err.payload = payload
    throw err
  }

  if (isJson) return (await res.json()) as T
  return (await res.text()) as unknown as T
}

const api = {
  request,
  get: <T = any>(path: string, params?: Record<string, any>, opts?: RequestOptions) => request<T>("GET", path, undefined, { ...opts, params }),
  post: <T = any>(path: string, data?: any, opts?: RequestOptions) => request<T>("POST", path, data, opts),
  put: <T = any>(path: string, data?: any, opts?: RequestOptions) => request<T>("PUT", path, data, opts),
  delete: <T = any>(path: string, data?: any, opts?: RequestOptions) => request<T>("DELETE", path, data, opts),
  buildUrl,
  setToken: (token: string | null) => {
    try {
      if (token) localStorage.setItem("access_token", token)
      else localStorage.removeItem("access_token")
    } catch (e) {
      // ignore storage errors
    }
  },
  getToken,
}

export default api
