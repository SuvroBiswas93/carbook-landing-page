import type { AdminData } from '../../useAdminData'
import { Module } from '../Module'
import { PricingForm } from '../PricingForm'

export function PricingSection({ admin }: { admin: AdminData }) {
  return (
    <Module
      title="Pricing"
      description="Control the rates used by the fare calculator."
    >
      <PricingForm
        form={admin.pricingForm}
        setForm={admin.setPricingForm}
        savedPricing={admin.pricing}
        onSave={admin.savePricing}
      />
    </Module>
  )
}