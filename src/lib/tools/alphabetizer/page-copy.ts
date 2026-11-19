export const ALPHABETIZER_PATH = "/alphabetizer";

export const ALPHABETIZER_TITLE =
  "Alphabetizer – Sort Lists in Alphabetical Order Online | WordMelo";

export const ALPHABETIZER_DESCRIPTION =
  "Alphabetize words, names, and lists online for free. Sort A–Z or Z–A, remove duplicates, sort numbers, and copy or download your results instantly.";

export const ALPHABETIZER_H1 = "Free Online Alphabetizer";

export const ALPHABETIZER_SUBTITLE =
  "Sort words, names, numbers, and lists in seconds. Choose alphabetical, numerical, or custom sorting and copy your results for free.";

export const ALPHABETIZER_KEYWORDS = [
  "alphabetizer",
  "alphabetical order generator",
  "alphabetize list",
  "alphabetize words",
  "sort text online",
  "alphabetical order tool",
  "sort lines alphabetically",
  "put words in alphabetical order",
  "alphabetical order sorter",
] as const;

export const ALPHABETIZER_FAQS = [
  {
    question: "How do I alphabetize a list online?",
    answer:
      "Paste one item per line into Your List, leave Alphabetical A–Z selected, then press Sort My List. Copy or download the Sorted Results. You can also shuffle, reverse, or sort by number, length, or last name.",
  },
  {
    question: "Is this alphabetizer free?",
    answer: "Yes. It is free in the browser and does not require an account.",
  },
  {
    question: "Can I alphabetize words from A to Z?",
    answer:
      "Yes. Alphabetical A–Z is the default. Sorting uses English collation, so dictionary order comes first and capitalization is a tie-breaker. Your original spelling stays in the result.",
  },
  {
    question: "Can I sort a list in reverse alphabetical order?",
    answer:
      "Yes. Choose Alphabetical Z–A. That is a descending alphabetical sort, not a reverse of the original paste. Use Reverse current order if you only want to flip the existing sequence.",
  },
  {
    question: "Can I sort names by last name?",
    answer:
      "Yes. Last name A–Z uses the last whitespace-separated word, after trimming trailing punctuation. It is a simple heuristic. Suffixes such as Jr. and multi-part family names may need a manual check.",
  },
  {
    question: "Can I remove duplicates while alphabetizing?",
    answer:
      "Yes. Turn on Remove duplicate lines. The first original occurrence is kept. If Ignore capitalization is on, Apple and apple count as the same line. If it is off, they both stay.",
  },
  {
    question: "Can I sort numbers?",
    answer:
      "Yes. Numbers, smallest to largest and largest to smallest accept signed values and decimals after surrounding spaces are ignored. Lines that are not numbers stay after the numeric values and are ordered alphabetically. They are never treated as zero. Natural A–Z is for labels such as file1, file2, file10.",
  },
  {
    question: "Does the alphabetizer work with accented letters?",
    answer:
      "Yes. English collation keeps accented letters distinct unless you turn on Ignore capitalization, which folds case but still keeps accents. Emoji and combining characters stay intact.",
  },
  {
    question: "Can I download the sorted list?",
    answer:
      "Yes. Download a UTF-8 text file named wordmelo-alphabetized-list.txt, or a one-column CSV named wordmelo-alphabetized-list.csv. Files are created on your device.",
  },
  {
    question: "Is my pasted text private?",
    answer:
      "Yes. Sorting runs in your browser. WordMelo does not upload the list, save it in an account, or send it to a text-processing service.",
  },
] as const;
