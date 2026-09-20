'use client'

import { useAdminData } from '../useAdminData'
import { BookingsSection } from '../components/sections/BookingsSection'

export default function BookingsPage() {
  const admin = useAdminData()

  return <BookingsSection admin={admin} />
}