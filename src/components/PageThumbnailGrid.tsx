import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
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
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const showSource = new Set(pages.map((page) => page.sourceFileId)).size > 1

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id))
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {pages.map((page, index) => (
            <PageThumbnail
              key={page.id}
              page={page}
              index={index}
              onDelete={onDelete}
              onRotate={onRotate}
              onToggleSelect={onToggleSelect}
              onMoveUp={() => { if (index > 0) onReorder(page.id, pages[index - 1].id) }}
              onMoveDown={() => { if (index < pages.length - 1) onReorder(page.id, pages[index + 1].id) }}
              canMoveUp={index > 0}
              canMoveDown={index < pages.length - 1}
              showSource={showSource}
              selectable={selectable}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
