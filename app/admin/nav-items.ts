import {
  BarChart3,
  Car,
  LayoutDashboard,
  Settings,
  Star,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: BarChart3 },
  { label: 'Fleet', href: '/admin/fleet', icon: Car },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Pricing', href: '/admin/pricing', icon: Settings },
]