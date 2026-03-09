/**
 * Map audit score (0–100) to semantic color names for UI.
 */

export type ScoreColorName = "green" | "indigo" | "orange" | "red";

export function getScoreColor(score: number): ScoreColorName {
  if (score >= 90) return "green";
  if (score >= 70) return "indigo";
  if (score >= 50) return "orange";
  return "red";
}

/** Tailwind text/background class for score (e.g. text-green-600). */
export function getScoreColorClass(score: number, prefix: "text" | "bg" | "border" = "text"): string {
  const color = getScoreColor(score);
  const shades: Record<ScoreColorName, string> = {
    green: "600",
    indigo: "600",
    orange: "600",
    red: "600",
  };
  const shade = shades[color];
  return `${prefix}-${color}-${shade}`;
}

const SCORE_COLOR_HEX: Record<ScoreColorName, string> = {
  green: "#22c55e",
  indigo: "#4F46E5",
  orange: "#f97316",
  red: "#ef4444",
};

/** Hex color for SVG/Canvas (e.g. score ring, bars). */
export function getScoreColorHex(score: number): string {
  return SCORE_COLOR_HEX[getScoreColor(score)];
}
