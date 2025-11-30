// ============================================
// ADMIN AXIOS INSTANCE
// ============================================
// Separate axios instance for admin dashboard
// Uses different token storage key: 'admin_token'
// ============================================

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

// 🔑 ADMIN TOKEN - Separate from customer token
function getAdminToken() {
  try {
    return localStorage.getItem("admin_token")
  } catch (e) {
    return null
  }
}

async function request<T = any>(method: HttpMethod, path: string, data?: any, options: RequestOptions = {}) {
  const url = buildUrl(path, options.params)

  // 🔍 DEBUG: Log the actual URL being requested
  console.log(`📡 Admin API ${method}:`, url)
  if (options.params) {
    console.log("  └─ Params:", options.params)
  }

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  }

  // Chỉ thêm Accept header nếu không phải FormData
  if (!(data instanceof FormData)) {
    headers["Accept"] = "application/json"
  }

  // 🔑 Use ADMIN token
  const token = getAdminToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
    console.log("  └─ 🔐 Using admin_token")
  } else {
    console.warn("  └─ ⚠️ NO TOKEN!")
  }

  const init: RequestInit = {
    method,
    headers,
    signal: options.signal || undefined,
  }

  if (data !== undefined && data !== null) {
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
    console.error("❌ Admin API Error:", err.status, payload)
    throw err
  }

  if (isJson) return (await res.json()) as T
  return (await res.text()) as unknown as T
}

const adminApi = {
  request,
  get: <T = any>(path: string, params?: Record<string, any>, opts?: RequestOptions) =>
    request<T>("GET", path, undefined, { ...opts, params }),
  post: <T = any>(path: string, data?: any, opts?: RequestOptions) =>
    request<T>("POST", path, data, opts),
  put: <T = any>(path: string, data?: any, opts?: RequestOptions) =>
    request<T>("PUT", path, data, opts),
  patch: <T = any>(path: string, data?: any, opts?: RequestOptions) =>
    request<T>("PATCH", path, data, opts),
  delete: <T = any>(path: string, data?: any, opts?: RequestOptions) =>
    request<T>("DELETE", path, data, opts),
  buildUrl,

  // 🔑 Admin token management
  setAdminToken: (token: string | null) => {
    try {
      if (token) {
        localStorage.setItem("admin_token", token)
        console.log("✅ Admin token saved")
      } else {
        localStorage.removeItem("admin_token")
        console.log("🗑️ Admin token removed")
      }
    } catch (e) {
      console.error("❌ Failed to save admin token:", e)
    }
  },

  getAdminToken,

  // Check if admin is authenticated
  isAdminAuthenticated: () => {
    return !!getAdminToken()
  }
}

export default adminApi

