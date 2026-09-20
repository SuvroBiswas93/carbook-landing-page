'use client'

import { useAdminData } from '../useAdminData'
import { PricingSection } from '../components/sections/PricingSection'

export default function PricingPage() {
  const admin = useAdminData()

  return <PricingSection admin={admin} />
}