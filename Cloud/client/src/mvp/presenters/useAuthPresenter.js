import { useState, useEffect } from 'react'
import * as auth from '../services/authService'

export default function useAuthPresenter() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  useEffect(() => {
    if (token && !user) {
      auth
        .me(token)
        .then(setUser)
        .catch(() => {
          setToken('')
          localStorage.removeItem('token')
        })
    }
  }, [token])
  const login = async (email, password) => {
    const res = await auth.login({ identifier: email, password })
    setToken(res.token)
    localStorage.setItem('token', res.token)
    setUser(res.user)
  }
  const register = async (username, email, password) => {
    const res = await auth.register({ username, email, password })
    setToken(res.token)
    localStorage.setItem('token', res.token)
    setUser(res.user)
  }
  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('token')
  }
  return { token, user, login, register, logout }
}