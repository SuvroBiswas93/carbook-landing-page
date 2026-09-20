'use client'

import { useAdminData } from '../useAdminData'
import { BookingsSection } from '../components/sections/BookingsSection'
import { AdminLoading } from '../components/AdminLoading'

export default function BookingsPage() {
  const admin = useAdminData()

  if (admin.loading) return <AdminLoading />

  return <BookingsSection admin={admin} />
}