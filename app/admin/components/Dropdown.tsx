'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

export interface DropdownOption<T extends string> {
  value: T
  label: string
  dotClass?: string
  icon?: ReactNode
}

interface DropdownProps<T extends string> {
  value: T
  options: DropdownOption<T>[]
  onChange: (value: T) => void
  triggerClassName?: string
  menuClassName?: string
  menuWidth?: number
  ariaLabel?: string
}

export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  triggerClassName = '',
  menuClassName = '',
  menuWidth = 176,
  ariaLabel,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      const insideTrigger = triggerRef.current?.contains(target)
      const insideMenu = menuRef.current?.contains(target)
      if (!insideTrigger && !insideMenu) {
        setOpen(false)
      }
    }
    const handleScroll = () => setOpen(false)
    const handleResize = () => setOpen(false)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const toggle = () => {
    if (open) {
      setOpen(false)
      return
    }

    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return

    const menuHeight = 184
    const left = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)
    )
    const spaceBelow = window.innerHeight - rect.bottom
    const top =
      spaceBelow < menuHeight + 12
        ? Math.max(8, rect.top - menuHeight - 6)
        : rect.bottom + 6

    setCoords({ top, left })
    setOpen(true)
  }

  const current = options.find((option) => option.value === value)

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-bold ring-1 ring-inset outline-none transition-colors focus-visible:ring-2 ${triggerClassName}`}
      >
        {current?.dotClass && (
          <span className={`h-2 w-2 shrink-0 rounded-full ${current.dotClass}`} />
        )}
        <span className="truncate">{current?.label ?? value}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open &&
        coords &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: menuWidth,
            }}
            className={`z-50 rounded-xl border border-[#e7e0d5] bg-[#fffdf9] p-1.5 shadow-2xl ${menuClassName}`}
          >
            {options.map((option) => {
              const selected = option.value === value
              return (
                <li key={option.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-bold transition-colors ${
                      selected
                        ? 'bg-[#f0ebe3] text-[#282622]'
                        : 'text-[#766e64] hover:bg-[#f0ebe3]'
                    }`}
                  >
                    {option.dotClass && (
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${option.dotClass}`}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {selected && (
                      <Check size={15} className="shrink-0 text-[#a8865f]" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>,
          document.body
        )}
    </div>
  )
}