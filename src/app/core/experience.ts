import profile from '../data/profile.json';

/** Whole years of professional experience from a start year. */
export function getExperienceYears(
  startYear: number = profile.experienceStartYear,
  now = new Date()
): number {
  return Math.max(0, now.getFullYear() - startYear);
}
