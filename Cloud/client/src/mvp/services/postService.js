import { request } from './apiClient'

export const listFeed = (token, page = 1, limit = 20) => request(`/posts?page=${page}&limit=${limit}`, {}, token)
export const listByAuthor = (token, authorId) => request(`/posts/author/${authorId}`, {}, token)
export const createPost = (token, data) => request('/posts', { method: 'POST', body: JSON.stringify(data) }, token)
export const votePost = (token, id, value) => request(`/posts/${id}/vote`, { method: 'POST', body: JSON.stringify({ value }) }, token)
export const sharePost = (token, id, caption = '') => request(`/posts/${id}/share`, { method: 'POST', body: JSON.stringify({ caption }) }, token)
export const listComments = (token, postId) => request(`/comments/post/${postId}`, {}, token)
export const addComment = (token, data) => request('/comments', { method: 'POST', body: JSON.stringify(data) }, token)
export const deleteComment = (token, id) => request(`/comments/${id}`, { method: 'DELETE' }, token)
export const updatePost = (token, id, data) => request(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token)
export const deletePost = (token, id) => request(`/posts/${id}`, { method: 'DELETE' }, token)
