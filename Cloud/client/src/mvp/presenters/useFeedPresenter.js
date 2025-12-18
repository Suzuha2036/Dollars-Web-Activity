import { useEffect, useState } from 'react'
import * as posts from '../services/postService'

export default function useFeedPresenter(token) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await posts.listFeed(token)
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (token) load()
  }, [token])
  const create = async (content) => {
    const p = await posts.createPost(token, { content })
    setItems((prev) => [p, ...prev])
  }
  const vote = async (id, value) => {
    const r = await posts.votePost(token, id, value)
    setItems((prev) => prev.map((p) => (p._id === id ? { ...p, upvotes: r.upvotes, downvotes: r.downvotes, myVote: r.myVote } : p)))
  }
  const share = async (id) => {
    const r = await posts.sharePost(token, id)
    setItems((prev) => prev.map((p) => (p._id === id ? { ...p, sharesCount: r.sharesCount } : p)))
  }
  const update = async (id, data) => {
    const p = await posts.updatePost(token, id, data)
    setItems((prev) => prev.map((x) => (x._id === id ? p : x)))
  }
  const remove = async (id) => {
    await posts.deletePost(token, id)
    setItems((prev) => prev.filter((x) => x._id !== id))
  }
  return { items, loading, error, load, create, vote, share, update, remove, setItems }
}