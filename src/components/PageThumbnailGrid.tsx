import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import type { PageEntry } from '../types/pdf'
import { PageThumbnail } from './PageThumbnail'

interface PageThumbnailGridProps {
  pages: PageEntry[]
  onReorder: (fromId: string, toId: string) => void
  onDelete?: (id: string) => void
  onRotate?: (id: string) => void
  onToggleSelect?: (id: string) => void
  selectable?: boolean
}

export function PageThumbnailGrid({
  pages,
  onReorder,
  onDelete,
  onRotate,
  onToggleSelect,
  selectable = false,
}: PageThumbnailGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id))
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pages.map((page, index) => (
            <PageThumbnail
              key={page.id}
              page={page}
              index={index}
              onDelete={onDelete}
              onRotate={onRotate}
              onToggleSelect={onToggleSelect}
              selectable={selectable}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
