'use client'

import { useAdminData } from './useAdminData'
import { Overview } from './components/sections/Overview'

export default function AdminPage() {
  const admin = useAdminData()

  return <Overview admin={admin} />
}