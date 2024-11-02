import { BadRequestError } from '@/helpers/errors'
import { PipelineStage, Types } from 'mongoose'
import { orderDocsStatusConditionBuilder } from '@/shared/pipelineFragments/orderDocsStatusConditionBuilder'
import { orderLoadingZoneFragmentBuilder } from '@/shared/pipelineFragments/orderLoadingZoneFragmentBuilder'
import { orderSearchByNumberFragmentBuilder } from '@/shared/pipelineFragments/orderSearchByNumberFragmentBuilder'

function selectableOrdersFilter(onlySelectable: boolean) {
  if (!onlySelectable) return []
  return [{ $match: { isSelectable: true } }]
}

interface IProps {
  company: string
  client: string
  allowedLoadingPoints?: string[]
  docStatus: string
  onlySelectable: boolean
  truck: string
  driver: string
  loadingZone: string
  period: string[]
  search?: string
  agreement?: string
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
  agreement,
}: IProps): PipelineStage[] => {
  if (!company || !client)
    throw new BadRequestError('getPickOrdersPipeline: bad request params')

  const orderPlannedDateFragment = {
    $getField: {
      field: 'plannedDate',
      input: { $first: '$route' },
    },
  }

  const firstMatcher: PipelineStage.Match = {
    $match: {
      'state.status': 'completed',
      isActive: true,
      company: new Types.ObjectId(company),
      'client.client': new Types.ObjectId(client),
      $expr: {
        $and: [],
      },
    },
  }
  if (agreement)
    firstMatcher.$match['client.agreement'] = new Types.ObjectId(agreement)

  if (period.length === 2)
    firstMatcher.$match.$expr?.$and.push({
      $and: [
        { $gte: [orderPlannedDateFragment, new Date(period[0])] },
        { $lt: [orderPlannedDateFragment, new Date(period[1])] },
      ],
    })

  if (search) {
    firstMatcher.$match.$expr?.$and.push(
      orderSearchByNumberFragmentBuilder(search)
    )
  }

  if (allowedLoadingPoints && allowedLoadingPoints.length > 0)
    firstMatcher.$match.$expr?.$and.push({
      $in: [
        { $getField: { field: 'address', input: { $first: '$route' } } },
        allowedLoadingPoints.map((p) => new Types.ObjectId(p)),
      ],
    })

  if (docStatus)
    firstMatcher.$match.$expr?.$and.push(
      orderDocsStatusConditionBuilder(docStatus)
    )

  if (truck)
    firstMatcher.$match.$expr?.$and.push({
      $eq: ['$confirmedCrew.truck', new Types.ObjectId(truck)],
    })

  if (driver)
    firstMatcher.$match.$expr?.$and.push({
      $eq: ['$confirmedCrew.driver', new Types.ObjectId(driver)],
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
    { $match: { $expr: { $eq: [{ $size: '$docsRegistries' }, 0] } } },
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
  const secondMatcher: PipelineStage.Match = {
    $match: {
      $expr: {
        $and: [],
      },
    },
  }
  if (loadingZone)
    secondMatcher.$match.$expr?.$and.push({
      $in: [new Types.ObjectId(loadingZone), '$_loadingZoneIds'],
    })

  const agreementLookup: PipelineStage[] = [
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
        agreement: { $first: '$agreement' },
      },
    },
  ]

  return [
    firstMatcher,
    ...docsRegistryFilter,
    ...orderLoadingZoneFragmentBuilder(),
    secondMatcher,
    ...addFields,
    ...selectableOrdersFilter(onlySelectable),
    ...agreementLookup,
    { $limit: 40 },
  ]
}
