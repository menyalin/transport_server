import { z } from 'zod'
import mongoose, { PipelineStage } from 'mongoose'
import { ORDER_ANALYTIC_TYPES } from '../../../../constants/order'

import {
  getOrderDocsStatus,
  switchCondition as switchConditionByDocsState,
} from '../fragments/orderDocsStatus'

import { getAddressDetails } from '../fragments/addressDetails'

const variantOfIntervalDaysSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
])

const IPropsSchema = z.object({
  company: z.string(),
  tks: z.array(z.string()).optional(),
  clients: z.array(z.string()).optional(),
  state: z.array(z.string()).optional(),
  truck: z.string().optional(),
  date: z.union([z.string(), z.null()]).optional(),
  driver: z.string().optional(),
  getDocsDays: z.array(variantOfIntervalDaysSchema).optional(),
  reviewDocsDays: z.array(variantOfIntervalDaysSchema).optional(),
})

type VariantOfIntervalDays = z.infer<typeof variantOfIntervalDaysSchema>
type IProps = z.infer<typeof IPropsSchema>

export default (p: IProps): PipelineStage[] => {
  IPropsSchema.parse(p)

  const firstMatcher: PipelineStage.Match = {
    $match: {
      isActive: true,
      'state.status': 'completed',
      company: new mongoose.Types.ObjectId(p.company),
      $expr: {
        $and: [],
      },
    },
  }

  if (p.truck)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.truck', new mongoose.Types.ObjectId(p.truck)],
    })
  if (p.driver)
    firstMatcher.$match.$expr.$and.push({
      $eq: ['$confirmedCrew.driver', new mongoose.Types.ObjectId(p.driver)],
    })
  if (p.date)
    firstMatcher.$match.$expr.$and.push({
      $lt: [
        { $getField: { field: 'plannedDate', input: { $first: '$route' } } },
        new Date(p.date),
      ],
    })

  if (p.tks?.length)
    firstMatcher.$match.$expr.$and.push({
      $in: [
        '$confirmedCrew.tkName',
        p.tks.map((i) => new mongoose.Types.ObjectId(i)),
      ],
    })

  if (p.clients?.length)
    firstMatcher.$match.$expr.$and.push({
      $in: [
        '$client.client',
        p.clients.map((i) => new mongoose.Types.ObjectId(i)),
      ],
    })

  if (p.state?.length)
    firstMatcher.$match.$expr.$and.push({
      $or: p.state.map((i) => switchConditionByDocsState(i)),
    })

  const addFields = [
    {
      $lookup: {
        from: 'tknames',
        localField: 'confirmedCrew.tkName',
        foreignField: '_id',
        as: 'tkName',
      },
    },
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.truck',
        foreignField: '_id',
        as: '_truck',
      },
    },
    {
      $lookup: {
        from: 'trucks',
        localField: 'confirmedCrew.trailer',
        foreignField: '_id',
        as: '_trailer',
      },
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'confirmedCrew.driver',
        foreignField: '_id',
        as: '_driver',
      },
    },
    {
      $lookup: {
        from: 'partners',
        localField: 'client.client',
        foreignField: '_id',
        as: '_client',
      },
    },
    {
      $addFields: { _driver: { $first: '$_driver' } },
    },
    {
      $addFields: {
        clientName: {
          $getField: {
            field: 'name',
            input: { $first: '$_client' },
          },
        },
        driverFullName: {
          $concat: [
            '$_driver.surname',
            ' ',
            '$_driver.name',
            ' ',
            '$_driver.patronymic',
          ],
        },
        truckNumStr: {
          $getField: {
            field: 'regNum',
            input: { $first: '$_truck' },
          },
        },
        trailerNumStr: {
          $getField: {
            field: 'regNum',
            input: { $first: '$_trailer' },
          },
        },
        tkNameStr: {
          $getField: {
            field: 'name',
            input: { $first: '$tkName' },
          },
        },
        orderDate: {
          $getField: {
            field: 'plannedDate',
            input: { $first: '$route' },
          },
        },
        _docsStatusObj: getOrderDocsStatus(),
        getDocsDays: {
          $dateDiff: {
            startDate: {
              $getField: {
                field: 'plannedDate',
                input: { $first: '$route' },
              },
            },
            endDate: { $ifNull: ['$docsState.date', '$$NOW'] },
            unit: 'day',
          },
        },
        reviewDocsDays: {
          $cond: {
            if: { $ne: [{ $ifNull: ['$docsState.date', null] }, null] },
            then: {
              $dateDiff: {
                startDate: '$docsState.date',
                endDate: {
                  $ifNull: [
                    {
                      $getField: { field: 'date', input: { $first: '$docs' } },
                    },
                    '$$NOW',
                  ],
                },
                unit: 'day',
              },
            },
            else: null,
          },
        },
        reviewDate: {
          $getField: {
            input: { $first: '$docs' },
            field: 'date',
          },
        },
        orderTypeStr: {
          $switch: {
            branches: ORDER_ANALYTIC_TYPES.map((item) => ({
              case: { $eq: [item.value, '$analytics.type'] },
              then: item.text,
            })),
            default: 'Ошибка',
          },
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
  if (p.getDocsDays?.length)
    secondMatcher.$match.$expr.$and.push({
      $or: p.getDocsDays.map((i) => daysCondition(i, '$getDocsDays')),
    })

  if (p.reviewDocsDays?.length)
    secondMatcher.$match.$expr.$and.push({
      $or: p.reviewDocsDays.map((i) => daysCondition(i, '$reviewDocsDays')),
    })

  const group = [
    {
      $group: {
        _id: 'reportData',
        items: { $push: '$$ROOT' },
        totalCount: { $count: {} },
      },
    },
    {
      $addFields: {
        notGettedCount: {
          $size: {
            $filter: {
              input: '$items',
              cond: { $eq: ['$$this._docsStatusObj.value', 'notGetted'] },
            },
          },
        },
        reviewCount: {
          $size: {
            $filter: {
              input: '$items',
              cond: { $eq: ['$$this._docsStatusObj.value', 'review'] },
            },
          },
        },
        correctionCount: {
          $size: {
            $filter: {
              input: '$items',
              cond: { $eq: ['$$this._docsStatusObj.value', 'correction'] },
            },
          },
        },
      },
    },
  ]

  return [
    firstMatcher,
    ...addFields,
    ...getAddressDetails(),
    secondMatcher,
    { $limit: 300 },
    { $sort: { orderDate: 1 } },
    ...group,
  ]
}

const daysCondition = (
  intervalVariant: VariantOfIntervalDays,
  fieldName: string
) => {
  // { text: '< 5', value: 1 },
  // { text: '5 - 10', value: 2 },
  // { text: '10 - 20', value: 3 },
  // { text: '20 - 30', value: 4 },
  // { text: ' > 30 ', value: 5 },

  switch (intervalVariant) {
    case 1:
      return {
        $and: [{ $lt: [fieldName, 5] }, { $ne: [fieldName, null] }],
      }
    case 2:
      return {
        $and: [{ $gte: [fieldName, 5] }, { $lt: [fieldName, 10] }],
      }
    case 3:
      return {
        $and: [{ $gte: [fieldName, 10] }, { $lt: [fieldName, 20] }],
      }
    case 4:
      return {
        $and: [{ $gte: [fieldName, 20] }, { $lt: [fieldName, 30] }],
      }
    case 5:
      return {
        $gte: [fieldName, 30],
      }
    default:
      return null
  }
}
