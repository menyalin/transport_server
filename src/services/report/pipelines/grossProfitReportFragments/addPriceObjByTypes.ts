export const addPriceObjByTypes = (priceTypes: string[]) => {
  const prices: Record<string, unknown> = {}
  priceTypes.forEach((type) => {
    prices[type] = {
      $arrayToObject: {
        $map: {
          input: `$${type}`,
          in: { k: '$$this.type', v: '$$this' },
        },
      },
    }
  })
  return {
    $addFields: { ...prices },
  }
}
