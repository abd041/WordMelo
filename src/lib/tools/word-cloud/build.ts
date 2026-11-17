import { analyzeText, type AnalyzeResult } from "./analyze";
import { layoutFromSettings } from "./layout";
import type { CloudSettings, LayoutResult } from "./types";

export interface CloudBuild {
  stats: AnalyzeResult;
  layout: LayoutResult;
}

export function buildCloud(text: string, settings: CloudSettings, seed: number): CloudBuild {
  const stats = analyzeText(text, settings);
  const layout = layoutFromSettings(stats.words, settings, seed >>> 0);
  return { stats, layout };
}
