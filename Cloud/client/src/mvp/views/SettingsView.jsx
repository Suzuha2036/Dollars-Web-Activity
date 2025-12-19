import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import useProfilePresenter from '../presenters/useProfilePresenter'
import * as users from '../services/userService'

export default function SettingsView({ token, user, onDeleted }) {
  const { profile, load, updateMe, saving } = useProfilePresenter(token, user.id)
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('profile')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [confirmSave, setConfirmSave] = useState(false)
  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'security' || t === 'profile') setTab(t)
  }, [searchParams])
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setBio(profile.bio || '')
    }
  }, [profile])
  const submit = async (e) => {
    e.preventDefault()
    await updateMe({ username, bio })
    await load()
  }
  const uploadAvatar = async () => {
    if (!avatarFile) return
    const { uploadImage } = await import('../services/uploadService')
    const r = await uploadImage(token, avatarFile, 'avatars')
    await updateMe({ avatarUrl: r.url })
    await load()
    setAvatarFile(null)
  }
  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Link className="button ghost" to={`/profile/${user.id}`}>← Back to profile</Link>
          <h2>Settings</h2>
        </div>
        <div className="space" />
        <div className="row">
          <button className={`button ghost ${tab === 'profile' ? 'vote-active' : ''}`} onClick={() => setTab('profile')}>Profile</button>
          <button className={`button ghost ${tab === 'security' ? 'vote-active' : ''}`} onClick={() => setTab('security')}>Security</button>
        </div>
        <div className="space" />
        {tab === 'profile' && (
          <>
            <form className="post">
              <label htmlFor="settings-username" className="muted">Display name</label>
              <input id="settings-username" className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
              <label htmlFor="settings-bio" className="muted">Bio</label>
              <input id="settings-bio" className="input" value={bio} onChange={(e) => setBio(e.target.value)} />
              <button className="button block" type="button" disabled={saving} onClick={() => setConfirmSave(true)}>Save changes</button>
            </form>
            <div className="divider" />
            <div className="post">
              <label htmlFor="settings-avatar" className="muted">Profile picture</label>
              <input id="settings-avatar" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0] || null)} />
              <button className="button" onClick={uploadAvatar} disabled={!avatarFile}>Update avatar</button>
            </div>
            {confirmSave && (
              <div className="modal-overlay" onClick={() => setConfirmSave(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <div>Save changes?</div>
                  <div className="muted">This will update your profile information.</div>
                  <div className="modal-actions">
                    <button className="button ghost" onClick={() => setConfirmSave(false)}>Cancel</button>
                    <button className="button" onClick={async () => { await submit(new Event('submit')); setConfirmSave(false) }}>Confirm</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {tab === 'security' && (
          <SecuritySettings token={token} onDeleted={onDeleted} />
        )}
      </div>
    </div>
  )
}

function SecuritySettings({ token, onDeleted }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [confirmChange, setConfirmChange] = useState(false)
  const change = async () => {
    setErr(''); setMsg('')
    if (!currentPassword || !newPassword || !confirm) { setErr('Fill all fields'); return }
    if (newPassword !== confirm) { setErr('Passwords do not match'); return }
    try {
      await users.changePassword(token, { currentPassword, newPassword })
      setMsg('Password updated')
      setCurrentPassword(''); setNewPassword(''); setConfirm('')
    } catch (e) {
      setErr(e.message)
    }
  }
  const [confirmDelete, setConfirmDelete] = useState(false)
  const remove = async () => {
    try {
      await users.deleteMe(token)
      onDeleted && onDeleted()
    } catch (e) {
      setErr(e.message)
    }
  }
  return (
    <div className="post">
      <label htmlFor="settings-current-password" className="muted">Current password</label>
      <input id="settings-current-password" className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <label htmlFor="settings-new-password" className="muted">New password</label>
      <input id="settings-new-password" className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <label htmlFor="settings-confirm-password" className="muted">Confirm new password</label>
      <input id="settings-confirm-password" className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <button className="button block" onClick={() => setConfirmChange(true)}>Change password</button>
      <div className="divider" />
      <button className="button danger" onClick={() => setConfirmDelete(true)}>Delete account</button>
      {confirmChange && (
        <div className="modal-overlay" onClick={() => setConfirmChange(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div>Change password?</div>
            <div className="muted">You will need to log in again on other devices.</div>
            <div className="modal-actions">
              <button className="button ghost" onClick={() => setConfirmChange(false)}>Cancel</button>
              <button className="button" onClick={async () => { await change(); setConfirmChange(false) }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div>Delete your account?</div>
            <div className="muted">This will permanently remove your posts and comments.</div>
            <div className="modal-actions">
              <button className="button ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="button danger" onClick={remove}>Confirm delete</button>
            </div>
          </div>
        </div>
      )}
      {msg && <div className="success">{msg}</div>}
      {err && <div className="error">{err}</div>}
    </div>
  )
}
