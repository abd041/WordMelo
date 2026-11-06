export interface WordGoalProgress {
  current: number;
  target: number;
  /** Completion percent, which may exceed 100 when the goal is passed. */
  percent: number;
  /** 0–100, capped so the bar does not overflow. */
  barPercent: number;
  remaining: number;
  excess: number;
  status: "empty" | "in-progress" | "complete" | "over";
}

export function wordGoalProgress(
  current: number,
  target: number,
): WordGoalProgress | null {
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) {
    return null;
  }

  const safeCurrent = Math.max(0, current);
  const ratio = safeCurrent / target;
  const percent = Math.round(ratio * 1000) / 10;
  const excess = Math.max(0, safeCurrent - target);
  const remaining = Math.max(0, target - safeCurrent);

  let status: WordGoalProgress["status"] = "in-progress";
  if (safeCurrent === 0) status = "empty";
  else if (excess > 0) status = "over";
  else if (safeCurrent === target) status = "complete";

  return {
    current: safeCurrent,
    target,
    percent,
    barPercent: Math.min(100, Math.max(0, ratio * 100)),
    remaining,
    excess,
    status,
  };
}

export const WORD_GOAL_PRESETS = [100, 250, 500, 750, 1000, 1500, 2000] as const;
