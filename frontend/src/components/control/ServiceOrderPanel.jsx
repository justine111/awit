import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useControlStore } from "@/store/useControlStore";

function Row({ item, index, isActive, onSelect, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-2 rounded-lg group ${
        isActive
          ? "bg-amber-500/15 border border-amber-500/40"
          : "hover:bg-slate-800 border border-transparent"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-600 px-1 select-none"
        title="Drag to reorder"
      >
        ⠿
      </button>
      <button
        onClick={() => onSelect(index)}
        className="flex-1 text-left min-w-0"
      >
        <div className="text-sm text-slate-50 truncate">{item.title}</div>
        <div className="text-xs text-slate-600">
          {item.type === "song" ? "Song" : "Verse"} · {item.slides.length} slide
          {item.slides.length !== 1 ? "s" : ""}
        </div>
      </button>
      <button
        onClick={() => onRemove(item.id)}
        className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 px-2 text-sm"
        title="Remove from service"
      >
        ✕
      </button>
    </div>
  );
}

export default function ServiceOrderPanel() {
  const serviceOrder = useControlStore((s) => s.serviceOrder);
  const currentItemIndex = useControlStore((s) => s.currentItemIndex);
  const selectItem = useControlStore((s) => s.selectItem);
  const removeFromServiceOrder = useControlStore(
    (s) => s.removeFromServiceOrder,
  );
  const reorderServiceOrder = useControlStore((s) => s.reorderServiceOrder);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = serviceOrder.findIndex((i) => i.id === active.id);
    const newIndex = serviceOrder.findIndex((i) => i.id === over.id);
    reorderServiceOrder(oldIndex, newIndex);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 text-xs uppercase tracking-wide text-ink-600 border-b border-ink-800">
        Service order
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {serviceOrder.length === 0 && (
          <p className="text-ink-600 text-sm px-2 py-4">
            Queue is empty — add songs or verses from the left.
          </p>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={serviceOrder.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {serviceOrder.map((item, index) => (
                <Row
                  key={item.id}
                  item={item}
                  index={index}
                  isActive={index === currentItemIndex}
                  onSelect={selectItem}
                  onRemove={removeFromServiceOrder}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
