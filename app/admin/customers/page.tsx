'use client'

import { useAdminData } from '../useAdminData'
import { CustomersSection } from '../components/sections/CustomersSection'

export default function CustomersPage() {
  const admin = useAdminData()

  return <CustomersSection admin={admin} />
}