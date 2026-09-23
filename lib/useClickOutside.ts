'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

type OutsideEvent = 'pointerdown' | 'mousedown'

export function useClickOutside(
  refs: Array<RefObject<Element | null>>,
  onOutside: () => void,
  eventName: OutsideEvent = 'pointerdown'
): void {
  const onOutsideRef = useRef(onOutside)
  onOutsideRef.current = onOutside
  const refsRef = useRef(refs)
  refsRef.current = refs

  useEffect(() => {
    const handleOutside = (event: Event) => {
      const target = event.target as Node
      const inside = refsRef.current.some((ref) => ref.current?.contains(target))
      if (!inside) onOutsideRef.current()
    }
    document.addEventListener(eventName, handleOutside)
    return () => document.removeEventListener(eventName, handleOutside)
  }, [eventName])
}