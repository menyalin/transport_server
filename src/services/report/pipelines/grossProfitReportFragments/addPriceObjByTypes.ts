// @ts-nocheck
export const addPriceObjByTypes = (priceTypes) => {
  const prices = {}
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
