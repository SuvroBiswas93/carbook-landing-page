'use client'

import { useAdminData } from '../useAdminData'
import { FleetSection } from '../components/sections/FleetSection'

export default function FleetPage() {
  const admin = useAdminData()

  return <FleetSection admin={admin} />
}