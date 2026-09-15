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
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg group transition-all cursor-default ${
        isActive
          ? "bg-sky-500/8 border border-sky-500/20 relative"
          : "hover:bg-muted/30 border border-transparent"
      }`}
    >
      {/* Active left accent */}
      {isActive && (
        <div className="absolute left-0 inset-y-2 w-0.5 bg-sky-500 rounded-r-full" />
      )}

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground/70 px-1 select-none text-base leading-none transition-colors"
        title="Drag to reorder"
        aria-label="Drag to reorder"
        aria-roledescription="sortable item handle"
      >
        ⠿
      </button>

      {/* Type icon */}
      <span className={`shrink-0 ${isActive ? "text-sky-400" : "text-muted-foreground/50"}`} aria-hidden="true">
        {TYPE_ICON[item.type] ?? "📄"}
      </span>

      {/* Title + metadata */}
      <button
        onClick={() => onSelect(index)}
        className="flex-1 text-left min-w-0 cursor-pointer"
        aria-label={`Select ${item.title}`}
      >
        <div className={`text-[13px] font-medium truncate ${isActive ? "text-sky-400" : "text-foreground/90"}`}>
          {item.title}
        </div>
        <div className="text-[10px] text-muted-foreground/50">
          {item.type === "song" ? "Song" : "Verse"} · {item.slides.length} slide{item.slides.length !== 1 ? "s" : ""}
        </div>
      </button>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="text-muted-foreground/20 hover:text-red-400 opacity-0 group-hover:opacity-100 p-1 rounded cursor-pointer transition-all"
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-border/60 shrink-0">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Service Order
          {serviceOrder.length > 0 && (
            <span className="ml-1.5 bg-muted/50 text-foreground/50 px-1.5 py-0.5 rounded-full text-[10px]">
              {serviceOrder.length}
            </span>
          )}
        </span>
        {serviceOrder.length > 0 && (
          <button
            onClick={() => { if (confirm("Clear the entire service order?")) clearServiceOrder(); }}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-red-400 transition-colors cursor-pointer"
            title="Clear all items"
            aria-label="Clear all service order items"
          >
            <Trash2 className="w-3 h-3" /> Clear
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
