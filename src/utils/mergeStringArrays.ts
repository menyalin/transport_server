export function mergeStringArrays(...arrays: string[][]): string[] {
  return arrays.reduce<string[]>((accumulator, currentArray) => {
    currentArray.forEach((stringItem) => {
      if (accumulator[accumulator.length - 1] !== stringItem) {
        accumulator.push(stringItem)
      }
    })
    return accumulator
  }, [])
}
