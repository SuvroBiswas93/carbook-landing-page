'use client'

import { useAdminData } from '../useAdminData'
import { CustomersSection } from '../components/sections/CustomersSection'
import { AdminLoading } from '../components/AdminLoading'

export default function CustomersPage() {
  const admin = useAdminData()

  if (admin.loading) return <AdminLoading />

  return <CustomersSection admin={admin} />
}