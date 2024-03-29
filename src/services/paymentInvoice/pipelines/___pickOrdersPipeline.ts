// @ts-nocheck
import mongoose from 'mongoose'
import { BadRequestError } from '../../../helpers/errors'
import { orderLoadingZoneFragmentBuilder } from '../../_pipelineFragments/orderLoadingZoneFragmentBuilder'
import { orderDocsStatusConditionBuilder } from '../../_pipelineFragments/orderDocsStatusConditionBuilder'

function selectableOrdersFilter(onlySelectable) {
  if (!onlySelectable) return []
  return [{ $match: { isSelectable: true } }]
}

export const getPickOrdersPipeline = ({
  company,
  client,
  allowedLoadingPoints,
  docStatus,
  onlySelectable,
  truck,
  driver,
  loadingZone,
  period,
  search,
  limit,
  skip,
}) => {
  if (!company || !client)
    throw new BadRequestError('getPickOrdersPipeline: bad request params')

  const orderPlannedDateFragment = {
    $getField: {
      field: 'plannedDate',
      input: { $first: '$route' },
    },
  }

  const firstMatcher = {
    $match: {
      'state.status': 'completed',
      isActive: true,
      company: new mongoose.Types.ObjectId(company),
      'client.client': new mongoose.Types.ObjectId(client),
      $expr: {
        $and: [],
      },
    },
  }

  if (period.length === 2) {
    firstMatcher.$match.$expr.$and.push({
      $and: [
        { $gte: [orderPlannedDateFragment, new Date(period[0])] },
        { $lt: [orderPlannedDateFragment, new Date(period[1])] },
      ],
    })
  }

  if (search) {
    firstMatcher.$match.$expr.$and.push({
      $or: [
        { $regexMatch: { input: '$client.num', regex: search, options: 'i' } },
        {
          $regexMatch: {
            input: '$client.auctionNum',
            regex: search,
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
                      regex: search,
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

  if (allowedLoadingPoints && allowedLoadingPoints.length > 0)
    firstMatcher.$match.$expr.$and.push({
      $in: [
        { $getField: { field: 'address', input: { $first: '$route' } } },
        allowedLoadingPoints.map((p) => new mongoose.Types.ObjectId(p)),
      ],
    })

  if (docStatus)
    firstMatcher.$match.$expr.$and.push(
      orderDocsStatusConditionBuilder(docStatus)
    )

  if (truck)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.truck', new mongoose.Types.ObjectId(truck)],
    })

  if (driver)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.driver', new mongoose.Types.ObjectId(driver)],
    })

  const docsRegistryFilter = [
    {
      $lookup: {
        from: 'ordersInDocsRegistries',
        localField: '_id',
        foreignField: 'order',
        as: 'docsRegistries',
      },
    },
    {
      $match: { $expr: { $eq: [{ $size: '$docsRegistries' }, 0] } },
    },
  ]
  const addFields = [
    {
      $addFields: {
        isSelectable: {
          $and: [
            {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$docs',
                      cond: { $ne: ['$$this.addToRegistry', false] },
                    },
                  },
                },
                0,
              ],
            },
            {
              $eq: [
                {
                  $size: {
                    $filter: {
                      input: '$docs',
                      cond: {
                        $and: [
                          { $ne: ['$$this.status', 'accepted'] },
                          { $ne: ['$$this.addToRegistry', false] },
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
          ],
        },
      },
    },
  ]
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

  return [
    firstMatcher,
    ...docsRegistryFilter,
    ...orderLoadingZoneFragmentBuilder(),
    secondMatcher,
    ...addFields,
    ...selectableOrdersFilter(onlySelectable),
    { $limit: 30 },
  ]
}
