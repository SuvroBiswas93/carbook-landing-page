import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AdminShell } from './AdminShell'

export const metadata: Metadata = {
  title: 'Admin | LuxeDrive',
  description: 'LuxeDrive admin control center.',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}