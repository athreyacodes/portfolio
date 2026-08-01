export function getExperienceYears(startYear: number): number {
  return new Date().getFullYear() - startYear;
}
