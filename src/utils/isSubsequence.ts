export function isSubsequence(mainArr: string[], subArr: string[]): boolean {
  if (subArr.length === 0) return false
  let subIndex = 0

  for (const item of mainArr) {
    if (item === subArr[subIndex]) {
      subIndex++
    }
    if (subIndex === subArr.length) {
      return true
    }
  }
  return false
}
