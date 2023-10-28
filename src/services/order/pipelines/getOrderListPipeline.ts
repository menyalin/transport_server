// @ts-nocheck
import mongoose from 'mongoose'
import { orderDocNumbersStringFragment } from '../../_pipelineFragments/orderDocNumbersStringBuilder'
import { orderDocsStatusConditionBuilder } from '../../_pipelineFragments/orderDocsStatusConditionBuilder'
import { orderLoadingZoneFragmentBuilder } from '../../_pipelineFragments/orderLoadingZoneFragmentBuilder'

const getSortingStage = (sortBy = [], sortDesc = []) => {
  if (!Array.isArray(sortBy) || !sortBy.length)
    return [{ $sort: { createdAt: -1 } }]

  const result = {}

  sortBy.forEach((item, idx) => {
    result[item] = sortDesc[idx] === 'true' ? -1 : 1
  })

  return [{ $sort: result }]
}

export const getOrderListPipeline = ({
  profile,
  client,
  startDate,
  endDate,
  limit,
  skip,
  docStatus,
  invoiceStatus,
  status,
  truck,
  accountingMode,
  driver,
  tkName,
  trailer,
  searchNum,
  loadingZone,
  address,
  sortBy,
  sortDesc,
}) => {
  const sP = new Date(startDate)
  const eP = new Date(endDate)

  const firstMatcher = {
    $match: {
      isActive: true,
      company: new mongoose.Types.ObjectId(profile),
      $expr: {
        $and: [
          { $gte: ['$startPositionDate', sP] },
          { $lt: ['$startPositionDate', eP] },
        ],
      },
    },
  }

  if (accountingMode)
    firstMatcher.$match.$expr.$and.push({
      $or: [
        { $eq: ['$state.status', 'inProgress'] },
        { $eq: ['$state.status', 'completed'] },
      ],
    })

  if (status && !accountingMode) firstMatcher.$match['state.status'] = status
  if (client)
    firstMatcher.$match['client.client'] = new mongoose.Types.ObjectId(client)

  if (truck)
    firstMatcher.$match['confirmedCrew.truck'] = new mongoose.Types.ObjectId(
      truck
    )
  if (trailer)
    firstMatcher.$match['confirmedCrew.trailer'] = new mongoose.Types.ObjectId(
      // eslint-disable-next-line comma-dangle
      trailer
    )
  if (address)
    firstMatcher.$match['route.address'] = new mongoose.Types.ObjectId(address)

  const agreementLookup = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'client.agreement',
        foreignField: '_id',
        as: 'agreement',
      },
    },
    {
      $addFields: {
        agreement: {
          $first: '$agreement',
        },
      },
    },
  ]

  const tkNameLookup = [
    // TODO: удалить!!
    // {
    //   $lookup: {
    //     from: 'trucks',
    //     localField: 'confirmedCrew.truck',
    //     foreignField: '_id',
    //     as: 'truck',
    //   },
    // },
    // {
    //   $addFields: {
    //     truck: {
    //       $first: '$truck',
    //     },
    //   },
    // },
    {
      $match: { 'confirmedCrew.tkName': new mongoose.Types.ObjectId(tkName) },
    },
  ]

  const addSortFields = [
    {
      $addFields: {
        plannedDate: {
          $getField: {
            field: 'plannedDate',
            input: { $first: '$route' },
          },
        },
        driver: '$confirmedCrew.driver',
        truck: '$confirmedCrew.truck',
        docNumbers: orderDocNumbersStringFragment({
          docsFieldName: '$docs',
          onlyForAddToRegistry: false,
        }),
      },
    },
  ]

  const loadingZoneLookup = orderLoadingZoneFragmentBuilder()

  if (driver)
    firstMatcher.$match['confirmedCrew.driver'] = new mongoose.Types.ObjectId(
      // eslint-disable-next-line comma-dangle
      driver
    )
  if (docStatus)
    firstMatcher.$match.$expr.$and.push(
      orderDocsStatusConditionBuilder(docStatus)
    )

  if (searchNum) {
    firstMatcher.$match.$expr.$and.push({
      $or: [
        {
          $regexMatch: { input: '$client.num', regex: searchNum, options: 'i' },
        },
        {
          $regexMatch: {
            input: '$client.auctionNum',
            regex: searchNum,
            options: 'i',
          },
        },
        {
          $gte: [
            {
              $size: {
                $filter: {
                  input: '$docs',
                  cond: {
                    $regexMatch: {
                      input: '$$this.number',
                      regex: searchNum,
                      options: 'i',
                    },
                  },
                },
              },
            },
            1,
          ],
        },
      ],
    })
  }

  const secondMatcher = {
    $match: {
      $expr: {
        $and: [],
      },
    },
  }

  if (loadingZone) {
    secondMatcher.$match.$expr.$and.push({
      $in: [new mongoose.Types.ObjectId(loadingZone), '$_loadingZoneIds'],
    })
  }

  const group = [
    ...getSortingStage(sortBy, sortDesc),
    {
      $group: {
        _id: 'orders',
        items: {
          $push: '$$ROOT',
        },
      },
    },
    {
      $addFields: {
        acceptedDocs: {
          $size: {
            $filter: {
              input: '$items',
              cond: {
                ...orderDocsStatusConditionBuilder(
                  'accepted',
                  '$$this.docs',
                  '$$this.docsState.getted'
                ),
              },
            },
          },
        },
        needFixDocs: {
          $size: {
            $filter: {
              input: '$items',
              cond: {
                ...orderDocsStatusConditionBuilder(
                  'needFix',
                  '$$this.docs',
                  '$$this.docsState.getted'
                ),
              },
            },
          },
        },
        onCheckDocs: {
          $size: {
            $filter: {
              input: '$items',
              cond: {
                ...orderDocsStatusConditionBuilder(
                  'onCheck',
                  '$$this.docs',
                  '$$this.docsState.getted'
                ),
              },
            },
          },
        },
        missingDocs: {
          $size: {
            $filter: {
              input: '$items',
              cond: {
                ...orderDocsStatusConditionBuilder(
                  'missing',
                  '$$this.docs',
                  '$$this.docsState.getted'
                ),
              },
            },
          },
        },

        count: {
          $size: '$items',
        },
        items: {
          $slice: ['$items', +skip, +limit],
        },
      },
    },
  ]

  const paymentInvoiceLookup = [
    {
      $lookup: {
        from: 'ordersInPaymentInvoices',
        let: { orderId: '$_id' },
        pipeline: [{ $match: { $expr: { $eq: ['$order', '$$orderId'] } } }],
        as: '_invoices',
      },
    },
    {
      $match: {
        $expr: {
          $eq: [{ $size: '$_invoices' }, invoiceStatus === 'included' ? 1 : 0],
        },
      },
    },
    {
      $unset: ['_invoices', 'agreements'],
    },
  ]

  let pipeline = [
    firstMatcher,
    ...loadingZoneLookup,
    ...addSortFields,
    secondMatcher,
    ...agreementLookup,
  ]

  if (tkName) pipeline = [...pipeline, ...tkNameLookup]
  if (invoiceStatus) pipeline = [...pipeline, ...paymentInvoiceLookup]

  return [...pipeline, ...group]
}
