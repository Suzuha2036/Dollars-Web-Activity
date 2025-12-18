import { BASE_URL } from './apiClient'

export const uploadImage = async (token, file, folder = 'posts') => {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE_URL}/uploads/image?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    headers: token ? { Authorization: 'Bearer ' + token } : undefined,
    body: form
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Upload failed')
  }
  return res.json()
}