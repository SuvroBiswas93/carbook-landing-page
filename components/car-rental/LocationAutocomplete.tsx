'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, X, MapPin, AlertCircle } from 'lucide-react'
import { searchLocations } from '@/lib/location/photon'
import type { LocationResult } from '@/lib/location/types'

interface LocationAutocompleteProps {
  label: string
  value: LocationResult | null
  onChange: (location: LocationResult | null) => void
  error?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
}

export function LocationAutocomplete({
  label,
  value,
  onChange,
  error,
  open,
  onOpenChange,
  disabled = false,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [apiError, setApiError] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setShowResults(false)
    setIsLoading(false)
    setApiError(false)
    abortRef.current?.abort()
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setShowResults(false)
      return
    }

    if (query.length < 3) {
      setResults([])
      setShowResults(false)
      setApiError(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsLoading(true)
      setApiError(false)
      try {
        const data = await searchLocations(query, controller.signal)
        if (!controller.signal.aborted) {
          setResults(data)
          setShowResults(data.length > 0)
          setIsLoading(false)
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([])
          setShowResults(false)
          setIsLoading(false)
          setApiError(true)
        }
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, open])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  const handleSelect = (location: LocationResult) => {
    onChange(location)
    setQuery(location.name)
    setShowResults(false)
    setResults([])
    setApiError(false)
    onOpenChange(false)
  }

  const handleRemove = () => {
    onChange(null)
    setQuery('')
    setShowResults(false)
    setResults([])
    setApiError(false)
    onOpenChange(false)
  }

  return (
    <div ref={containerRef} className="relative text-sm font-bold text-stone-800">
      <span>{label} <span className="text-red-500">*</span></span>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        disabled={disabled}
        className={`mt-2 flex min-h-12 w-full cursor-pointer items-center justify-between rounded-2xl border bg-white px-4 text-left font-normal text-stone-500 shadow-[0_3px_8px_rgba(50,44,35,.06)] ${error ? 'border-red-400' : 'border-[#eae5dd]'}`}
      >
        <span className={`min-w-0 ${value ? 'font-semibold text-stone-800' : ''}`}>
          {value ? (
            <span className="block min-w-0">
              <span className="block break-words">{value.name}</span>
              <span className="mt-0.5 block whitespace-normal break-words text-xs font-normal text-stone-500">{value.formattedAddress}</span>
            </span>
          ) : `সিলেক্ট ${label.toLowerCase()}`}
        </span>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); handleRemove() }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleRemove() } }}
            className="ml-2 shrink-0 cursor-pointer text-stone-400 hover:text-red-500"
            aria-label="লোকেশন মুছে ফেলুন"
          >
            <X size={18} />
          </span>
        ) : (
          <Search size={20} className="text-stone-400" />
        )}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#eae5dd] bg-white shadow-[0_18px_35px_rgba(50,44,35,.18)]">
          <div className="m-3 flex items-center gap-3 rounded-xl border border-[#eae5dd] px-3 py-2 text-stone-400">
            <Search size={19} />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                onOpenChange(true)
              }}
              placeholder="লোকেশন খুঁজুন..."
              className="w-full bg-transparent text-sm font-normal text-stone-800 outline-none placeholder:text-stone-400"
            />
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {query.length >= 3 && !isLoading && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-amber-600" size={24} />
              </div>
            )}
            {apiError && (
              <div className="flex flex-col items-center justify-center py-8 text-stone-400">
                <AlertCircle size={24} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">Unable to find this location. Please try another search.</span>
              </div>
            )}
            {!isLoading && !apiError && showResults && results.length > 0 && (
              <>
                <div className="border-b border-[#f0ece6] px-5 py-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider">Search results</div>
                {results.map((result) => (
                  <button
                    key={`${result.name}-${result.latitude}-${result.longitude}`}
                    type="button"
                    onClick={() => handleSelect(result)}
                    className="block w-full cursor-pointer border-t border-[#f0ece6] px-5 py-3 text-left transition hover:bg-amber-50"
                  >
                    <span className="block text-base font-bold text-stone-800">{result.name}</span>
                    <span className="block text-xs font-normal text-stone-400">
                      {result.type ? `${result.type} · ` : ''}{result.formattedAddress}
                    </span>
                  </button>
                ))}
              </>
            )}
            {!isLoading && !apiError && query.length >= 3 && !showResults && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-stone-400">
                <MapPin size={24} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">Unable to find this location. Please try another search.</span>
              </div>
            )}
          </div>
        </div>
      )}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </div>
  )
}
