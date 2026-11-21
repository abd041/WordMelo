import {
  isPublishedTool,
  type PublishedTool,
  type ToolCategory,
  type ToolDefinition,
} from "./types";

export const toolCategories: ToolCategory[] = [
  {
    id: "counting",
    name: "Counting & analysis",
    description: "Measure words, characters, timing, and frequency.",
  },
  {
    id: "conversion",
    name: "Case & conversion",
    description: "Change letter case and transform text formats.",
  },
  {
    id: "formatting",
    name: "Styling & formatting",
    description: "Generate decorative or styled text variants.",
  },
  {
    id: "generation",
    name: "Generators",
    description:
      "Create sample words, writing prompts, and placeholder text.",
  },
];

/**
 * Canonical tool catalog.
 * Only tools with status "published" may appear as available products
 * or be included in the sitemap.
 */
export const tools: ToolDefinition[] = [
  {
    id: "word-counter",
    name: "Word Counter",
    slug: "word-counter",
    status: "published",
    categoryId: "counting",
    summary:
      "Count words, characters, sentences, and reading time privately in your browser.",
    description:
      "Paste or type text to get live word, character, sentence, and paragraph counts plus reading and speaking time estimates.",
    keywords: [
      "word counter",
      "character count",
      "word count tool",
      "reading time",
      "online word counter",
    ],
    href: "/word-counter",
    icon: "counter",
  },
  {
    id: "character-counter",
    name: "Character Counter",
    slug: "character-counter",
    status: "published",
    categoryId: "counting",
    summary:
      "Count characters, letters, spaces, and Unicode length with a custom limit checker.",
    description:
      "Count characters with and without spaces, letters, words, graphemes, code points, and UTF-8 bytes — plus a custom character-limit checker. Everything runs locally in your browser.",
    keywords: [
      "character counter",
      "character count",
      "letter counter",
      "letter count",
      "count characters online",
      "online character counter",
      "free character counter",
      "character counter with spaces",
      "character counter without spaces",
      "character limit checker",
      "unicode character counter",
    ],
    href: "/character-counter",
    icon: "characters",
  },
  {
    id: "case-converter",
    name: "Case Converter",
    slug: "case-converter",
    status: "published",
    categoryId: "conversion",
    summary:
      "Convert text to uppercase, lowercase, sentence case, title case, camelCase, and more.",
    description:
      "Change letter casing instantly with uppercase, lowercase, sentence case, title case, alternating case, camelCase, snake_case, kebab-case, and more — processed locally in your browser.",
    keywords: [
      "case converter",
      "uppercase converter",
      "lowercase converter",
      "convert case",
      "text case converter",
      "sentence case converter",
      "title case converter",
      "camel case converter",
      "snake case converter",
      "kebab case converter",
      "free case converter",
    ],
    href: "/case-converter",
    icon: "case",
  },
  {
    id: "title-case-converter",
    name: "Title Case Converter",
    slug: "title-case-converter",
    status: "published",
    categoryId: "conversion",
    summary:
      "Capitalize titles and headlines with APA, MLA, Chicago, and AP composition rules.",
    description:
      "Convert titles using sourced APA 7, MLA 9, Chicago 18, and AP composition-title policies. Compare styles, highlight changes, preserve brands, and batch-convert lines locally in your browser.",
    keywords: [
      "title case converter",
      "titlecase converter",
      "title capitalization tool",
      "title case generator",
      "convert to title case",
      "headline capitalization",
      "capitalize titles",
      "online title case converter",
      "APA title case converter",
      "MLA title case converter",
      "Chicago title case converter",
      "AP title capitalization",
    ],
    href: "/title-case-converter",
    icon: "title",
  },
  {
    id: "fancy-text-generator",
    name: "Fancy Text Generator",
    slug: "fancy-text-generator",
    status: "published",
    categoryId: "formatting",
    summary:
      "Generate 42 Unicode text styles to copy and paste for bios, names, and captions.",
    description:
      "Transform plain text into bold, script, gothic, circled, and decorative Unicode styles for Instagram, TikTok, Discord, and more — processed locally in your browser.",
    keywords: [
      "fancy text generator",
      "fancy font generator",
      "fancy text copy and paste",
      "stylish text generator",
      "fancy fonts copy and paste",
      "cool text generator",
      "unicode text generator",
      "aesthetic text generator",
      "instagram font generator",
      "discord font generator",
      "tiktok font generator",
      "fancy name generator",
    ],
    href: "/fancy-text-generator",
    icon: "fancy",
  },
  {
    id: "cursive-generator",
    name: "Cursive Generator",
    slug: "cursive-generator",
    status: "published",
    categoryId: "formatting",
    summary:
      "Copy and paste cursive words, names, and an A–Z script alphabet, or download handwriting as PNG.",
    description:
      "Generate cursive words and names you can copy, browse a Unicode script alphabet, and preview OFL handwriting fonts with PNG export — processed locally in your browser.",
    keywords: [
      "cursive generator",
      "cursive word generator",
      "cursive name generator",
      "cursive writing generator",
      "cursive copy and paste",
      "cursive font generator",
      "cursive alphabet generator",
      "cursive fonts copy and paste",
      "cursive handwriting generator",
      "names in cursive",
    ],
    href: "/cursive-generator",
    icon: "cursive",
  },
  {
    id: "random-word-generator",
    name: "Random Word Generator",
    slug: "random-word-generator",
    status: "published",
    categoryId: "generation",
    summary:
      "Generate random English words with length, letter, and part-of-speech filters.",
    description:
      "Create unique random English words for writing prompts, vocabulary practice, and informal games — filter by nouns, verbs, adjectives, length, difficulty, and letters, all processed locally in your browser.",
    keywords: [
      "random word generator",
      "random words",
      "random word picker",
      "generate random words",
      "random word generator online",
      "random word generator free",
      "random english word generator",
      "random noun generator",
      "random verb generator",
      "random adjective generator",
      "random 5 letter word generator",
      "creative writing word generator",
    ],
    href: "/random-word-generator",
    icon: "random",
  },
  {
    id: "pictionary-word-generator",
    name: "Pictionary Word Generator",
    slug: "pictionary-word-generator",
    status: "published",
    categoryId: "generation",
    summary:
      "Drawing prompts with categories, a team timer, word lists, and printable cards.",
    description:
      "Generate family-friendly Pictionary drawing prompts, play a timed team game, or print word cards — all processed locally in your browser.",
    keywords: [
      "pictionary word generator",
      "random pictionary word generator",
      "pictionary words",
      "pictionary word list",
      "pictionary drawing prompts",
      "easy pictionary words",
      "hard pictionary words",
      "pictionary game word generator",
    ],
    href: "/pictionary-word-generator",
    icon: "pictionary",
  },
  {
    id: "random-letter-generator",
    name: "Random Letter Generator",
    slug: "random-letter-generator",
    status: "published",
    categoryId: "generation",
    summary:
      "Pick random letters A–Z, vowels or consonants, with unique batches and an alphabet wheel.",
    description:
      "Generate random English letters instantly — choose vowels or consonants, exclude letters, avoid repeats, shuffle A–Z, or spin an accessible alphabet wheel. Everything runs locally in your browser.",
    keywords: [
      "random letter generator",
      "random letter picker",
      "random alphabet generator",
      "generate random letters",
      "random letters A to Z",
      "free random letter generator",
      "online random letter generator",
      "random vowel generator",
      "random consonant generator",
      "random letter generator wheel",
    ],
    href: "/random-letter-generator",
    icon: "letter",
  },
  {
    id: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    slug: "lorem-ipsum-generator",
    status: "published",
    categoryId: "generation",
    summary:
      "Generate Lorem Ipsum placeholder text for mockups, websites, and UI prototypes.",
    description:
      "Create classic or random Lorem Ipsum as paragraphs, sentences, words, lists, or exact character lengths. Copy or download plain text, HTML, or Markdown — all processed locally in your browser.",
    keywords: [
      "lorem ipsum generator",
      "lorem ipsum",
      "dummy text generator",
      "placeholder text generator",
      "lorem ipsum text",
      "lorem ipsum paragraphs",
      "free lorem ipsum generator",
      "generate lorem ipsum",
      "lorem ipsum copy and paste",
      "lorem ipsum HTML generator",
    ],
    href: "/lorem-ipsum-generator",
    icon: "lorem",
  },
  {
    id: "word-cloud-generator",
    name: "Word Cloud Generator",
    slug: "word-cloud-generator",
    status: "published",
    categoryId: "counting",
    summary:
      "Turn pasted text into a word cloud and download it as PNG or SVG.",
    description:
      "Create a word cloud from your own text. Filter common words, choose a shape and palette, then download a PNG or SVG — processed locally in your browser.",
    keywords: [
      "word cloud generator",
      "free word cloud generator",
      "word cloud maker",
      "word cloud creator",
      "word cloud generator from text",
      "create a word cloud online",
      "word cloud generator free",
    ],
    href: "/word-cloud-generator",
    icon: "cloud",
  },
  {
    id: "text-compare",
    name: "Text Compare",
    slug: "text-compare",
    status: "published",
    categoryId: "counting",
    summary: "Compare two texts and highlight added, removed, and changed words.",
    description:
      "Compare two texts online. Highlight added, removed, and changed words or lines, then copy or download the result — processed locally in your browser.",
    keywords: [
      "text compare",
      "compare text online",
      "compare two texts",
      "text difference checker",
      "online text diff",
      "find differences between two texts",
      "text comparison tool",
    ],
    href: "/text-compare",
    icon: "compare",
  },
  {
    id: "alphabetizer",
    name: "Alphabetizer",
    slug: "alphabetizer",
    status: "published",
    categoryId: "conversion",
    summary: "Sort words, names, and lists A–Z, by number, or by last name.",
    description:
      "Alphabetize a list in your browser. Sort A–Z or Z–A, sort numbers and names, remove duplicates, then copy or download the result.",
    keywords: [
      "alphabetizer",
      "alphabetical order generator",
      "alphabetize list",
      "alphabetize words",
      "sort text online",
      "alphabetical order tool",
      "sort lines alphabetically",
      "put words in alphabetical order",
      "alphabetical order sorter",
    ],
    href: "/alphabetizer",
    icon: "sort",
  },
  {
    id: "typing-speed-test",
    name: "Typing Speed Test",
    slug: "typing-speed-test",
    status: "published",
    categoryId: "counting",
    summary: "Check your WPM and typing accuracy with timed word and sentence tests.",
    description:
      "Take a free typing speed test in your browser. Measure net and gross WPM, keystroke accuracy, and mistakes on 15 to 120-second tests — no signup.",
    keywords: [
      "typing speed test",
      "wpm test",
      "words per minute test",
      "typing test online",
      "free typing test",
      "typing accuracy test",
      "1 minute typing test",
      "keyboard typing speed test",
      "check typing speed",
    ],
    href: "/typing-speed-test",
    icon: "keyboard",
  },
];

export function getPublishedTools(): PublishedTool[] {
  return tools.filter(isPublishedTool);
}

export function getPlannedTools(): ToolDefinition[] {
  return tools.filter((tool) => tool.status === "planned");
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getPublishedToolBySlug(slug: string): PublishedTool | undefined {
  const tool = getToolBySlug(slug);
  return tool && isPublishedTool(tool) ? tool : undefined;
}

export function searchPublishedTools(query: string): PublishedTool[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return getPublishedTools();
  }

  return getPublishedTools().filter((tool) => {
    const haystack = [
      tool.name,
      tool.summary,
      tool.description,
      ...tool.keywords,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function getCategoryById(id: ToolCategory["id"]): ToolCategory | undefined {
  return toolCategories.find((category) => category.id === id);
}

/** Show directory search only once enough tools are published to need it. */
export const TOOL_SEARCH_MIN_COUNT = 3;

export function shouldShowToolDirectorySearch(): boolean {
  return getPublishedTools().length >= TOOL_SEARCH_MIN_COUNT;
}
