'use client'

import { useAdminData } from '../useAdminData'
import { FleetSection } from '../components/sections/FleetSection'
import { AdminLoading } from '../components/AdminLoading'

export default function FleetPage() {
  const admin = useAdminData()

  if (admin.loading) return <AdminLoading />

  return <FleetSection admin={admin} />
}