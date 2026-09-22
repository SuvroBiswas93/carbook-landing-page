import type { AdminData } from '../../useAdminData'
import { Module } from '../Module'
import { PricingForm } from '../PricingForm'

export function PricingSection({ admin }: { admin: AdminData }) {
  return (
    <Module
      title="Pricing"
      description="Set the base fare and per-kilometer rate for each car."
    >
      <PricingForm cars={admin.cars} onSave={admin.saveCarPricing} />
    </Module>
  )
}