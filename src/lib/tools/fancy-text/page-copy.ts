export const FANCY_PATH = "/fancy-text-generator";

export const FANCY_TITLE =
  "Fancy Text Generator – Copy & Paste Fonts | WordMelo";

export const FANCY_DESCRIPTION =
  "Generate fancy text with 42 stylish Unicode fonts. Copy and paste bold, cursive, gothic, and aesthetic text for Instagram, TikTok, Discord, and more.";

export const FANCY_H1 = "Fancy Text Generator – Copy & Paste Stylish Fonts";

export const FANCY_INTRO =
  "Type a name, bio, or caption and instantly copy stylish Unicode text for Instagram, TikTok, Discord, gaming profiles, and other apps that accept special characters. These are characters, not font files you install.";

export const FANCY_FAQS = [
  {
    question: "What is a fancy text generator?",
    answer:
      "It turns plain letters into Unicode characters that look bold, cursive, gothic, circled, or otherwise decorative. You copy the result and paste it into a bio, username, or short caption. WordMelo includes 42 styles and runs in your browser.",
  },
  {
    question: "How do I copy and paste fancy fonts?",
    answer:
      "Type in the box, find a style, and press Copy. Paste with the usual command in the app you are using. If the browser blocks the clipboard, the exact output is selected so you can copy it yourself. The copy is only the styled characters, not the style name.",
  },
  {
    question: "Can I use fancy text in my Instagram bio?",
    answer:
      "Often, yes. Many mathematical and fullwidth styles paste into an Instagram bio. Instagram does not guarantee every glyph, and the limit is commonly 150 characters. Preview on your phone before you publish. WordMelo is not affiliated with Instagram.",
  },
  {
    question: "Does fancy text work on TikTok?",
    answer:
      "Some TikTok display names and bios accept these characters, and some reject them or show boxes. Keep the line short and keep a plain-text backup. WordMelo is not affiliated with TikTok.",
  },
  {
    question: "Are fancy fonts actually Unicode?",
    answer:
      "Yes. Each style swaps Latin letters for other Unicode characters that look similar, or adds a combining mark or a frame. Nothing is installed on your device. A bold-looking A is a different character from a normal A.",
  },
  {
    question: "Why do some fancy letters appear as boxes?",
    answer:
      "The app or device does not have a glyph for that character. Try a simpler style such as bold or fullwidth, or paste into a different app. Unsupported scripts in your original text are left unchanged on purpose.",
  },
  {
    question: "Can I use fancy text for usernames?",
    answer:
      "Only where the site allows special characters. Gaming platforms, email addresses, and many signup forms accept plain letters and digits only. Use the gaming preview as a rough length check, then confirm in the actual username field.",
  },
  {
    question: "Is the Fancy Text Generator free?",
    answer:
      "Yes. Every style, the profile previews, the name decorations, and the plain-text converter are free. You do not need an account.",
  },
  {
    question: "Do I need to install fonts?",
    answer:
      "No. There is no font file to download. If a style looks right on this page, the receiving app still needs its own font coverage to draw those same characters.",
  },
  {
    question: "Can I convert fancy text back to normal text?",
    answer:
      "For many mathematical, fullwidth, circled, and similar letters, yes. Open Fancy text → plain text on this page. Upside-down text, spacing effects, unknown symbols, and most decorations are not fully reversible. The converter never claims to restore every Unicode string.",
  },
] as const;
