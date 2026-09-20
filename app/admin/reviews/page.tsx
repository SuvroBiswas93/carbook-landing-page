'use client'

import { useAdminData } from '../useAdminData'
import { ReviewsSection } from '../components/sections/ReviewsSection'
import { AdminLoading } from '../components/AdminLoading'

export default function ReviewsPage() {
  const admin = useAdminData()

  if (admin.loading) return <AdminLoading />

  return <ReviewsSection admin={admin} />
}