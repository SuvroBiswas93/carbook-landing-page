'use client'

import { useAdminData } from '../useAdminData'
import { PricingSection } from '../components/sections/PricingSection'
import { AdminLoading } from '../components/AdminLoading'

export default function PricingPage() {
  const admin = useAdminData()

  if (admin.loading) return <AdminLoading />

  return <PricingSection admin={admin} />
}