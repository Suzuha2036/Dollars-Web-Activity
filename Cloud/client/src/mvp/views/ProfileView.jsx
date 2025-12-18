import { useParams, useNavigate, Link } from 'react-router-dom'
import useProfilePresenter from '../presenters/useProfilePresenter'
import { useState, useEffect } from 'react'
import * as posts from '../services/postService'
import * as users from '../services/userService'

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
      <div className="card">
        <h2>{profile.username}'s Profile</h2>
        <div className="space" />
        <div className="profile-header">
          {profile.avatarUrl && <img src={profile.avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%' }} />}
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
        <div className="row"><span className="muted">Username</span>: {profile.username}</div>
        <div className="row"><span className="muted">Bio</span>: {profile.bio}</div>
        
      </div>
      <div className="card">
        <h3>Recent Posts</h3>
        <div className="space" />
        {myPosts.length === 0 ? (
          <div className="muted">No posts yet</div>
        ) : (
          <div className="post">
            {myPosts.map((p) => (
              <div key={p._id} className="post">
                <div className="row">
                  {p.author.avatarUrl && <img src={p.author.avatarUrl} alt="avatar" style={{ width: 24, height: 24, borderRadius: '50%' }} />}
                  <span className="muted">{formatRelative(p.createdAt)}</span>
                </div>
                <div>{p.content}</div>
                {p.imageUrl && <img src={p.imageUrl} alt="post" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />}
                <div className="post-actions">
                  <span className="muted">▲ {p.upvotes} ▼ {p.downvotes} ⤴ {p.sharesCount} 💬 {p.commentsCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}