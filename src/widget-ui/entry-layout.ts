import { ENTRY_LAYOUTS, type EntryLayout } from "@/lib/appearance-presets";

export function normalizeEntryLayout(value: unknown): EntryLayout {
  const s = typeof value === "string" ? value : String(value ?? "");
  if (ENTRY_LAYOUTS.some((l) => l.value === s)) return s as EntryLayout;
  return "list";
}
