export const TYPING_PATH = "/typing-speed-test";

export const TYPING_TITLE = "Free Typing Speed Test – Check WPM & Accuracy | WordMelo";

export const TYPING_DESCRIPTION =
  "Test your typing speed online for free. Check your WPM, accuracy, and mistakes with 15, 30, 60, or 120-second typing tests. No signup needed.";

export const TYPING_H1 = "Free Typing Speed Test";

export const TYPING_SUBTITLE =
  "Find out how fast you type with a free online typing speed test. Measure your words per minute, improve accuracy, and track your progress.";

export const TYPING_KEYWORDS = [
  "typing speed test",
  "wpm test",
  "words per minute test",
  "typing test online",
  "free typing test",
  "typing accuracy test",
  "1 minute typing test",
  "keyboard typing speed test",
  "check typing speed",
] as const;

export const TYPING_FAQS = [
  {
    question: "How can I check my typing speed?",
    answer:
      "Choose a duration, difficulty, and Words or Sentences, then type the passage. The timer starts on your first character. When time ends, the results show net WPM, gross WPM, and keystroke accuracy.",
  },
  {
    question: "What is WPM?",
    answer:
      "WPM means words per minute. WordMelo uses the common five-character word: gross WPM counts every accepted character you type, divided by five, then by elapsed minutes. Net WPM uses only characters that currently match the passage.",
  },
  {
    question: "Is this typing speed test free?",
    answer: "Yes. It is free in the browser and does not require an account.",
  },
  {
    question: "How is typing accuracy measured?",
    answer:
      "Accuracy is keystroke accuracy: correct inserts divided by all inserts. Backspacing a mistake does not erase that incorrect keystroke from the accuracy denominator, so corrections cannot inflate the percentage. The score never exceeds 100%.",
  },
  {
    question: "Can I take a one-minute typing test?",
    answer: "Yes. 60 seconds is the default. You can also choose 15, 30, or 120 seconds.",
  },
  {
    question: "What is a good typing speed?",
    answer:
      "It depends on experience, the passage, and whether you value speed or accuracy. Everyday computer work is often comfortable well below professional transcription speeds. Use your own repeats on the same duration and difficulty as the useful comparison.",
  },
  {
    question: "Can I use this test on mobile?",
    answer:
      "Yes. Tap the passage to open the keyboard. Autocorrect and paste are turned off so predicted text does not count as typed performance. A phone keyboard is slower than a physical keyboard for most people.",
  },
  {
    question: "How can I improve my WPM?",
    answer:
      "Practice short sessions, look at the screen instead of your fingers, and slow down until accuracy is high. Correct posture and a consistent schedule help more than occasional sprints. Retry the same duration so progress is comparable.",
  },
  {
    question: "Does backspace affect my typing score?",
    answer:
      "Yes. Backspace can fix the current character and raise net WPM because net WPM uses characters that currently match. It does not remove the original incorrect keystroke from accuracy. Gross WPM still counts every insert, including mistakes.",
  },
  {
    question: "Are my typing results saved?",
    answer:
      "Optional recent scores and a personal best stay in this browser's localStorage. WordMelo does not store the passage you typed, and nothing is uploaded. You can clear history at any time. Private mode or blocked storage simply skips saving.",
  },
  {
    question: "Can I retake the typing test?",
    answer:
      "Yes. Use Restart or Try Again for a new passage with the same settings. Changing duration, difficulty, or mode starts a fresh attempt so scores are never mixed.",
  },
  {
    question: "Does the typing test require registration?",
    answer: "No. There is no account, sign-in, or leaderboard.",
  },
] as const;
