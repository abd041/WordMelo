import type { PromptCategoryId } from "./types";

export interface PromptCategoryMeta {
  id: PromptCategoryId;
  label: string;
  description: string;
}

export const PROMPT_CATEGORIES: PromptCategoryMeta[] = [
  {
    id: "fruits-vegetables",
    label: "Fruits & vegetables",
    description: "Produce and plant foods that are easy to sketch.",
  },
  {
    id: "plants",
    label: "Trees, flowers & plants",
    description: "Flora only — no animals or people.",
  },
  {
    id: "landscapes",
    label: "Landscapes",
    description: "Mountains, rivers, coastlines, and outdoor scenery.",
  },
  {
    id: "buildings",
    label: "Buildings & architecture",
    description: "Structures, landmarks, and exterior forms.",
  },
  {
    id: "rooms-furniture",
    label: "Houses & rooms",
    description: "Furniture and interior spaces without people.",
  },
  {
    id: "vehicles",
    label: "Vehicles",
    description: "Cars, trains, planes, bikes, and related objects.",
  },
  {
    id: "household",
    label: "Kitchen & household",
    description: "Everyday home and kitchen objects.",
  },
  {
    id: "stationery",
    label: "Stationery & school",
    description: "Desk, classroom, and writing supplies.",
  },
  {
    id: "technology",
    label: "Technology",
    description: "Electronics and devices without people.",
  },
  {
    id: "shapes-patterns",
    label: "Shapes & patterns",
    description: "Geometric forms and simple patterns.",
  },
  {
    id: "weather",
    label: "Weather & nature",
    description: "Weather, sky, and outdoor natural scenes.",
  },
  {
    id: "tools",
    label: "Tools & equipment",
    description: "Workshop, garden, and utility tools (non-weapon).",
  },
];

export function getCategoryLabel(id: PromptCategoryId): string {
  return PROMPT_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
