import { request } from './apiClient'

export const getUser = (token, id) => request(`/users/${id}`, {}, token)
export const updateMe = (token, data) => request('/users/me', { method: 'PUT', body: JSON.stringify(data) }, token)
export const changePassword = (token, data) => request('/users/me/password', { method: 'POST', body: JSON.stringify(data) }, token)
export const deleteMe = (token) => request('/users/me', { method: 'DELETE' }, token)