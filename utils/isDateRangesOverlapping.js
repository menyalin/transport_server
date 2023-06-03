export function isDateRangesOverlapping(dateRanges) {
  if (!dateRanges || !Array.isArray(dateRanges))
    throw new Error('isDateRangesOverlapping: date ranges is missing')

  if (dateRanges.length === 0) return false

  if (dateRanges.some((i) => !Array.isArray(i) || i.length !== 2))
    throw new Error('isDateRangesOverlapping: date ranges invalid_1')

  if (
    !dateRanges.every(
      (i) =>
        i[0] instanceof Date &&
        isFinite(i[0]) &&
        i[1] instanceof Date &&
        isFinite(i[1])
    )
  ) {
    throw new Error('isDateRangesOverlapping: date ranges invalid_2')
  }

  for (let i = 0; i < dateRanges.length; i++) {
    for (let j = i + 1; j < dateRanges.length; j++) {
      const range1 = dateRanges[i]
      const range2 = dateRanges[j]
      if (range1[0] < range2[1] && range2[0] < range1[1]) {
        return true
      }
    }
  }
  return false
}
