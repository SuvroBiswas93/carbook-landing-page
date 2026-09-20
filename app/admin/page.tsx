'use client'

import { useAdminData } from './useAdminData'
import { Overview } from './components/sections/Overview'
import { AdminLoading } from './components/AdminLoading'

export default function AdminPage() {
  const admin = useAdminData()

  if (admin.loading) return <AdminLoading />

  return <Overview admin={admin} />
}