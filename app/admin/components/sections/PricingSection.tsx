import type { AdminData } from '../../useAdminData'
import { Module } from '../Module'
import { PricingForm } from '../PricingForm'

export function PricingSection({ admin }: { admin: AdminData }) {
  const categories = Array.from(
    new Set(admin.cars.map((car) => car.category.trim()).filter(Boolean))
  )

  return (
    <Module
      title="Pricing"
      description="Set the base fare and per-kilometer rate for each car type."
    >
      <PricingForm
        form={admin.pricingForm}
        setForm={admin.setPricingForm}
        categories={categories}
        onSave={admin.savePricing}
      />
    </Module>
  )
}