export const WORD_COUNTER_DRAFT_KEY = "wordmelo.word-counter.draft";
export const WORD_COUNTER_AUTOSAVE_KEY = "wordmelo.word-counter.autosave";

interface DraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface LoadedDraft {
  enabled: boolean;
  draft: string | null;
  error: boolean;
}

export function loadDraftPreference(storage: DraftStorage): LoadedDraft {
  try {
    const enabled = storage.getItem(WORD_COUNTER_AUTOSAVE_KEY) === "1";
    const draft = enabled ? storage.getItem(WORD_COUNTER_DRAFT_KEY) : null;
    return { enabled, draft, error: false };
  } catch {
    return { enabled: false, draft: null, error: true };
  }
}

export function persistDraft(
  storage: DraftStorage,
  text: string,
): "saved" | "error" {
  try {
    storage.setItem(WORD_COUNTER_AUTOSAVE_KEY, "1");
    storage.setItem(WORD_COUNTER_DRAFT_KEY, text);
    return "saved";
  } catch {
    return "error";
  }
}

export function clearStoredDraft(storage: DraftStorage): "cleared" | "error" {
  try {
    storage.removeItem(WORD_COUNTER_DRAFT_KEY);
    storage.removeItem(WORD_COUNTER_AUTOSAVE_KEY);
    return "cleared";
  } catch {
    return "error";
  }
}
