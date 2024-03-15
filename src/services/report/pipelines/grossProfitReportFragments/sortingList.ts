import { PipelineStage } from 'mongoose'

export const sortingList = ({
  sortBy,
  sortDesc,
  priceWithVat,
}: {
  sortBy: string[]
  sortDesc: boolean[]
  priceWithVat: boolean
}): PipelineStage[] => {
  const crossMap: Record<string, string> = {
    orderDate: 'orderDate',
    price: priceWithVat ? 'totalWithVat' : 'totalWOVat',
    kPrice: priceWithVat ? 'totalWithVat' : 'totalWOVat',
  }

  const sort: PipelineStage = { $sort: {} }

  if (sortBy.length > 0)
    sort.$sort = {
      [crossMap[sortBy[0]]]: sortDesc[0] ? 1 : -1,
    }
  else sort.$sort = { orderDate: 1 }
  return [sort]
}
