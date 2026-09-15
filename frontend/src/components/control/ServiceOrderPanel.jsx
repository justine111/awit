import { useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useControlStore } from "@/store/useControlStore";
import { Trash2, Music, BookOpen } from "lucide-react";

const TYPE_ICON = { song: <Music size={18} />, verse: <BookOpen size={18} /> };

function Row({ item, index, isActive, onSelect, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-2 rounded-lg group transition-colors ${
        isActive
          ? "bg-sky-500/10 border border-sky-500/30"
          : "hover:bg-muted border border-transparent"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-100 hover:text-foreground px-1 select-none"
        title="Drag to reorder"
        aria-label="Drag to reorder"
        aria-roledescription="sortable item handle"
      >
        ⠿
      </button>

      {/* Type icon */}
      <span className="text-sm shrink-0" aria-hidden="true">
        {TYPE_ICON[item.type] ?? "📄"}
      </span>

      {/* Title + metadata */}
      <button
        onClick={() => onSelect(index)}
        className="flex-1 text-left min-w-0 cursor-pointer"
        aria-label={`Select ${item.title}`}
      >
        <div
          className={`text-sm font-medium truncate ${isActive ? "text-sky-500" : "text-foreground"}`}
        >
          {item.title}
        </div>
        <div className="text-xs text-muted-foreground">
          {item.type === "song" ? "Song" : "Verse"} · {item.slides.length} slide
          {item.slides.length !== 1 ? "s" : ""}
        </div>
      </button>

      {/* Remove button */}
      <button
        onClick={() => onRemove(item.id)}
        className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 px-1.5 cursor-pointer transition-opacity"
        title="Remove from service"
        aria-label={`Remove ${item.title} from service order`}
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
  const clearServiceOrder = useControlStore((s) => s.clearServiceOrder);

  const listRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = serviceOrder.findIndex((i) => i.id === active.id);
    const newIndex = serviceOrder.findIndex((i) => i.id === over.id);
    reorderServiceOrder(oldIndex, newIndex);
  }

  // Arrow-key navigation through service order items
  function handleListKeyDown(e) {
    if (serviceOrder.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(
        (currentItemIndex ?? -1) + 1,
        serviceOrder.length - 1,
      );
      selectItem(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max((currentItemIndex ?? 0) - 1, 0);
      selectItem(prev);
    }
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-border shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Service Order
          {serviceOrder.length > 0 && (
            <span className="ml-1.5 text-foreground/50">
              ({serviceOrder.length})
            </span>
          )}
        </span>
        {serviceOrder.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Clear the entire service order?"))
                clearServiceOrder();
            }}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
            title="Clear all items"
            aria-label="Clear all service order items"
          >
            <Trash2 className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* List */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-2 focus-visible:outline-none"
        onKeyDown={handleListKeyDown}
        tabIndex={serviceOrder.length > 0 ? 0 : -1}
        aria-label="Service order list. Use arrow keys to navigate."
        role="listbox"
      >
        {serviceOrder.length === 0 && (
          <p className="text-muted-foreground text-sm px-2 py-4 text-center">
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
            <div className="space-y-1" role="group">
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
