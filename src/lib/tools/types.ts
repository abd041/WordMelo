export type ToolStatus = "published" | "planned";

export type ToolCategoryId =
  | "counting"
  | "conversion"
  | "generation"
  | "formatting";

export interface ToolCategory {
  id: ToolCategoryId;
  name: string;
  description: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  status: ToolStatus;
  categoryId: ToolCategoryId;
  /** One-line card description shown in directories */
  summary: string;
  /** Longer intro used on the tool page */
  description: string;
  keywords: string[];
  /** Only published tools have a public href */
  href: string | null;
  icon:
    | "counter"
    | "characters"
    | "case"
    | "title"
    | "fancy"
    | "cursive"
    | "random"
    | "pictionary"
    | "letter"
    | "lorem"
    | "cloud"
    | "compare";
}

export interface PublishedTool extends ToolDefinition {
  status: "published";
  href: string;
}

export function isPublishedTool(tool: ToolDefinition): tool is PublishedTool {
  return tool.status === "published" && typeof tool.href === "string";
}
