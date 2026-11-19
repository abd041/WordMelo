import Link from "next/link";

export function HomeIntro() {
  return (
    <section className="border-t border-line py-12 sm:py-14">
      <div className="container-page max-w-3xl">
        <h2 className="font-display text-3xl font-semibold text-ink sm:text-[2.1rem]">
          What is WordMelo?
        </h2>
        <div className="prose-wordmelo mt-4">
          <p>
            WordMelo is a set of free online text and writing tools for everyday
            drafts. Published tools run in your browser — no account and no
            upload required.
          </p>
          <p>
            Use the{" "}
            <Link href="/word-counter">Word Counter</Link> for words and reading
            time, the{" "}
            <Link href="/character-counter">Character Counter</Link> for
            characters and limit checks, the{" "}
            <Link href="/case-converter">Case Converter</Link> for uppercase,
            lowercase, and everyday title styles, the{" "}
            <Link href="/title-case-converter">Title Case Converter</Link> for
            APA, MLA, and Chicago headline capitalization, the{" "}
            <Link href="/fancy-text-generator">Fancy Text Generator</Link> for
            stylish Unicode fonts, the{" "}
            <Link href="/cursive-generator">Cursive Generator</Link> for script
            copy-and-paste plus handwriting PNG exports,             the{" "}
            <Link href="/random-word-generator">Random Word Generator</Link> for
            filtered English vocabulary prompts, the{" "}
            <Link href="/random-letter-generator">
              Random Letter Generator
            </Link>{" "}
            for A–Z picks and alphabet shuffles, the{" "}
            <Link href="/pictionary-word-generator">
              Pictionary Word Generator
            </Link>{" "}
            for curated drawing prompts and local team play, and the{" "}
            <Link href="/lorem-ipsum-generator">Lorem Ipsum Generator</Link> for
            design placeholder text, and the{" "}
            <Link href="/word-cloud-generator">Word Cloud Generator</Link> to
            picture which words repeat, and{" "}
            <Link href="/text-compare">Text Compare</Link> to highlight added
            and removed words, and the{" "}
            <Link href="/alphabetizer">Alphabetizer</Link> to put a list in
            A–Z or numeric order. Only finished tools are listed as
            available.
          </p>
        </div>
      </div>
    </section>
  );
}
