import axios from 'axios'

const baseURL = process.env.REACT_APP_API_BASE_URL

if (!baseURL) {
  console.error('[API] REACT_APP_API_BASE_URL is NOT set! Check your .env')
  throw new Error('REACT_APP_API_BASE_URL is not defined. Put it into .env and restart dev server.')
}

console.log('[API baseURL]', baseURL)

const http = axios.create({ baseURL })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(err)
  }
)

export async function postFallback<T = any>(paths: string[], body: any) {
  let lastErr: any = null
  for (const p of paths) {
    try {
      return await http.post<T>(p, body)
    } catch (e: any) {
      const code = e?.response?.status
      if (code && code !== 404) throw e
      lastErr = e
    }
  }
  throw lastErr ?? new Error('No matching endpoint from list')
}

export default http
