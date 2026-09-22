'use client'

import { useState } from 'react'
import type { Car as FleetCar } from '@/lib/types'
import type { AdminData } from '../../useAdminData'
import { PAGE_SIZE_OPTIONS, usePagination } from '../../usePagination'
import { CarCards } from '../CarCards'
import { CarForm } from '../CarForm'
import { Module } from '../Module'
import { Pagination } from '../Pagination'

export function FleetSection({ admin }: { admin: AdminData }) {
  const { cars, editingCar, carForm, setCarForm } = admin
  const [showForm, setShowForm] = useState(false)
  const { currentPage, pageSize, totalPages, setCurrentPage, changePageSize, paginate } =
    usePagination<FleetCar>(cars.length)
  const pageCars = paginate(cars)

  const formVisible = showForm || Boolean(editingCar)

  const handleAction = () => {
    if (editingCar) {
      admin.resetCarForm()
      setShowForm(false)
      return
    }
    setShowForm((visible) => !visible)
  }

  const handleSave = async () => {
    const saved = await admin.saveCar()
    if (saved) setShowForm(false)
  }

  return (
    <Module
      title="Fleet"
      description="Add, edit, publish, hide, or delete cars shown on the website."
      action={formVisible ? 'Cancel' : 'New car'}
      onAction={handleAction}
      actionIcon={formVisible ? null : undefined}
    >
      {formVisible && (
        <CarForm
          form={carForm}
          setForm={setCarForm}
          onSave={handleSave}
          editing={Boolean(editingCar)}
        />
      )}
      <div className="overflow-hidden rounded-2xl border border-[#e7e0d5] bg-[#fffdf9]">
        {pageCars.length === 0 ? (
          <p className="p-8 text-center text-[#8c8378]">No cars yet.</p>
        ) : (
          <div className="p-5">
            <CarCards
              cars={pageCars}
              onEdit={(car) => {
                admin.startEditCar(car)
                setShowForm(true)
              }}
              onDelete={admin.deleteCar}
              onToggle={admin.toggleCar}
            />
          </div>
        )}
        {cars.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={cars.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={changePageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            itemLabel="cars"
          />
        )}
      </div>
    </Module>
  )
}