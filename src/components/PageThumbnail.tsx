import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { PageEntry } from '../types/pdf'

interface PageThumbnailProps {
  page: PageEntry
  index: number
  onDelete?: (id: string) => void
  onRotate?: (id: string) => void
  onToggleSelect?: (id: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  showSource: boolean
  selectable?: boolean
}

export function PageThumbnail({
  page,
  index,
  onDelete,
  onRotate,
  onToggleSelect,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  showSource,
  selectable = false,
}: PageThumbnailProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
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
      role="group"
      aria-label={`Page ${index + 1}${showSource ? `, ${page.sourceFileName}` : ''}`}
      className={`relative flex min-w-0 flex-col rounded-xl border bg-white p-2.5 shadow-sm ${
        isDragging ? 'opacity-40' : ''
      } ${page.selected ? 'border-brand-500 ring-2 ring-brand-200' : 'border-line'}`}
    >
      <div className="relative flex h-36 items-center justify-center rounded-lg bg-page p-2">
        <img
          src={page.thumbnailUrl}
          alt={`Page ${index + 1}`}
          style={{ transform: `rotate(${page.rotation}deg)` }}
          className="max-h-full max-w-full rounded border border-line bg-white object-contain transition-transform"
          draggable={false}
        />
        {selectable && (
          <label className="absolute left-1 top-1 grid h-11 w-11 place-items-center rounded-lg bg-white shadow-sm">
            <input
              type="checkbox"
              checked={page.selected}
              onChange={() => onToggleSelect?.(page.id)}
              aria-label={`Sélectionner la page ${index + 1}`}
              className="h-5 w-5 accent-brand-600"
            />
          </label>
        )}
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Déplacer la page ${index + 1} par glisser-déposer ou avec les flèches du clavier`}
          className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-lg bg-white text-lg text-muted shadow-sm cursor-grab active:cursor-grabbing"
          title="Déplacer la page"
        >
          ⋮⋮
        </button>
      </div>
      <div className="mt-2 min-w-0">
        <p className="text-sm font-semibold text-ink">Page {index + 1}</p>
        {showSource && <p className="truncate text-xs text-muted" title={page.sourceFileName}>{page.sourceFileName}</p>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          aria-label={`Monter la page ${index + 1}`}
          title="Monter"
          className="min-h-10 rounded-lg border border-line text-muted hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          aria-label={`Descendre la page ${index + 1}`}
          title="Descendre"
          className="min-h-10 rounded-lg border border-line text-muted hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↓
        </button>
        {onRotate && (
          <button
            type="button"
            onClick={() => onRotate(page.id)}
            aria-label={`Tourner la page ${index + 1}`}
            title="Tourner"
            className="min-h-10 rounded-lg border border-line text-muted hover:bg-brand-50 hover:text-brand-600"
          >
            ↻
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(page.id)}
            aria-label={`Retirer la page ${index + 1}`}
            title="Retirer"
            className="min-h-10 rounded-lg border border-line text-red-600 hover:bg-red-50"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
