import mongoose from 'mongoose'
import { BadRequestError } from '../../../helpers/errors.js'
import { orderLoadingZoneFragmentBuilder } from '../../_pipelineFragments/orderLoadingZoneFragmentBuilder.js'
import { orderDocsStatusConditionBuilder } from '../../_pipelineFragments/orderDocsStatusConditionBuilder.js'

export const getPickOrdersPipeline = ({
  company,
  client,
  allowedLoadingPoints,
  docStatus,
  truck,
  driver,
}) => {
  if (!company || !client)
    throw new BadRequestError('getPickOrdersPipeline: bad request params')

  const firstMatcher = {
    $match: {
      'state.status': 'completed',
      isActive: true,
      company: mongoose.Types.ObjectId(company),
      'client.client': mongoose.Types.ObjectId(client),
      $expr: {
        $and: [],
      },
    },
  }
  if (allowedLoadingPoints && allowedLoadingPoints.length > 0)
    firstMatcher.$match.$expr.$and.push({
      $in: [
        { $getField: { field: 'address', input: { $first: '$route' } } },
        allowedLoadingPoints.map((p) => mongoose.Types.ObjectId(p)),
      ],
    })

  if (docStatus)
    firstMatcher.$match.$expr.$and.push(
      orderDocsStatusConditionBuilder(docStatus)
    )

  if (truck)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.truck', mongoose.Types.ObjectId(truck)],
    })

  if (driver)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.driver', mongoose.Types.ObjectId(driver)],
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

  return [
    firstMatcher,
    ...docsRegistryFilter,
    { $limit: 20 },
    ...orderLoadingZoneFragmentBuilder(),
  ]
}
