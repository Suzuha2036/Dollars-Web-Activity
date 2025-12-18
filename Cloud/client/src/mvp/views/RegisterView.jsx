import { useState } from 'react'
import { Navigate } from 'react-router-dom'

export default function RegisterView({ auth }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await auth.register(username, email, password)
    } catch (e) {
      setError(e.message)
    }
  }
  if (auth.user) return <Navigate to="/" />
  return (
    <div className="container">
      <div className="card auth-card">
        <img src="/logo.png" alt="logo" className="auth-logo" />
        <h2 className="auth-title">Create Account</h2>
        <form onSubmit={submit} className="post">
          <label htmlFor="register-username" className="muted">Username</label>
          <input id="register-username" className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          <label htmlFor="register-email" className="muted">Email</label>
          <input id="register-email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="register-password" className="muted">Password</label>
          <input id="register-password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="button block" type="submit">Register</button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  )
}