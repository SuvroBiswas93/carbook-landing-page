'use client'

import { useEffect, useState } from 'react'

export const PAGE_SIZE_OPTIONS = [5, 10, 20]

export function usePagination<T>(totalItems: number, defaultPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const paginate = (items: T[]) =>
    items.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const changePageSize = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    changePageSize,
    paginate,
  }
}