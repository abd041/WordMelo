import { ToolFAQ } from "@/components/tools/ToolFAQ";

const items = [
  {
    question: "Is WordMelo free to use?",
    answer:
      "Yes. Published tools such as the Word Counter, Case Converter, Fancy Text Generator, Cursive Generator, Random Word Generator, Random Letter Generator, and Pictionary Word Generator are free to use and do not require an account.",
  },
  {
    question: "How do I count words online?",
    answer:
      "Open the Word Counter, paste or type your text, and read the live word count. You can also try the mini counter on this homepage.",
  },
  {
    question: "Can I generate random English words?",
    answer:
      "Yes. The Random Word Generator creates unique words with filters for nouns, verbs, adjectives, length, difficulty, and starting or ending letters.",
  },
  {
    question: "Can I generate random letters A to Z?",
    answer:
      "Yes. The Random Letter Generator picks letters, vowels, or consonants, supports unique batches, exclusions, and an alphabet wheel.",
  },
  {
    question: "Can I generate Pictionary drawing prompts?",
    answer:
      "Yes. The Pictionary Word Generator offers curated non-living drawing prompts plus a local timed team game with scoring.",
  },
  {
    question: "Can I convert uppercase and lowercase text?",
    answer:
      "Yes. The Case Converter changes text to uppercase, lowercase, sentence case, title case, camelCase, snake_case, and more in your browser.",
  },
  {
    question: "Can I generate fancy fonts to copy and paste?",
    answer:
      "Yes. The Fancy Text Generator turns plain text into stylish Unicode styles you can copy into bios and usernames. It runs in your browser.",
  },
  {
    question: "Can I create cursive text and handwriting?",
    answer:
      "Yes. The Cursive Generator offers Unicode script to copy and paste, plus a Handwriting Studio with real cursive fonts and PNG download.",
  },
  {
    question: "Can I count characters and sentences?",
    answer:
      "Yes. The Word Counter reports characters with and without spaces, graphemes, sentences, and paragraphs alongside word count.",
  },
  {
    question: "Is my text uploaded to a server?",
    answer:
      "No. Tool text is processed locally in your browser and is not uploaded to WordMelo servers for analysis.",
  },
  {
    question: "Can I use WordMelo on mobile?",
    answer:
      "Yes. The homepage and published tools are designed to work on phones, tablets, and desktops.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. You can use published WordMelo tools without creating an account or signing in.",
  },
];

export function HomeFAQ() {
  return (
    <section className="border-t border-line bg-mint/40 py-12 sm:py-14">
      <div className="container-page max-w-3xl">
        <ToolFAQ title="Common questions" items={items} />
      </div>
    </section>
  );
}
