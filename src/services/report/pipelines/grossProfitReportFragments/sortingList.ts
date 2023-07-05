// @ts-nocheck
// import mongoose from 'mongoose'
// const { Types } = mongoose

export const sortingList = ({ sortBy, sortDesc }) => {
  const crossMap = {
    orderDate: 'orderDate',
    price: 'totalWithVat',
    kPrice: 'totalWithVat',
  }

  const sort = {
    $sort: {},
  }
  if (sortBy.length > 0)
    sort.$sort = {
      [crossMap[sortBy[0]]]: sortDesc[0] ? 1 : -1,
    }
  else sort.$sort = { orderDate: 1 }
  return [sort]
}
