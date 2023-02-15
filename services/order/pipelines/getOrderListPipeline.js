import mongoose from 'mongoose'
import { orderDocNumbersStringFragment } from '../../_pipelineFragments/orderDocNumbersStringBuilder.js'
import { orderDocsStatusConditionBuilder } from '../../_pipelineFragments/orderDocsStatusConditionBuilder.js'
import { orderLoadingZoneFragmentBuilder } from '../../_pipelineFragments/orderLoadingZoneFragmentBuilder.js'

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
      company: mongoose.Types.ObjectId(profile),
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
    firstMatcher.$match['client.client'] = mongoose.Types.ObjectId(client)

  if (truck)
    firstMatcher.$match['confirmedCrew.truck'] = mongoose.Types.ObjectId(truck)
  if (trailer)
    firstMatcher.$match['confirmedCrew.trailer'] = mongoose.Types.ObjectId(
      // eslint-disable-next-line comma-dangle
      trailer
    )
  if (address)
    firstMatcher.$match['route.address'] = mongoose.Types.ObjectId(address)

  const agreementLookup = [
    {
      $lookup: {
        from: 'agreements',
        localField: 'client.agreement',
        foreignField: '_id',
        as: 'agreements',
      },
    },
    {
      $addFields: {
        agreement: {
          $first: '$agreements',
        },
      },
    },
  ]
  const tkNameLookup = [
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.truck',
        foreignField: '_id',
        as: 'trucks',
      },
    },
    {
      $addFields: {
        truck: {
          $first: '$trucks',
        },
      },
    },
    {
      $match: { 'truck.tkName': mongoose.Types.ObjectId(tkName) },
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
    firstMatcher.$match['confirmedCrew.driver'] = mongoose.Types.ObjectId(
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
      $in: [mongoose.Types.ObjectId(loadingZone), '$_loadingZoneIds'],
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
  let pipeline = [
    firstMatcher,
    ...loadingZoneLookup,
    ...addSortFields,
    secondMatcher,
    ...agreementLookup,
  ]

  if (tkName) pipeline = [...pipeline, ...tkNameLookup]
  return [...pipeline, ...group]
}
