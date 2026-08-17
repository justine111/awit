export const ANIMATED_PRESETS = [
  { id: "aurora", label: "Aurora", className: "bg-anim-aurora" },
  { id: "embers", label: "Embers", className: "bg-anim-embers" },
  { id: "midnight", label: "Midnight", className: "bg-anim-midnight" },
  { id: "dawn", label: "Dawn", className: "bg-anim-dawn" },
];

export function getPresetClassName(id) {
  return (
    ANIMATED_PRESETS.find((p) => p.id === id)?.className ??
    ANIMATED_PRESETS[0].className
  );
}
