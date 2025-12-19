import { useState, useEffect, useRef } from 'react'
import useFeedPresenter from '../presenters/useFeedPresenter'
import { Link } from 'react-router-dom'

export function PostItem({ post, onVote, onShare, onUpdate, onRemove, onHide, token, user, bumpComments }) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [hiddenIds, setHiddenIds] = useState([])
  const [commentText, setCommentText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(post.content)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [openCommentId, setOpenCommentId] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareText, setShareText] = useState('')
  const loadComments = async () => {
    const svc = await import('../services/postService')
    const r = await svc.listComments(token, post._id)
    setComments(r)
  }
  const addComment = async () => {
    const svc = await import('../services/postService')
    const c = await svc.addComment(token, { postId: post._id, content: commentText })
    setComments((prev) => [c, ...prev])
    setCommentText('')
    bumpComments(post._id)
  }
  const upvote = () => onVote(post._id, post.myVote === 1 ? 0 : 1)
  const downvote = () => onVote(post._id, post.myVote === -1 ? 0 : -1)
  const share = () => setShareOpen(true)
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
  const saveEdit = async () => {
    await onUpdate(post._id, { content: editText })
    setEditing(false)
    setMenuOpen(false)
  }
  const hidePost = () => {
    onHide && onHide(post._id)
    setMenuOpen(false)
  }
  const removePost = async () => {
    await onRemove(post._id)
    setMenuOpen(false)
  }
  return (
    <div className="card post">
      <div className="row">
        {post.author.avatarUrl && <img src={post.author.avatarUrl} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
        <Link to={`/profile/${post.author._id}`} className="link">{post.author.username}</Link>
        <span className="muted">• {formatRelative(post.createdAt)}</span>
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <button className="button ghost" aria-label="Post options" onClick={() => setMenuOpen(!menuOpen)}>⋯</button>
          {menuOpen && (
            <div className="card" style={{ position: 'absolute', right: 0, top: '100%', minWidth: 180 }}>
              {!editing ? (
                <div className="post">
                  {user && user.id === post.author._id ? (
                    <>
                      <button className="button" onClick={() => setEditing(true)}>Edit</button>
                      <button className="button danger" onClick={() => setConfirmDelete(true)}>Delete</button>
                    </>
                  ) : (
                    <button className="button" onClick={hidePost}>Hide</button>
                  )}
                </div>
              ) : (
                <div className="post">
                  <input className="input" value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <div className="row">
                    <button className="button" onClick={saveEdit}>Save</button>
                    <button className="button ghost" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div>{post.content}</div>
      {post.imageUrl && !post.sharedFrom && (
        <div>
          <img src={post.imageUrl} alt="post" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
        </div>
      )}
      {!post.sharedFrom && (
        <div className="post-actions">
          <button className={`button ghost ${post.myVote === 1 ? 'vote-active' : ''}`} onClick={upvote}>▲ {post.upvotes}</button>
          <button className={`button ghost ${post.myVote === -1 ? 'vote-active' : ''}`} onClick={downvote}>▼ {post.downvotes}</button>
          <button className="button ghost" onClick={share} disabled={post.sharedByMe}>⤴ {post.sharesCount}</button>
          <button className="button ghost"
            onClick={() => {
              const next = !showComments
              setShowComments(next)
              if (next) loadComments()
            }}
          >💬 {post.commentsCount}</button>
        </div>
      )}
      {post.sharedFrom && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
          <div className="row">
            {post.sharedFrom.author?.avatarUrl && <img src={post.sharedFrom.author.avatarUrl} alt="avatar" style={{ width: 24, height: 24, borderRadius: '50%' }} />}
            {post.sharedFrom.author && <Link to={`/profile/${post.sharedFrom.author._id}`} className="link">{post.sharedFrom.author.username}</Link>}
          </div>
          <div className="space" />
          <div>{post.sharedFrom.content}</div>
          {post.sharedFrom.imageUrl && (
            <div style={{ marginTop: 8 }}>
              <img src={post.sharedFrom.imageUrl} alt="shared-post" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
            </div>
          )}
        </div>
      )}
      {post.sharedFrom && (
        <div className="post-actions">
          <button className={`button ghost ${post.myVote === 1 ? 'vote-active' : ''}`} onClick={upvote}>▲ {post.upvotes}</button>
          <button className={`button ghost ${post.myVote === -1 ? 'vote-active' : ''}`} onClick={downvote}>▼ {post.downvotes}</button>
          <button className="button ghost" onClick={share} disabled={post.sharedByMe}>⤴ {post.sharesCount}</button>
          <button className="button ghost"
            onClick={() => {
              const next = !showComments
              setShowComments(next)
              if (next) loadComments()
            }}
          >💬 {post.commentsCount}</button>
        </div>
      )}
      {showComments && (
        <div className="comment-list">
          {comments.filter((c) => !hiddenIds.includes(c._id)).map((c) => (
            <div key={c._id} className="comment-row">
              {c.author.avatarUrl && <img src={c.author.avatarUrl} alt="avatar" style={{ width: 24, height: 24, borderRadius: '50%' }} />}
              <div className="comment-body">
                <div className="comment-meta">
                  <Link to={`/profile/${c.author._id}`} className="link">{c.author.username}</Link>
                  <span className="muted">• {formatRelative(c.createdAt)}</span>
                </div>
                <div className="muted">{c.content}</div>
              </div>
              <div className="comment-menu-toggle" style={{ position: 'relative' }}>
                <button className="button ghost" aria-label="Comment options" onClick={(e) => {
                  e.stopPropagation()
                  setOpenCommentId((prev) => (prev === c._id ? null : c._id))
                }}>⋯</button>
                {openCommentId === c._id && (
                  <div className="card" style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', minWidth: 180, zIndex: 50 }}>
                    <div className="post">
                      <button className="button" onClick={() => setHiddenIds((prev) => [...prev, c._id])}>Hide</button>
                      {user && user.id === c.author._id && (
                        <button className="button danger" onClick={async () => {
                          const svc = await import('../services/postService')
                          await svc.deleteComment(token, c._id)
                          setComments((prev) => prev.filter((x) => x._id !== c._id))
                          setOpenCommentId(null)
                        }}>Delete</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="row">
            <input className="input" placeholder="Write a comment" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && commentText.trim()) addComment() }} />
            <button className="button" onClick={addComment}>Comment</button>
          </div>
        </div>
      )}
      {shareOpen && (
        <div className="modal-overlay" onClick={() => setShareOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div>Add a caption</div>
            <input className="input" placeholder="Say something about this…" value={shareText} onChange={(e) => setShareText(e.target.value)} />
            <div className="modal-actions">
              <button className="button ghost" onClick={() => setShareOpen(false)}>Cancel</button>
              <button className="button" onClick={async () => { await onShare(post._id, shareText); setShareOpen(false); setShareText('') }}>Share</button>
            </div>
          </div>
        </div>
      )}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div>Edit post</div>
            <input className="input" value={editText} onChange={(e) => setEditText(e.target.value)} />
            <div className="modal-actions">
              <button className="button ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="button" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div>Delete this post?</div>
            <div className="muted">This action cannot be undone.</div>
            <div className="modal-actions">
              <button className="button ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="button danger" onClick={removePost}>Confirm delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FeedView({ token, user }) {
  const { items, create, vote, share, update, remove, setItems } = useFeedPresenter(token)
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const composerRef = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (composerRef.current && !composerRef.current.contains(e.target)) {
        if (!content.trim() && !file) setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [content, file])
  const submit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    let imageUrl
    if (file) {
      const { uploadImage } = await import('../services/uploadService')
      const r = await uploadImage(token, file, 'posts')
      imageUrl = r.url
    }
    const p = await (async () => {
      const svc = await import('../services/postService')
      return svc.createPost(token, { content, imageUrl })
    })()
    setItems((prev) => [p, ...prev])
    setContent('')
    setFile(null)
    setExpanded(false)
  }
  const bumpComments = (id) => {
    setItems((prev) => prev.map((p) => (p._id === id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p)))
  }
  const hidePost = (id) => {
    setItems((prev) => prev.filter((p) => p._id !== id))
  }
  return (
    <div className="container">
      <div className="card post" ref={composerRef}>
        <form onSubmit={submit} className="post" onClick={() => setExpanded(true)}>
          <label htmlFor="composer-content" className="muted">Post content</label>
          <input
            id="composer-content"
            className="input"
            placeholder="Share your thoughts"
            value={content}
            onFocus={() => setExpanded(true)}
            onChange={(e) => setContent(e.target.value)}
          />
          {expanded && (
            <div className="composer-actions">
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
              <button className="button" type="submit">Post</button>
            </div>
          )}
        </form>
      </div>
      {items.map((p) => (
        <PostItem key={p._id} post={p} onVote={vote} onShare={share} onUpdate={update} onRemove={remove} onHide={hidePost} token={token} user={user} bumpComments={bumpComments} />
      ))}
    </div>
  )
}
