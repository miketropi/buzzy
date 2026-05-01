/** Dashboard + widget appearance helpers (keep aligned with `defaultProjectSettings`). */

export const ENTRY_LAYOUTS = [
  {
    value: "list",
    label: "List",
    description: "Classic vertical stack — best for long threads and discussions.",
  },
  {
    value: "card_grid",
    label: "Card grid",
    description: "Entries as equal tiles — strong for reviews and visual scanning.",
  },
  {
    value: "carousel",
    label: "Carousel",
    description: "Horizontal scrolling row — compact hero or featured feedback.",
  },
] as const;

export type EntryLayout = (typeof ENTRY_LAYOUTS)[number]["value"];

export const COLOR_PRESETS = [
  { id: "brand_lime" as const, label: "Buzzy gold", primary: "#f5db8d" },
  { id: "ocean" as const, label: "Ocean", primary: "#0ea5e9" },
  { id: "sunset" as const, label: "Sunset", primary: "#ea580c" },
  { id: "forest" as const, label: "Forest", primary: "#16a34a" },
  { id: "mono" as const, label: "Slate", primary: "#64748b" },
  { id: "violet" as const, label: "Violet", primary: "#7c3aed" },
  { id: "custom" as const, label: "Custom", primary: "" },
] as const;

export type ColorPresetId = (typeof COLOR_PRESETS)[number]["id"];

export function presetPrimary(id: ColorPresetId): string {
  const row = COLOR_PRESETS.find((p) => p.id === id);
  return row && row.primary ? row.primary : "#f5db8d";
}
