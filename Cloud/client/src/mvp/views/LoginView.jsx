import { useState } from 'react'
import { Navigate } from 'react-router-dom'

export default function LoginView({ auth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await auth.login(email, password)
    } catch (e) {
      setError(e.message)
    }
  }
  if (auth.user) return <Navigate to="/" />
  return (
    <div className="container">
      <div className="card auth-card">
        <img src="/logo.png" alt="logo" className="auth-logo" />
        <h2 className="auth-title">Login</h2>
        <form onSubmit={submit} className="post">
          <label htmlFor="login-identifier" className="muted">Email or Username</label>
          <input id="login-identifier" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="login-password" className="muted">Password</label>
          <input id="login-password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="button block" type="submit">Login</button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  )
}