/** Whole years of professional experience from a start year. */
export function getExperienceYears(startYear: number, now = new Date()): number {
  return Math.max(0, now.getFullYear() - startYear);
}
