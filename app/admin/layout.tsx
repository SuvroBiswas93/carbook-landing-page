import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AdminDataProvider } from './AdminDataProvider'
import { AdminShell } from './AdminShell'

export const metadata: Metadata = {
  title: 'Admin | Traveling Bangladesh',
  description: 'Traveling Bangladesh admin control center.',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminDataProvider>
      <AdminShell>{children}</AdminShell>
    </AdminDataProvider>
  )
}