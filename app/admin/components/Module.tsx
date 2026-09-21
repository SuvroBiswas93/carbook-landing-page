import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModuleProps {
  title: string
  description: string
  action?: string
  onAction?: () => void
  actionIcon?: ReactNode
  children: ReactNode
}

export function Module({
  title,
  description,
  action,
  onAction,
  actionIcon = <Plus size={17} />,
  children,
}: ModuleProps) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-[#8c8378]">{description}</p>
        </div>
        {action && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 rounded-xl bg-[#292724] px-4 py-3 text-sm font-bold text-white"
          >
            {actionIcon}
            {action}
          </button>
        )}
      </div>
      <div className="mt-7">{children}</div>
    </>
  )
}