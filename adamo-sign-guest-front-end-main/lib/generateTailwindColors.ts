/**
 * Generate Tailwind colors from CSS variables
 * @param prefix - The prefix for the CSS variable (e.g., "adamo-sign", "error").
 * @returns A Tailwind-compatible color object.
 */
export const generateTailwindColors = (
  prefix: string,
): Record<number, string> => {
  const colors: Record<number, string> = {};
  const levels = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  levels.forEach((level) => {
    colors[level] = `rgb(var(--${prefix}-${level}))`;
  });

  return colors;
};
