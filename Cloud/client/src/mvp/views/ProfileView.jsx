import { useParams, useNavigate, Link } from 'react-router-dom'
import useProfilePresenter from '../presenters/useProfilePresenter'
import { useState, useEffect } from 'react'
import * as posts from '../services/postService'
import * as users from '../services/userService'
import { PostItem } from './FeedView'

export default function ProfileView({ token }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile, load, updateMe, saving } = useProfilePresenter(token, id)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [tab, setTab] = useState('profile')
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setBio(profile.bio || '')
    }
  }, [profile])
  const isMe = profile && profile.id === JSON.parse(atob(token.split('.')[1])).id
  const submit = async (e) => {
    e.preventDefault()
    await updateMe({ username, bio })
    await load()
  }
  const [avatarFile, setAvatarFile] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [myPosts, setMyPosts] = useState([])
  useEffect(() => {
    const loadPosts = async () => {
      if (token && profile) {
        const data = await posts.listByAuthor(token, profile.id)
        setMyPosts(data)
      }
    }
    loadPosts()
  }, [token, profile])
  const uploadAvatar = async () => {
    if (!avatarFile) return
    const { uploadImage } = await import('../services/uploadService')
    const r = await uploadImage(token, avatarFile, 'avatars')
    await updateMe({ avatarUrl: r.url })
    await load()
    setAvatarFile(null)
  }
  if (!profile) return <div className="container"><div className="card">Loading…</div></div>
  const formatRelative = (iso) => {
    const t = new Date(iso).getTime()
    const diff = Date.now() - t
    if (diff < 60000) return 'Just now'
    const m = Math.floor(diff / 60000)
    if (m < 60) return m + 'm'
    const h = Math.floor(m / 60)
    if (h < 24) return h + 'h'
    const d = Math.floor(h / 24)
    if (d < 7) return d + 'd'
    const w = Math.floor(d / 7)
    return w + 'w'
  }
  return (
    <div className="container">
      <div className="card profile-card">
        <div className="profile-header">
          {profile.avatarUrl && <img src={profile.avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%' }} />}
          <div className="profile-info">
            <div className="profile-name">{profile.username}</div>
            <div className="muted">{profile.bio}</div>
          </div>
          {isMe && (
            <div className="profile-menu-toggle" style={{ position: 'relative' }}>
              <button className="button ghost" aria-label="Settings" onClick={() => setMenuOpen((x) => !x)}>⚙</button>
              {menuOpen && (
                <div className="card" style={{ position: 'absolute', right: 0, top: '100%', minWidth: 200 }}>
                  <div className="post">
                    <Link className="link" to="/settings?tab=profile">Profile Settings</Link>
                    <Link className="link" to="/settings?tab=security">Security</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="card profile-card">
        <h3>Recent Posts</h3>
        <div className="space" />
        {myPosts.length === 0 ? (
          <div className="muted">No posts yet</div>
        ) : (
          <div>
            {myPosts.map((p) => (
              <PostItem
                key={p._id}
                post={p}
                token={token}
                user={{ id: JSON.parse(atob(token.split('.')[1])).id }}
                onVote={async (id, value) => {
                  const r = await posts.votePost(token, id, value)
                  setMyPosts((prev) => prev.map((x) => (x._id === id ? { ...x, upvotes: r.upvotes, downvotes: r.downvotes, myVote: r.myVote } : x)))
                }}
                onShare={async (id, caption = '') => {
                  const r = await posts.sharePost(token, id, caption)
                  setMyPosts((prev) => prev.map((x) => (x._id === id ? { ...x, sharesCount: r.sharesCount, sharedByMe: !!r.sharedPost || !!r.alreadyShared } : x)))
                  const meId = JSON.parse(atob(token.split('.')[1])).id
                  if (r.sharedPost && meId === profile.id) {
                    setMyPosts((prev) => [r.sharedPost, ...prev])
                  }
                }}
                onUpdate={async (id, data) => {
                  const p2 = await posts.updatePost(token, id, data)
                  setMyPosts((prev) => prev.map((x) => (x._id === id ? p2 : x)))
                }}
                onRemove={async (id) => {
                  const r = await posts.deletePost(token, id)
                  setMyPosts((prev) => prev
                    .filter((x) => x._id !== id)
                    .map((p) => (r.updatedShares && p._id === r.updatedShares.originalId ? { ...p, sharesCount: r.updatedShares.sharesCount } : p)))
                }}
                onHide={(id) => {
                  setMyPosts((prev) => prev.filter((x) => x._id !== id))
                }}
                bumpComments={(id) => {
                  setMyPosts((prev) => prev.map((x) => (x._id === id ? { ...x, commentsCount: (x.commentsCount || 0) + 1 } : x)))
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
