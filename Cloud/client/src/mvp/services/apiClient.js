const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const request = async (path, opts = {}, token) => {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (token) headers.Authorization = 'Bearer ' + token
  try {
    const res = await fetch(BASE_URL + path, { ...opts, headers })
    if (!res.ok) {
      let message = `HTTP ${res.status}`
      try {
        const data = await res.json()
        if (data && data.message) message = data.message
      } catch (_) {}
      throw new Error(message)
    }
    return res.json()
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error('Network error: failed to reach server')
    }
    throw e
  }
}

export { request, BASE_URL }