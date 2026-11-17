import Link from "next/link";
import { getCategoryLabel } from "@/lib/tools/pictionary/categories";
import { diverseSample } from "@/lib/tools/pictionary/examples";
import { PROMPT_STATS } from "@/lib/tools/pictionary/stats";

function WordChips({ words }: { words: ReturnType<typeof diverseSample> }) {
  return (
    <ul className="not-prose mt-4 flex flex-wrap gap-2">
      {words.map((word) => (
        <li
          key={word.id}
          className="rounded-control border border-line bg-surface px-2.5 py-1 text-sm text-ink"
        >
          {word.text}
          <span className="sr-only">, {word.difficulty}, {getCategoryLabel(word.category)}</span>
        </li>
      ))}
    </ul>
  );
}

export function PictionaryGuide() {
  const easy = diverseSample("easy", 24);
  const medium = diverseSample("medium", 18);
  const hard = diverseSample("hard", 12);

  return (
    <section className="prose-wordmelo mt-14 max-w-3xl space-y-10">
      <div>
        <h2>Easy Pictionary words</h2>
        <p>
          Easy prompts are familiar objects and scenes with a simple outline. They
          work well for a first game, a classroom warm-up, or any group that wants
          quick guesses. This list has {PROMPT_STATS.easy} easy prompts. A few of them:
        </p>
        <WordChips words={easy} />
      </div>

      <div>
        <h2>Medium Pictionary words</h2>
        <p>
          Medium is the best default for a casual game. The subjects are still
          recognizable, but they need a little more detail than a single everyday
          object. There are {PROMPT_STATS.medium} medium prompts, including:
        </p>
        <WordChips words={medium} />
      </div>

      <div>
        <h2>Hard Pictionary words</h2>
        <p>
          Hard prompts ask for a more specific structure, tool, or scene. They suit
          a group that already draws quickly and wants fewer instant guesses. The
          curated set includes {PROMPT_STATS.hard} hard prompts, such as:
        </p>
        <WordChips words={hard} />
      </div>

      <div>
        <h2>Pictionary words for kids</h2>
        <p>
          Start with Easy, leave categories on All, and use a 30-second timer so
          turns stay short. Foods, plants, vehicles, and household objects are
          straightforward drawing subjects. WordMelo does not assign an age rating.
          Pick the difficulty that matches the players in front of you, and skip a
          prompt whenever it is not a good fit.
        </p>
        <p>Beginner-friendly examples from the easy list include {easy.slice(0, 8).map((word) => word.text).join(", ")}.</p>
      </div>

      <div>
        <h2>Challenging Pictionary words for adults</h2>
        <p>
          For an experienced group, choose Hard or a single category such as
          buildings, technology, or tools. Sixty to ninety seconds is usually enough
          for a detailed sketch. Teams of two to four can rotate the drawer each
          round, and Skip keeps a stuck prompt from stalling the game.
        </p>
        <p>Examples from the hard list: {hard.slice(0, 8).map((word) => word.text).join(", ")}.</p>
      </div>

      <div>
        <h2>How to play Pictionary</h2>
        <p>
          These are suggested house rules for using this page. They are not the
          rules of any commercial board game.
        </p>
        <ol>
          <li>Choose a drawing prompt, or start Play Pictionary and let it choose one.</li>
          <li>Hide the word from the guessers. Reveal it only for the person who will draw.</li>
          <li>Start the timer. Leave this browser tab and the timer pauses.</li>
          <li>Draw the idea. Do not write the word or speak it.</li>
          <li>Let teammates guess out loud.</li>
          <li>Press Correct to give that team one point, or Skip if nobody guesses in time. Agree on the point value before you start if you want something other than one point per correct guess. The score buttons can correct a mistake.</li>
          <li>Rotate to the next team and repeat until you finish the rounds or exit.</li>
        </ol>
      </div>

      <div>
        <h2>Printable Pictionary word cards</h2>
        <p>
          The printable cards section on this page builds a preview from the same
          word list. Choose a difficulty, one or more categories, and how many cards
          you want. Then print the preview or download a PDF.
        </p>
        <p>
          Teachers can print an easy set for a classroom. Parents can cut a short
          stack for a family night. Party hosts can print a harder set and deal one
          card to each drawer. The print layout supports US Letter and A4, uses
          dashed cut guides, and leaves out the site navigation. If the filters
          match fewer words than you asked for, the page says so and previews the
          shorter set.
        </p>
      </div>

      <div>
        <h2>What the word list includes</h2>
        <p>
          There are {PROMPT_STATS.total} curated drawing prompts featuring objects,
          plants, places, and nature. People and animals are not in the default
          library, and the list avoids alcohol, gambling, and graphic subjects.
          That is a family-friendly content choice, not an official age certification.
        </p>
        <p>
          Need a word that is not meant for drawing? Try the{" "}
          <Link href="/random-word-generator">Random Word Generator</Link>. For a
          single letter, use the{" "}
          <Link href="/random-letter-generator">Random Letter Generator</Link>.
        </p>
      </div>
    </section>
  );
}
