import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { PageEntry } from '../types/pdf'

interface PageThumbnailProps {
  page: PageEntry
  index: number
  onDelete?: (id: string) => void
  onRotate?: (id: string) => void
  onToggleSelect?: (id: string) => void
  selectable?: boolean
}

export function PageThumbnail({
  page,
  index,
  onDelete,
  onRotate,
  onToggleSelect,
  selectable = false,
}: PageThumbnailProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex flex-col items-center rounded-lg border bg-white p-2 shadow-sm cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      } ${page.selected ? 'border-brand-500 ring-2 ring-brand-200' : 'border-gray-200'}`}
    >
      <div className="relative">
        <img
          src={page.thumbnailUrl}
          alt={`Page ${index + 1}`}
          style={{ transform: `rotate(${page.rotation}deg)` }}
          className="max-h-48 w-auto rounded border border-gray-100 transition-transform"
          draggable={false}
        />
        {selectable && (
          <input
            type="checkbox"
            checked={page.selected}
            onChange={() => onToggleSelect?.(page.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute left-1 top-1 h-5 w-5 accent-brand-600"
          />
        )}
      </div>
      <span className="mt-1 text-xs text-gray-500">Page {index + 1}</span>
      <div className="mt-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onRotate && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onRotate(page.id)}
            title="Tourner"
            className="rounded p-1 text-gray-600 hover:bg-gray-100"
          >
            ↻
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(page.id)}
            title="Supprimer"
            className="rounded p-1 text-red-500 hover:bg-red-50"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
