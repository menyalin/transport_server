// @ts-nocheck
import mongoose from 'mongoose'

const ifNoReturnInRouteCond = () => ({
  $eq: [
    { $size: { $filter: { input: '$route', cond: '$$this.isReturn' } } },
    0,
  ],
})

const ifPltReturnCond = () => ({
  $gt: [
    { $size: { $filter: { input: '$route', cond: '$$this.isPltReturn' } } },
    0,
  ],
})

const getReturnTariff = (pltReturn = false) => ({
  $first: {
    $filter: {
      input: '$_returnTariffs',
      cond: { $eq: ['$$this.isPltReturn', pltReturn] },
    },
  },
})

export default function (company) {
  return [
    {
      $lookup: {
        from: 'salaryTariffs',
        let: {
          orderDate: '$_orderPeriodDate',
          orderType: '$analytics.type',
          client: '$client.client',
          tkName: '$confirmedCrew.tkName',
          liftCapacity: '$_truck.liftCapacityType',
          consigneeType: '$_consigneeType.value',
        },
        pipeline: [
          {
            $match: {
              company: mongoose.Types.ObjectId(company),
              isActive: true,
              $expr: {
                $and: [
                  { $eq: ['$type', 'return'] },
                  { $gte: ['$$orderDate', '$date'] },
                  { $eq: ['$$orderType', '$orderType'] },
                  { $in: ['$$client', { $ifNull: ['$clients', []] }] },
                  { $in: ['$$tkName', '$tks'] },
                  { $in: ['$$liftCapacity', '$liftCapacity'] },
                  { $in: ['$$consigneeType', '$consigneeTypes'] },
                ],
              },
            },
          },
          { $sort: { date: -1, sum: 1 } },
        ],
        as: '_returnTariffs',
      },
    },
    {
      $addFields: {
        _returnTariff: {
          $switch: {
            branches: [
              // если возврата нет вообще
              { case: ifNoReturnInRouteCond(), then: { sum: 0 } },
              { case: ifPltReturnCond(), then: getReturnTariff(true) },
            ],
            default: getReturnTariff(false),
          },
        },
      },
    },
    {
      $addFields: {
        _returnSum: { $ifNull: ['$_returnTariff.sum', 0] },
      },
    },
  ]
}
