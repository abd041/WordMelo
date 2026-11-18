export const TEXT_COMPARE_PATH = "/text-compare";

export const TEXT_COMPARE_TITLE =
  "Text Compare Tool – Compare Two Texts Online Free | WordMelo";

export const TEXT_COMPARE_DESCRIPTION =
  "Compare two texts online for free. Find added, removed, and changed words or lines with side-by-side highlighting and instant results.";

export const TEXT_COMPARE_H1 = "Free Text Compare Tool";

export const TEXT_COMPARE_SUBTITLE =
  "Paste two versions and highlight added, removed, and replaced words, lines, or characters. The comparison stays in your browser.";

export const TEXT_COMPARE_KEYWORDS = [
  "text compare",
  "compare text online",
  "compare two texts",
  "text difference checker",
  "online text diff",
  "find differences between two texts",
  "text comparison tool",
] as const;

export const TEXT_COMPARE_FAQS = [
  {
    question: "How can I compare two texts online?",
    answer:
      "Paste the original into Text A and the edited version into Text B, choose word, line, or character comparison, then press Compare Text. Additions, removals, and replacements are highlighted. You can also swap the sides, load an example, or download the result.",
  },
  {
    question: "Is the Text Compare Tool free?",
    answer:
      "Yes. It is free in the browser and does not require an account.",
  },
  {
    question: "Can I compare two paragraphs?",
    answer:
      "Yes. Paste each paragraph into its own editor. Word comparison is the default and works well for a rewritten sentence or a short passage. Line comparison is useful when each line is a separate item.",
  },
  {
    question: "How do I find differences between two documents?",
    answer:
      "Copy the text out of each document and paste it here. The tool compares the pasted text. It does not open Word, PDF, or Google Docs files.",
  },
  {
    question: "Can I ignore capitalization?",
    answer:
      "Yes. Turn on Ignore capitalization. Matching treats “Draft” and “draft” as the same word, and the result still shows the spelling you pasted.",
  },
  {
    question: "Can I compare text line by line?",
    answer:
      "Yes. Choose Lines. The result marks added, deleted, replaced, and unchanged lines, and you can show line numbers. The downloaded .diff file is a separate line-based unified diff of the included text, even if the page is showing words or characters.",
  },
  {
    question: "What does the similarity percentage mean?",
    answer:
      "Similarity is 2 × matching units ÷ (units in Text A + units in Text B), shown to one decimal place. Units are words, lines, or characters after the options you selected. Two empty editors score 100. Identical included text scores 100. Text with no aligned units scores 0. Swapping the editors does not change the score. If either side is longer than 80,000 characters, the score covers only the included text and the page says the comparison is partial. If the middle cannot be aligned, no score is shown. It is an alignment score, not a judgment of meaning or plagiarism.",
  },
  {
    question: "Can I download the differences?",
    answer:
      "Yes. Copy a readable summary, or download a .txt report, a .diff file, or an HTML report. Files are created on your device. The names are wordmelo-text-comparison.txt, wordmelo-text-comparison.diff, and wordmelo-text-comparison.html.",
  },
  {
    question: "Is my text stored or uploaded?",
    answer:
      "No. Both editors are compared in your browser. WordMelo does not upload the text, save it in an account, or send it to a text-processing service.",
  },
  {
    question: "Can I use the tool on mobile?",
    answer:
      "Yes. On a narrow screen the editors stack, the controls wrap, and the side-by-side result stacks each change instead of scrolling sideways. Unified view stays in one column.",
  },
] as const;
