'use client'

import { useAdminData } from '../useAdminData'
import { ReviewsSection } from '../components/sections/ReviewsSection'

export default function ReviewsPage() {
  const admin = useAdminData()

  return <ReviewsSection admin={admin} />
}