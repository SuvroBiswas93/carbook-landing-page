'use client'

import type { Car as FleetCar } from '@/lib/store'
import type { AdminData } from '../../useAdminData'
import { PAGE_SIZE_OPTIONS, usePagination } from '../../usePagination'
import { CarCards } from '../CarCards'
import { CarForm } from '../CarForm'
import { Module } from '../Module'
import { Pagination } from '../Pagination'

export function FleetSection({ admin }: { admin: AdminData }) {
  const { cars, editingCar, carForm, setCarForm } = admin
  const { currentPage, pageSize, totalPages, setCurrentPage, changePageSize, paginate } =
    usePagination<FleetCar>(cars.length)
  const pageCars = paginate(cars)

  return (
    <Module
      title="Fleet"
      description="Add, edit, publish, hide, or delete cars shown on the website."
      action={editingCar ? 'Cancel edit' : 'New car'}
      onAction={admin.resetCarForm}
    >
      <CarForm
        form={carForm}
        setForm={setCarForm}
        onSave={admin.saveCar}
        editing={!!editingCar}
      />
      <div className="overflow-hidden rounded-2xl border border-[#e7e0d5] bg-[#fffdf9]">
        {pageCars.length === 0 ? (
          <p className="p-8 text-center text-[#8c8378]">No cars yet.</p>
        ) : (
          <div className="p-5">
            <CarCards
              cars={pageCars}
              onEdit={admin.startEditCar}
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