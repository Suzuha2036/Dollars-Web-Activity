import { useEffect, useState } from 'react'
import * as users from '../services/userService'

export default function useProfilePresenter(token, id) {
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const load = async () => {
    const data = await users.getUser(token, id)
    setProfile(data)
  }
  useEffect(() => {
    if (token && id) load()
  }, [token, id])
  const updateMe = async (payload) => {
    setSaving(true)
    const data = await users.updateMe(token, payload)
    setProfile(data)
    setSaving(false)
  }
  return { profile, load, updateMe, saving }
}