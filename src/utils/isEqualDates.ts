export const isEqualDates = (
  date1: Date | null,
  date2: Date | null
): boolean => {
  if (date1 === null && date2 === null) return true
  if (date1 === null || date2 === null) return false
  return +date1 === +date2
}
