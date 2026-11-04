export type CaseModeId =
  | "uppercase"
  | "lowercase"
  | "sentence"
  | "title"
  | "capitalize-words"
  | "alternating"
  | "inverse"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab";

export type CaseModeGroup = "everyday" | "developer";

export interface CaseModeDefinition {
  id: CaseModeId;
  label: string;
  shortLabel: string;
  description: string;
  group: CaseModeGroup;
  /** Programming-style modes intentionally rewrite whitespace/separators */
  kind: "text" | "programming";
  keywords: string[];
}

export const CASE_MODE_GROUPS: {
  id: CaseModeGroup;
  label: string;
  blurb: string;
}[] = [
  {
    id: "everyday",
    label: "Everyday text",
    blurb: "Preserves spaces and line breaks",
  },
  {
    id: "developer",
    label: "Developer formats",
    blurb: "Rebuilds tokens into identifiers",
  },
];

export const CASE_MODES: CaseModeDefinition[] = [
  {
    id: "uppercase",
    label: "UPPERCASE",
    shortLabel: "UPPER",
    description: "Convert letters to uppercase",
    group: "everyday",
    kind: "text",
    keywords: ["uppercase", "upper case", "caps", "all caps"],
  },
  {
    id: "lowercase",
    label: "lowercase",
    shortLabel: "lower",
    description: "Convert letters to lowercase",
    group: "everyday",
    kind: "text",
    keywords: ["lowercase", "lower case", "small letters"],
  },
  {
    id: "sentence",
    label: "Sentence case",
    shortLabel: "Sentence",
    description: "Capitalize the start of each sentence",
    group: "everyday",
    kind: "text",
    keywords: ["sentence case"],
  },
  {
    id: "title",
    label: "Title Case",
    shortLabel: "Title",
    description: "Capitalize major words for titles",
    group: "everyday",
    kind: "text",
    keywords: ["title case", "headline"],
  },
  {
    id: "capitalize-words",
    label: "Capitalize Each Word",
    shortLabel: "Words",
    description: "Capitalize the first letter of each word",
    group: "everyday",
    kind: "text",
    keywords: ["capitalize", "capitalize each word"],
  },
  {
    id: "alternating",
    label: "aLtErNaTiNg cAsE",
    shortLabel: "Alt",
    description: "Alternate lowercase and uppercase letters",
    group: "everyday",
    kind: "text",
    keywords: ["alternating case", "sponge"],
  },
  {
    id: "inverse",
    label: "iNVERSE cASE",
    shortLabel: "Inverse",
    description: "Swap uppercase and lowercase letters",
    group: "everyday",
    kind: "text",
    keywords: ["inverse case", "toggle case"],
  },
  {
    id: "camel",
    label: "camelCase",
    shortLabel: "camel",
    description: "Join words as camelCase identifiers",
    group: "developer",
    kind: "programming",
    keywords: ["camel case", "camelCase"],
  },
  {
    id: "pascal",
    label: "PascalCase",
    shortLabel: "Pascal",
    description: "Join words as PascalCase identifiers",
    group: "developer",
    kind: "programming",
    keywords: ["pascal case", "PascalCase"],
  },
  {
    id: "snake",
    label: "snake_case",
    shortLabel: "snake",
    description: "Join words with underscores",
    group: "developer",
    kind: "programming",
    keywords: ["snake case", "snake_case"],
  },
  {
    id: "kebab",
    label: "kebab-case",
    shortLabel: "kebab",
    description: "Join words with hyphens",
    group: "developer",
    kind: "programming",
    keywords: ["kebab case", "kebab-case", "dash case"],
  },
];

/** Shared demo phrase for mode previews and SEO examples. */
export const CASE_MODE_EXAMPLE_SOURCE = "Hello World Example";

export function getCaseMode(id: CaseModeId): CaseModeDefinition {
  const mode = CASE_MODES.find((item) => item.id === id);
  if (!mode) {
    throw new Error(`Unknown case mode: ${id}`);
  }
  return mode;
}

export function getCaseModesByGroup(group: CaseModeGroup): CaseModeDefinition[] {
  return CASE_MODES.filter((mode) => mode.group === group);
}
